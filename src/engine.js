import{validate,validateEvent,copy}from './schema.js';
import{buildTopology,projectGroups,randomizedGroups,constrainMemberships}from './topology.js';
import{createNetwork,predict,trainNetwork,validateNetwork,policyProbabilities,sampleProbabilities}from './neural.js';
export{copy};export const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));export const argmax=x=>x.indexOf(Math.max(...x));
// Counter-based draws: channels keep matched experiments aligned despite branching.
export function draw(seed,round,id,channel=0,slot=0){let t=(seed^Math.imul(round+1,0x9e3779b1)^Math.imul(id+1,0x85ebca6b)^Math.imul(channel+1,0xc2b2ae35)^Math.imul(slot+1,0x27d4eb2f))>>>0;t=Math.imul(t^t>>>16,0x7feb352d);t=Math.imul(t^t>>>15,0x846ca68b);return((t^t>>>16)>>>0)/4294967296;}
export const eventChannel=id=>[...id].reduce((h,ch)=>Math.imul(h^ch.charCodeAt(0),16777619)>>>0,2166136261);
const weighted=(xs,r)=>{const total=xs.reduce((v,a)=>v+a.share,0);let n=r*total;for(const x of xs){n-=x.share;if(n<0)return x;}return xs.at(-1);};
export function utilities(a,c){const region=c.regions.find(r=>r.id===a.region)||c.regions[0],den=a.salience.reduce((v,x)=>v+x,0);return c.policies.map((p,k)=>clamp(1-p.positions.reduce((v,x,j)=>v+a.salience[j]*(a.ideal[j]-x)**2,0)/(4*den)+region.benefits[k]));}
export function buildGroups(s){return buildTopology(s,draw);}
export const normalize=values=>{const xs=values.map(v=>Math.max(0,v)),sum=xs.reduce((a,b)=>a+b,0);return sum?xs.map(v=>v/sum):[1/3,1/3,1/3];};
export function aggregate(members,beliefs,config={}){
 const rows=members.map(id=>beliefs[id]).filter(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite));
 if(!rows.length||config.aggregation==='none')return null;
 const mean=[0,1,2].map(k=>rows.reduce((v,b)=>v+b[k],0)/rows.length),mode=config.aggregation||'nonlinear';
 if(mode==='linear')return normalize(mean);
 if(mode==='nonlinear')return normalize(mean.map(v=>Math.max(0,v)**(config.amplification??3)));
 const votes=[0,0,0];for(const row of rows){const max=Math.max(...row),ties=[0,1,2].filter(k=>row[k]===max);for(const k of ties)votes[k]+=1/ties.length;}
 if(mode==='plurality'){const best=Math.max(...votes);return normalize(votes.map(v=>v===best?1:0));}
 if(mode==='threshold'){const accepted=votes.map(v=>v/rows.length>=(config.consensusThreshold??.5)?1:0);return accepted.some(Boolean)?normalize(accepted):null;}
 throw Error('Unknown aggregation');
}
export function create(input={}){const c=validate(input),s={version:4,config:c,round:0,agents:[],groups:[],history:[],eventsLog:[],lastElection:{totals:[0,0,0],winner:null,shares:[0,0,0],turnout:0},selection:0,episodeReturn:0,frames:[],changeTraces:[],topologyHistory:{undo:[],redo:[]},episodeEnded:false};for(let i=0;i<c.population;i++){const com=weighted(c.communities,draw(c.seed,0,i,1)),r=com.home==='any'?weighted(c.regions,draw(c.seed,0,i,2)):c.regions.find(r=>r.id===com.home),a={id:i,communities:[com.id],region:r.id,ideal:com.ideal.map((x,j)=>clamp(x+(draw(c.seed,0,i,3,j)-.5)*2*com.dispersion,-1,1)),salience:[...com.salience],trust:com.trust,susceptibility:com.susceptibility,participation:com.participation,resource:clamp(com.resource+(draw(c.seed,0,i,4)-.5)*.3),media:com.media,metadata:{},x:clamp(r.x+(draw(c.seed,0,i,5)-.5)*.35,.02,.98),y:clamp(r.y+(draw(c.seed,0,i,6)-.5)*.35,.02,.98),distortion:[0,0,0],immunity:0,exposures:0,everExposed:false,infected:false,ballot:[],action:-1,reward:0,return:0,q:Array.from({length:18},()=>Array(8).fill(0)),rewards:[],lastDose:0,lastEvents:[],explored:false,lastUpdate:null,updateHistory:[],latestTrace:null,rewardComponents:null};for(const at of c.attributes)a.metadata[at.key]=at.values[Math.floor(draw(c.seed,0,i,7,c.attributes.indexOf(at))*at.values.length)];a.utility=utilities(a,c);a.belief=[...a.utility];a.anchorBelief=[...a.belief];if(c.learner==='neural')a.neural=createNetwork(c.seed,a.id,c.neuralHidden,draw);s.agents.push(a);}s.groups=buildGroups(s);recordFrame(s);return s;}
export const rankings=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
export const actionCount=c=>(c.rule==='approval'?7:c.rule==='borda'?6:3)+(c.allowAbstain?1:0);
export function ballot(a,action,c){const base=c.rule==='approval'?7:c.rule==='borda'?6:3;if(action===base&&c.allowAbstain)return[];if(!Number.isInteger(action)||action<0||action>=base)throw Error('Invalid action');return c.rule==='plurality'?[action]:c.rule==='approval'?[0,1,2].filter(k=>(action+1)&(1<<k)):[...rankings[action]];}
export function election(ballots,rule,tieBreak='index',tieDraw=0){if(!['plurality','approval','borda'].includes(rule))throw Error('Invalid rule');const totals=[0,0,0];let participants=0;for(const b of ballots){if(!Array.isArray(b)||new Set(b).size!==b.length||b.some(i=>!Number.isInteger(i)||i<0||i>2)||b.length&&rule==='plurality'&&b.length!==1||b.length&&rule==='borda'&&b.length!==3)throw Error('Invalid ballot');if(b.length)participants++;for(let j=0;j<b.length;j++)totals[b[j]]+=rule==='borda'?2-j:1;}const sum=totals.reduce((a,b)=>a+b,0),ties=[0,1,2].filter(i=>totals[i]===Math.max(...totals));return{totals,winner:participants?ties[tieBreak==='seeded'?Math.min(ties.length-1,Math.floor(tieDraw*ties.length)):0]:null,shares:totals.map(v=>sum?v/sum:0),turnout:ballots.length?participants/ballots.length:0};}
export function matches(a,t){return(t.community==='any'||a.communities.includes(t.community))&&(t.region==='any'||a.region===t.region)&&(t.attribute==='none'||a.metadata[t.attribute]===t.value)&&a.resource>=t.resourceMin&&a.resource<=t.resourceMax&&(!t.ids.length||t.ids.includes(a.id));}
export const active=(e,round)=>e.enabled&&round>=e.start&&round<e.start+e.duration;
export const epsilon=s=>Math.max(s.config.epsilonFloor,s.config.epsilon*s.config.epsilonDecay**s.round);
export const qUpdate=(q,r,next,c,terminal)=>q+c.alpha*(r+(terminal?0:c.gamma*next)-q);
export function groupSignals(s){
 const c=s.config,signals=s.agents.map(()=>[0,0,0]),spread=s.agents.map(()=>[0,0,0]),count=s.agents.map(()=>0),contributions=s.agents.map(()=>0),beliefs=s.agents.map(a=>a.belief);
 let budgetUsed=0,attemptedContributions=0;const budget=c.matchingStrategy==='communication'?c.communicationBudget:0;
 if(c.topology!=='none'&&c.aggregation!=='none')for(const g of s.groups){
  if(!g.active)continue;const members=g.members.filter(id=>s.agents[id]);if(members.length<2)continue;const signal=aggregate(members,beliefs,c);if(!signal)continue;
  const mean=[0,1,2].map(k=>members.reduce((v,id)=>v+s.agents[id].belief[k],0)/members.length),top=argmax(mean);
  for(const id of members){const a=s.agents[id];if(Math.abs(a.belief[top]-mean[top])>c.confidence)continue;
   attemptedContributions+=members.length;if(budget&&budgetUsed+members.length>budget)continue;
   budgetUsed+=members.length;contributions[id]+=members.length;count[id]++;
   const others=members.filter(j=>j!==id);
   for(let k=0;k<3;k++){
    signals[id][k]+=signal[k];const infected=others.filter(j=>Math.abs(s.agents[j].distortion[k])>.05).length;
    const gate=c.diffusion==='simple'?infected>0:c.diffusion==='threshold'&&infected/others.length>=c.threshold;
    spread[id][k]+=gate?others.reduce((v,j)=>v+s.agents[j].distortion[k],0)/others.length:0;
   }
  }
 }
 return{signals:signals.map((v,i)=>count[i]?normalize(v):normalize(s.agents[i].belief)),spread:spread.map((v,i)=>v.map(x=>count[i]?x/count[i]:0)),count,contributions,budgetUsed,attemptedContributions,budgetLimit:budget};
}
export function observation(a,signal){return argmax(a.belief)*6+argmax(signal)*2+(Math.max(...a.belief)-Math.min(...a.belief)>.15?1:0);}
function choose(a,s,signal){
 const c=s.config,n=actionCount(c),base=n-(c.allowAbstain?1:0),r=s.round+1;a.explored=false;
 if(c.learner==='random')return Math.floor(draw(c.seed,r,a.id,13)*n);
 if(c.learner==='logit'){
  const scores=Array.from({length:n},(_,action)=>{const b=ballot(a,action,c);return ballotObjective(a.belief,b,c.rule)-Number(b.length>0)*c.votingCost;});
  a.decisionProbabilities=policyProbabilities(scores,c.decisionTemperature);return sampleProbabilities(a.decisionProbabilities,draw(c.seed,r,a.id,75));
 }
 if(c.learner==='sincere'){if(c.allowAbstain&&Math.max(...a.belief)<c.votingCost)return base;const top=argmax(a.belief);return c.rule==='plurality'?top:c.rule==='approval'?(1<<top)-1:rankings.findIndex(rank=>rank.every((k,j)=>k===[0,1,2].sort((x,y)=>a.belief[y]-a.belief[x]||x-y)[j]));}
 a.explored=draw(c.seed,r,a.id,12)<epsilon(s);if(a.explored)return Math.floor(draw(c.seed,r,a.id,13)*n);
 const row=(c.learner==='neural'?predict(a.neural,a.state):a.q[a.state]).slice(0,n),best=Math.max(...row),ties=row.map((v,i)=>v===best?i:-1).filter(i=>i>=0);return ties[Math.floor(draw(c.seed,r,a.id,14)*ties.length)];
}
export function neuralValues(s,id=s.selection){
 const a=s.agents[id];if(!a)throw Error('Unknown agent');if(!a.neural)return null;const n=a.neural,state=a.state??0;
 return{learner:'neural',state,values:predict(n,state).slice(0,actionCount(s.config)),targetValues:predict(n,state,true).slice(0,actionCount(s.config)),hidden:n.hidden,parameters:n.hidden*19+8*(n.hidden+1),updates:n.updates,replaySize:n.replay.length,loss:n.lastLoss,targetCopies:n.targetCopies,gradientNorm:n.lastGradientNorm,observation:'18-state one-hot local observation',architecture:`18 → ${n.hidden} tanh → 8 linear action values`};
}
function applyLearning(a,p,nextState,s,terminal,round){
 const c=s.config;let detail;
 if(c.learner==='neural')detail=trainNetwork(a.neural,{state:p.state,action:p.action,reward:p.reward,nextState:terminal?null:nextState,terminal,round:p.round??round},{actions:actionCount(c),rate:c.neuralRate,batch:c.neuralBatch,capacity:c.neuralReplay,targetEvery:c.neuralTarget,gamma:c.gamma},c.seed,a.id,round,draw);
 else{const qBefore=a.q[p.state][p.action],next=terminal?0:Math.max(...a.q[nextState].slice(0,actionCount(c))),target=p.reward+(terminal?0:c.gamma*next),qAfter=qUpdate(qBefore,p.reward,next,c,terminal);a.q[p.state][p.action]=qAfter;detail={qBefore,qAfter,target,tdError:target-qBefore,learner:'q'};}
 const update={round,actionRound:p.round??round,state:p.state,priorState:p.state,nextState:terminal?null:nextState,action:p.action,reward:p.reward,rewardComponents:copy(p.components||{}),...detail,alpha:c.learner==='neural'?c.neuralRate:c.alpha,gamma:c.gamma,terminal};
 a.lastUpdate=update;a.updateHistory??=[];a.updateHistory.push(update);if(a.updateHistory.length>80)a.updateHistory.shift();return update;
}
export function behavioralBelief(previous,candidate,anchor,config){
 const bias=config.confirmationBias||0,stubborn=config.stubbornness||0;if(!bias&&!stubborn)return candidate;
 const favorite=argmax(previous),adjusted=bias?candidate.map((v,k)=>{const contrary=k===favorite?v<previous[k]:v>previous[k];return contrary?previous[k]+(1-bias)*(v-previous[k]):v;}):candidate;
 return stubborn?adjusted.map((v,k)=>clamp((1-stubborn)*v+stubborn*anchor[k])):adjusted;
}
export function ballotObjective(values,ballot,rule){if(!ballot.length)return 0;if(rule==='borda')return(2*values[ballot[0]]+values[ballot[1]])/3;return ballot.reduce((v,k)=>v+values[k],0)/ballot.length;}
export function rewardComponents(a,signal,w,c,b=a.ballot){
 const raw={outcome:w===null?0:a.utility[w],ballot:ballotObjective(a.utility,b,c.rule),conformity:ballotObjective(signal,b,c.rule),cost:b.length?c.votingCost:0};
 const out={outcome:c.utilityReward*raw.outcome,ballot:c.ballotReward*raw.ballot,conformity:c.conformityReward*raw.conformity,cost:-raw.cost,raw};out.total=out.outcome+out.ballot+out.conformity+out.cost;return out;
}
export function rewardInvariance(s,id=s.selection){
 const a=s.agents[id];if(!a)throw Error('Unknown agent');const signal=groupSignals(s).signals[id],rows=Array.from({length:actionCount(s.config)},(_,action)=>({action,...rewardComponents(a,signal,s.lastElection.winner,s.config,ballot(a,action,s.config))}));
 const components=Object.fromEntries(['outcome','ballot','conformity','cost','total'].map(k=>{const values=rows.map(row=>row[k]),min=Math.min(...values),max=Math.max(...values);return[k,{min,max,range:max-min,invariant:max-min<1e-12}];}));
 return{agent:id,rows,components,conditionalOnWinner:s.lastElection.winner,note:'Outcome utility holds the realized winner fixed; it can vary indirectly when a changed ballot changes the winner.'};
}
function resetEpisode(s){
 for(const a of s.agents){a.utility=utilities(a,s.config);a.belief=[...a.utility];a.distortion=[0,0,0];a.immunity=0;a.exposures=0;a.everExposed=false;a.infected=false;a.ballot=[];a.action=-1;a.pending=null;a.lastDose=0;a.lastEvents=[];}
 s.episodeEnded=false;logChange(s,{kind:'episodeReset',text:'Finite-horizon information state reset; demographics, topology and learned policies persist.'});
}
export function step(s){
 const c=s.config,explorationUsed=epsilon(s),r=s.round+1;if(c.taskMode==='finiteHorizon'&&s.episodeEnded)resetEpisode(s);
 const ev=c.events.filter(e=>active(e,r));for(const e of c.events){if(e.enabled&&e.start===r)s.eventsLog.push({round:r,text:e.name+' started',type:'start',id:e.id});if(e.enabled&&e.start+e.duration===r)s.eventsLog.push({round:r,text:e.name+' ended',type:'end',id:e.id});}
 if(c.topology==='dynamic'&&r%10===0){const before=copy(s.groups),rewired=randomizedGroups(s.groups.filter(g=>!g.manual),c.seed,draw,r);let cursor=0;s.groups=s.groups.map(g=>g.manual?g:rewired[cursor++]);logChange(s,{kind:'rewire',round:r,text:'Degree-preserving dynamic membership swaps',before,after:copy(s.groups)});}
 const before=groupSignals(s),old=s.agents.map(a=>a.action),eventEffects=[];
 s.agents.forEach(a=>{
  const previous={belief:[...a.belief],distortion:[...a.distortion],utility:[...a.utility],immunity:a.immunity,access:a.effectiveAccess??1,action:a.action};a.utility=utilities(a,c);a.lastDose=0;a.lastEvents=[];a.immunity*=1-c.decay*.25;
  let blackout=0,access=0;const shock=[0,0,0],doses=[0,0,0],correction=[0,0,0],effects=[];
  for(const e of ev){if(!matches(a,e.target)||(r-e.start)%e.period!==0||draw(c.seed,r,a.id,eventChannel(e.id))>=e.coverage)continue;
   const strength=e.intensity,entry={eventId:e.id,kind:e.kind,policy:e.policy,intensity:strength,dose:0,correction:0,immunityChange:0,accessChange:0,utilityShock:0,blackout:0};a.lastEvents.push(e.id);
   if(e.kind==='misinformation'){entry.dose=strength*a.trust*a.susceptibility*a.media*(1-a.immunity);doses[e.policy]+=entry.dose;if(entry.dose!==0){a.exposures++;a.everExposed=true;}a.lastDose+=Math.abs(entry.dose);}
   if(e.kind==='correction'){const old=correction[e.policy];correction[e.policy]=clamp(old+Math.abs(strength)*a.trust);entry.correction=correction[e.policy]-old;}
   if(e.kind==='prebunk'){const old=a.immunity;a.immunity=clamp(a.immunity+Math.abs(strength)*a.trust);entry.immunityChange=a.immunity-old;}
   if(e.kind==='blackout'){const old=blackout;blackout=clamp(blackout+Math.abs(strength));entry.blackout=blackout-old;}
   if(e.kind==='access'){access+=strength;entry.accessChange=strength;}
   if(e.kind==='utilityShock'){shock[e.policy]+=strength;entry.utilityShock=strength;}
   effects.push(entry);eventEffects.push({agentId:a.id,...entry});
  }
  a.effectiveAccess=clamp((c.regions.find(x=>x.id===a.region)?.access??1)+access);a.utility=a.utility.map((v,k)=>clamp(v+shock[k]));
  const diffusion=before.spread[a.id].map(v=>c.spread*v*a.susceptibility*(1-a.immunity));
  a.distortion=a.distortion.map((v,k)=>clamp((v*(1-c.decay)+diffusion[k]+doses[k])*(1-correction[k]),-1,1));a.infected=a.distortion.some(x=>Math.abs(x)>.05);
  const evidence=a.utility.map((u,k)=>clamp(u+a.distortion[k]+c.noise*(draw(c.seed,r,a.id,15,k)-.5))),weight=c.influence*(1-blackout);
  const rawBelief=a.belief.map((b,k)=>clamp(c.memory*b+(1-c.memory)*((1-weight)*evidence[k]+weight*before.signals[a.id][k])));a.belief=behavioralBelief(previous.belief,rawBelief,a.anchorBelief||a.utility,c);
  a.latestTrace={round:r,agentId:a.id,before:previous,after:{belief:[...a.belief],distortion:[...a.distortion],utility:[...a.utility],immunity:a.immunity,access:a.effectiveAccess},beforeBelief:[...previous.belief],afterBelief:[...a.belief],events:effects,directEvents:copy(effects),signal:[...before.signals[a.id]],signalCount:before.count[a.id],contributions:before.contributions[a.id],diffusion,directDose:doses,correction,evidence,informationWeight:weight,rawBelief,anchorBelief:[...(a.anchorBelief||a.utility)],stubbornness:c.stubbornness,confirmationBias:c.confirmationBias,learningUpdate:null};
 });
 // One cached communication pass per round. The same received signal informs
 // information updates, observations and conformity; recomputing here would
 // silently spend a second communication budget after beliefs have changed.
 const sig=before;
 for(const a of s.agents){a.state=observation(a,sig.signals[a.id]);if(['q','neural'].includes(c.learner)&&a.pending)a.latestTrace.learningUpdate=applyLearning(a,a.pending,a.state,s,false,r);a.pending=null;a.action=choose(a,s,sig.signals[a.id]);a.ballot=ballot(a,a.action,c);a.forcedAbstain=false;if(a.ballot.length&&c.allowAbstain&&draw(c.seed,r,a.id,16)>clamp(c.turnout*a.participation*a.effectiveAccess)){a.ballot=[];a.forcedAbstain=true;}}
 s.lastElection=election(s.agents.map(a=>a.ballot),c.rule,c.tieBreak,draw(c.seed,r,0,17));const w=s.lastElection.winner,terminal=c.taskMode==='finiteHorizon'&&r%c.episodeLength===0;let reward=0;
 for(const a of s.agents){a.rewardComponents=rewardComponents(a,sig.signals[a.id],w,c);a.reward=a.rewardComponents.total;a.return+=a.reward;reward+=a.reward;
  if(['q','neural'].includes(c.learner)){const pending={state:a.state,action:a.action,reward:a.reward,components:copy(a.rewardComponents),round:r};if(terminal)a.latestTrace.learningUpdate=applyLearning(a,pending,null,s,true,r);else a.pending=pending;}
  a.rewards.push(a.reward);if(a.rewards.length>80)a.rewards.shift();Object.assign(a.latestTrace,{state:a.state,action:a.action,ballot:[...a.ballot],forcedAbstain:a.forcedAbstain,reward:a.reward,rewardComponents:copy(a.rewardComponents),winner:w,terminal});
 }
 s.round=r;s.episodeEnded=terminal;const n=s.agents.length,utilityTotals=[0,1,2].map(k=>s.agents.reduce((v,a)=>v+a.utility[k],0)),best=Math.max(...utilityTotals)/n,welfare=w===null?0:utilityTotals[w]/n,distribution=[0,0,0];s.agents.forEach(a=>{if(a.ballot.length)distribution[a.ballot[0]]++;});
 const shares=[...distribution.map(x=>x/n),1-s.lastElection.turnout],m={round:r,episode:Math.ceil(r/c.episodeLength),winner:w,welfare,bestWelfare:best,regret:best-welfare,reward:reward/n,turnout:s.lastElection.turnout,infected:s.agents.filter(a=>a.infected).length/n,exposed:s.agents.filter(a=>a.everExposed).length/n,dose:s.agents.reduce((v,a)=>v+a.lastDose,0)/n,error:s.agents.reduce((v,a)=>v+a.belief.reduce((z,b,k)=>z+Math.abs(b-a.utility[k]),0)/3,0)/n,epsilon:explorationUsed,actionChanges:s.agents.filter((a,i)=>a.action!==old[i]).length,disagreement:w===null?1:s.agents.filter(a=>argmax(a.utility)!==w).length/n,entropy:-shares.reduce((v,p)=>p?v+p*Math.log(p):v,0),distribution,terminal,taskMode:c.taskMode,communicationContributions:before.budgetUsed};
 if((r-1)%c.episodeLength===0)s.episodeReturn=0;s.episodeReturn+=m.reward;m.episodeReturn=s.episodeReturn;m.activeEvents=ev.map(e=>e.id);s.history.push(m);if(s.history.length>3000)s.history.shift();if(s.eventsLog.length>500)s.eventsLog.shift();
 logChange(s,{round:r,kind:'transition',text:'Recorded information, voting and learning transition',affectedAgents:eventEffects.map(e=>e.agentId).filter((id,i,all)=>all.indexOf(id)===i),eventEffects,beliefChanges:s.agents.filter(a=>a.latestTrace.before.belief.some((v,k)=>v!==a.belief[k])).length,actionChanges:m.actionChanges,winner:w});recordFrame(s);return m;
}
export function configure(s,patch){
 if('population'in patch&&patch.population!==s.agents.length)throw Error('Population changes require a fresh society');
 const next={...s.config,...copy(patch)};if('learning'in patch&&!('learner'in patch))next.learner=patch.learning?'q':'sincere';if('learner'in patch)next.learning=['q','neural'].includes(patch.learner);
 const c=validate(next),previous=copy(s.config),changedKeys=Object.keys(c).filter(k=>JSON.stringify(c[k])!==JSON.stringify(previous[k]));if(!changedKeys.length)return s;
 const changedRule=c.rule!==s.config.rule||c.allowAbstain!==s.config.allowAbstain,topologyChange=changedKeys.some(k=>['topology','grouping','groupSize','overlap','homophily','geographicLocality','bridges','isolation','matchingStrategy','membershipBudget'].includes(k)),oldGroups=copy(s.groups),oldBase=copy(s.baseGroups||[]);
 if(topologyChange)pushTopology(s);s.config=c;
 if(changedRule)for(const a of s.agents){a.q=Array.from({length:18},()=>Array(8).fill(0));a.pending=null;a.ballot=[];a.action=-1;a.lastUpdate=null;a.updateHistory=[];}
 for(const a of s.agents){
  if(changedRule&&a.neural||changedKeys.includes('neuralHidden')&&a.neural){a.neural=createNetwork(c.seed,a.id,c.neuralHidden,draw);if(changedRule||c.learner==='neural'){a.pending=null;if(a.lastUpdate?.learner==='neural'){a.lastUpdate=null;a.updateHistory=[];}}}
  if(c.learner==='neural'&&!a.neural)a.neural=createNetwork(c.seed,a.id,c.neuralHidden,draw);
  if(a.neural&&a.neural.replay.length>c.neuralReplay)a.neural.replay=a.neural.replay.slice(-c.neuralReplay);
 }
 if(changedRule)s.lastElection={totals:[0,0,0],winner:null,shares:[0,0,0],turnout:0};
 if(['learner','learning','taskMode','episodeLength'].some(k=>changedKeys.includes(k)))for(const a of s.agents)a.pending=null;
 if(changedKeys.includes('taskMode'))s.episodeEnded=false;
 if(topologyChange){
  const onlyMode=changedKeys.includes('topology')&&!changedKeys.some(k=>['grouping','groupSize','overlap','homophily','geographicLocality','bridges','isolation'].includes(k));
  if(onlyMode&&['clique','randomized','hypergraph','dynamic'].includes(c.topology)&&['hypergraph','dynamic','randomized','clique','none'].includes(previous.topology)){
   const source=['clique','none'].includes(previous.topology)?oldBase:oldGroups;s.baseGroups=copy(source);s.groups=c.topology==='clique'?projectGroups(source):c.topology==='randomized'?randomizedGroups(source,c.seed,draw):copy(source);
  }else{const manual=oldGroups.filter(g=>g.manual&&!g.sourceGroup);s.groups=[...buildGroups(s),...manual];}
  if(c.matchingStrategy==='membership')s.groups=constrainMemberships(s.groups,c.membershipBudget);
 }
 const change={round:s.round,text:Object.keys(patch).join(', ')+' changed'+(changedRule?' (incompatible learned policies reset)':''),type:'edit'};s.eventsLog.push(change);logChange(s,{kind:'configuration',text:change.text,before:previous,after:copy(c),qReset:changedRule});recordFrame(s);return s;
}
export function addEvent(s,event){const e=validateEvent(event,s.config);if(s.config.events.length>=40)throw Error('Maximum 40 events');if(s.config.events.some(x=>x.id===e.id))throw Error('Duplicate event ID');s.config.events.push(e);logChange(s,{kind:'eventScheduled',event:copy(e),text:'Scheduled '+e.name});recordFrame(s);s.eventsLog.push({round:s.round,text:'Scheduled '+e.name,type:'schedule',id:e.id});return e;}
export function cohort(s,filter=()=>true){const as=s.agents.filter(filter),w=s.lastElection.winner,n=as.length;return{n,welfare:n&&w!==null?as.reduce((v,a)=>v+a.utility[w],0)/n:0,turnout:n?as.filter(a=>a.ballot.length).length/n:0,infected:n?as.filter(a=>a.infected).length/n:0,everExposed:n?as.filter(a=>a.everExposed).length/n:0,error:n?as.reduce((v,a)=>v+a.belief.reduce((z,b,k)=>z+Math.abs(b-a.utility[k]),0)/3,0)/n:0,preferences:[0,1,2].map(k=>as.filter(a=>argmax(a.utility)===k).length),ballots:[0,1,2].map(k=>as.filter(a=>a.ballot[0]===k).length)};}
export function diagnostics(s){
 const memberships=s.agents.map(()=>0),parent=s.agents.map(a=>a.id),root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;},active=s.groups.filter(g=>g.active);
 for(const g of active)for(const id of g.members){memberships[id]++;parent[root(id)]=root(g.members[0]);}
 const signals=groupSignals(s),sizes=active.map(g=>g.members.length),incidences=sizes.reduce((a,b)=>a+b,0),potentialContributions=sizes.reduce((a,b)=>a+b*b,0);
 return{population:s.agents.length,groups:active.length,hyperedges:active.filter(g=>g.members.length>2).length,pairwiseEdges:active.filter(g=>g.members.length===2).length,isolated:memberships.filter(n=>!n).length,components:new Set(s.agents.map(a=>root(a.id))).size,memberships,sizes,baseGroups:s.baseGroups?.length??0,baseSizes:(s.baseGroups||[]).map(g=>g.members.length),incidences,membershipBudget:s.config.membershipBudget,incidenceBudget:s.config.membershipBudget,communicationBudget:s.config.communicationBudget,potentialContributions,actualContributions:signals.budgetUsed,contributions:signals.contributions,matchingStrategy:s.config.matchingStrategy,aggregation:s.config.aggregation,topology:s.config.topology,grouping:s.config.grouping,informationExposure:'Deterministic active-group order; each accepted recipient/group signal costs group size contributions, including self. Diffusion excludes the recipient.',warnings:[...(s.config.matchingStrategy==='membership'&&s.config.membershipBudget>0&&incidences>s.config.membershipBudget?['Manual edits exceed the generated-topology incidence cap; this topology is no longer budget matched.']:[]),...(s.config.topology==='clique'?['Clique projection retains one pair for every source-group pair; repeated pairs remain separate messages and usually increase cost.']:[]),...(s.config.matchingStrategy==='groupSizes'&&['pairwise','clique'].includes(s.config.topology)?['Pairwise modes cannot match higher-order group sizes.']:[]),...(s.config.matchingStrategy==='communication'&&s.config.communicationBudget===0?['Communication budget 0 is unconstrained.']:[])]};
}
export function editAgent(s,id,patch){for(const k of Object.keys(patch))if(!['region','communities','ideal','trust','susceptibility','participation','resource','media','metadata'].includes(k))throw Error('Unknown editable agent field: '+k);const a=s.agents[id];if(!a)throw Error('Unknown agent');const candidate={...copy(a),...copy(patch)};for(const key of ['trust','susceptibility','participation','resource','media'])if(!Number.isFinite(candidate[key])||candidate[key]<0||candidate[key]>1)throw Error('Invalid '+key);if(!s.config.regions.some(r=>r.id===candidate.region))throw Error('Unknown region');if(!Array.isArray(candidate.communities)||!candidate.communities.length||new Set(candidate.communities).size!==candidate.communities.length||candidate.communities.some(id=>!s.config.communities.some(c=>c.id===id)))throw Error('Invalid community membership');if(!Array.isArray(candidate.ideal)||candidate.ideal.length!==3||candidate.ideal.some(v=>!Number.isFinite(v)||v< -1||v>1))throw Error('Invalid ideal');for(const at of s.config.attributes)if(!at.values.includes(candidate.metadata[at.key]))throw Error('Invalid metadata');const moved=a.region!==candidate.region;Object.assign(a,candidate);if(moved){const r=s.config.regions.find(r=>r.id===a.region);a.x=clamp(r.x+(draw(s.config.seed,s.round,a.id,5)-.5)*.35,.02,.98);a.y=clamp(r.y+(draw(s.config.seed,s.round,a.id,6)-.5)*.35,.02,.98);}a.utility=utilities(a,s.config);s.eventsLog.push({round:s.round,text:'Edited synthetic agent '+id,type:'edit'});logChange(s,{kind:'agentEdit',text:'Edited synthetic agent '+id,agentId:id,patch:copy(patch)});recordFrame(s);}
function validGroup(s,g){if(typeof g.name!=='string'||g.name.length>60||!g.name.trim()||/[<>\x00-\x1f]/.test(g.name))throw Error('Invalid group name');if(!Array.isArray(g.members)||g.members.length<2||g.members.length>50||new Set(g.members).size!==g.members.length||g.members.some(i=>!Number.isInteger(i)||!s.agents[i]))throw Error('Use 2–50 unique valid agent IDs');if(typeof g.active!=='boolean')throw Error('Invalid active flag');}
function topologySnapshot(s){return{groups:copy(s.groups),baseGroups:copy(s.baseGroups||[]),config:Object.fromEntries(['topology','grouping','groupSize','overlap','homophily','geographicLocality','bridges','isolation','matchingStrategy','membershipBudget'].map(k=>[k,s.config[k]]))};}
function pushTopology(s){s.topologyHistory??={undo:[],redo:[]};s.topologyHistory.undo.push(topologySnapshot(s));if(s.topologyHistory.undo.length>25)s.topologyHistory.undo.shift();s.topologyHistory.redo=[];}
export function addGroup(s,name,members){const g={id:'manual'+(s.groupSequence=(s.groupSequence??0)+1)+'r'+s.round,name,members:[...members],active:true,manual:true};validGroup(s,g);if(s.groups.length>=200000)throw Error('Group limit reached');pushTopology(s);s.groups.push(g);logChange(s,{kind:'groupAdded',groupId:g.id,text:'Created '+name,after:copy(g)});recordFrame(s);return g;}
export function editGroup(s,id,patch){if(Object.keys(patch).some(k=>!['name','members','active'].includes(k)))throw Error('Unknown group field');const index=s.groups.findIndex(g=>g.id===id);if(index<0)throw Error('Unknown group');const before=copy(s.groups[index]),next={...before,...copy(patch),manual:true};validGroup(s,next);pushTopology(s);s.groups[index]=next;logChange(s,{kind:'groupEdited',groupId:id,text:'Edited '+next.name,before,after:copy(next)});recordFrame(s);return next;}
export function removeGroup(s,id){const g=s.groups.find(g=>g.id===id);if(!g)throw Error('Unknown group');pushTopology(s);s.groups=s.groups.filter(g=>g.id!==id);logChange(s,{kind:'groupDeleted',groupId:id,text:'Deleted '+g.name,before:copy(g)});recordFrame(s);return g;}
export const deleteGroup=removeGroup;
function moveTopology(s,from,to){s.topologyHistory??={undo:[],redo:[]};const target=s.topologyHistory[from].pop();if(!target)return false;s.topologyHistory[to].push(topologySnapshot(s));s.groups=copy(target.groups);s.baseGroups=copy(target.baseGroups);Object.assign(s.config,target.config);logChange(s,{kind:'topology'+from,text:from==='undo'?'Undid topology edit':'Redid topology edit'});recordFrame(s);return true;}
export const undoTopology=s=>moveTopology(s,'undo','redo');export const redoTopology=s=>moveTopology(s,'redo','undo');export const topologyUndo=undoTopology;export const topologyRedo=redoTopology;
export function randomizeGroups(s){pushTopology(s);const before=copy(s.groups);s.groups=randomizedGroups(s.groups,s.config.seed,draw,s.round+1);logChange(s,{kind:'groupsRandomized',text:'Degree-preserving membership swaps',before,after:copy(s.groups)});recordFrame(s);return s.groups;}
export function projectClique(s){return projectGroups(['hypergraph','dynamic','randomized'].includes(s.config.topology)?s.groups:(s.baseGroups||s.groups));}
function logChange(s,entry){s.changeTraces??=[];s.changeTraces.push({round:s.round,...entry});if(s.changeTraces.length>500)s.changeTraces.shift();}
export function captureFrame(s){const agents=s.agents.map(({updateHistory,rewards,...a})=>({...a,updateHistory:[],rewards:[]}));return copy({version:4,config:s.config,round:s.round,agents,groups:s.groups,baseGroups:s.baseGroups||[],lastElection:s.lastElection,selection:s.selection,episodeReturn:s.episodeReturn,episodeEnded:s.episodeEnded,history:s.history.slice(-150),eventsLog:s.eventsLog.slice(-100),changeTraces:(s.changeTraces||[]).slice(-5),historicalFrame:true});}
function recordFrame(s){if(!s.config.recordFrames||s.recordFrames===false)return;s.frames??=[];s.frameSizes??=s.frames.map(f=>JSON.stringify(f).length);const frame=captureFrame(s),size=JSON.stringify(frame).length;if(s.frames.at(-1)?.round===s.round){s.frames[s.frames.length-1]=frame;s.frameSizes[s.frameSizes.length-1]=size;}else{s.frames.push(frame);s.frameSizes.push(size);}const limit=Math.min(s.config.frameLimit,Math.max(1,Math.floor(6000/s.agents.length)));let bytes=s.frameSizes.reduce((v,n)=>v+n,0);while(s.frames.length>limit||(bytes>12*1024*1024&&s.frames.length>1)){s.frames.shift();bytes-=s.frameSizes.shift();}}
export function frameAt(s,round){const frame=s.frames?.find(f=>f.round===Number(round));return frame?copy(frame):null;}
export const frameToState=frame=>copy(frame);
export const checkpoint=s=>copy(s);
function validateLearningRecord(u){if(!u||typeof u!=='object')throw Error('Invalid learning record');for(const key of ['round','actionRound','state','priorState','action'])if(!Number.isInteger(u[key])||u[key]<0)throw Error('Invalid learning record '+key);if(u.state>17||u.priorState>17||u.action>7||typeof u.terminal!=='boolean'||(u.terminal?u.nextState!==null:!Number.isInteger(u.nextState)||u.nextState<0||u.nextState>17))throw Error('Invalid learning transition');for(const key of ['qBefore','qAfter','target','tdError','alpha','gamma','reward'])if(!Number.isFinite(u[key]))throw Error('Invalid learning value');if(u.learner==='neural'){for(const key of ['loss','gradientNorm','gradientScale'])if(!Number.isFinite(u[key])||u[key]<0)throw Error('Invalid neural learning record');if(!Number.isInteger(u.batchSize)||u.batchSize<1||u.batchSize>16||!Number.isInteger(u.replaySize)||u.replaySize<1||u.replaySize>256||typeof u.targetCopied!=='boolean'||!Number.isInteger(u.networkUpdates)||u.networkUpdates<1)throw Error('Invalid neural learning history');}}
function validateFrame(f,c){if(!f||!f.historicalFrame||!Number.isInteger(f.round)||f.round<0||!Array.isArray(f.agents)||f.agents.length!==c.population||!Array.isArray(f.groups)||f.groups.length>200000||!Array.isArray(f.history)||f.history.length>150)throw Error('Invalid historical frame');for(const[i,a]of f.agents.entries()){if(a.id!==i||!Array.isArray(a.q)||a.q.length!==18||a.q.some(row=>!Array.isArray(row)||row.length!==8||row.some(v=>!Number.isFinite(v))))throw Error('Invalid historical policy');for(const key of ['belief','distortion','utility'])if(!Array.isArray(a[key])||a[key].length!==3||a[key].some(v=>!Number.isFinite(v)))throw Error('Invalid historical vector');if(a.neural){validateNetwork(a.neural,actionCount(f.config||c));if(a.neural.hidden!==(f.config?.neuralHidden??c.neuralHidden)||a.neural.replay.length>(f.config?.neuralReplay??256))throw Error('Historical neural configuration mismatch');}if(f.config?.learner==='neural'&&!a.neural)throw Error('Missing historical neural policy');if(a.anchorBelief&&(!Array.isArray(a.anchorBelief)||a.anchorBelief.length!==3||a.anchorBelief.some(v=>!Number.isFinite(v)||v<0||v>1)))throw Error('Invalid historical anchor');}for(const g of f.groups)if(!Array.isArray(g.members)||g.members.some(id=>!Number.isInteger(id)||id<0||id>=c.population))throw Error('Invalid historical group');}
export function restore(input){
 if(!input||![2,3,4].includes(input.version))throw Error('Expected V2, V3 or V4 checkpoint');if(input.historicalFrame)throw Error('Historical frames are for inspection; resume from a full checkpoint');const s=copy(input);s.config=validate(s.config);s.version=4;
 if(!Number.isInteger(s.round)||s.round<0||!Array.isArray(s.agents)||s.agents.length!==s.config.population||!Array.isArray(s.history)||s.history.length>3000||!Array.isArray(s.groups)||s.groups.length>200000||!Array.isArray(s.eventsLog)||s.eventsLog.length>500||!Number.isInteger(s.selection)||s.selection<0||s.selection>=s.agents.length||!Number.isFinite(s.episodeReturn))throw Error('Invalid checkpoint shape');
 for(const[i,a]of s.agents.entries()){
  if(a.anchorBelief===undefined){if(input.version===4)throw Error('Missing initial belief anchor');a.anchorBelief=[...a.belief];}if(!Array.isArray(a.anchorBelief)||a.anchorBelief.length!==3||a.anchorBelief.some(v=>!Number.isFinite(v)||v<0||v>1))throw Error('Invalid initial belief anchor');
  if(a.neural){validateNetwork(a.neural,actionCount(s.config));if(a.neural.hidden!==s.config.neuralHidden||a.neural.replay.length>s.config.neuralReplay)throw Error('Neural configuration mismatch');}if(s.config.learner==='neural'&&!a.neural){if(input.version===4)throw Error('Missing neural policy');a.neural=createNetwork(s.config.seed,a.id,s.config.neuralHidden,draw);}
  if(a.id!==i||!Array.isArray(a.q)||a.q.length!==18||a.q.some(row=>!Array.isArray(row)||row.length!==8||row.some(x=>!Number.isFinite(x))))throw Error('Invalid policy table');
  for(const key of ['belief','utility','distortion','ideal','salience'])if(!Array.isArray(a[key])||a[key].length!==3||a[key].some(x=>!Number.isFinite(x)))throw Error('Invalid agent vector');
  if(a.belief.some(x=>x<0||x>1)||a.utility.some(x=>x<0||x>1)||a.distortion.some(x=>x< -1||x>1)||a.ideal.some(x=>x< -1||x>1)||a.salience.some(x=>x<=0))throw Error('Invalid vector bounds');
  for(const k of ['trust','susceptibility','participation','resource','media','immunity','x','y'])if(!Number.isFinite(a[k])||a[k]<0||a[k]>1)throw Error('Invalid agent '+k);
  if(!s.config.regions.some(r=>r.id===a.region)||!Array.isArray(a.communities)||!a.communities.length||new Set(a.communities).size!==a.communities.length||a.communities.some(g=>!s.config.communities.some(c=>c.id===g)))throw Error('Invalid membership');
  if(!a.metadata||s.config.attributes.some(at=>!at.values.includes(a.metadata[at.key])))throw Error('Invalid metadata');
  if(!Array.isArray(a.rewards)||a.rewards.length>80||a.rewards.some(v=>!Number.isFinite(v))||!Number.isFinite(a.reward)||!Number.isFinite(a.return)||!Number.isInteger(a.exposures)||a.exposures<0||!Number.isFinite(a.lastDose)||!Array.isArray(a.lastEvents)||!Number.isInteger(a.action)||a.action< -1||a.action>7)throw Error('Invalid agent history');
  if(a.state!==undefined&&(!Number.isInteger(a.state)||a.state<0||a.state>17))throw Error('Invalid observation');
  if(a.pending&&(!Number.isInteger(a.pending.state)||a.pending.state<0||a.pending.state>17||!Number.isInteger(a.pending.action)||a.pending.action<0||a.pending.action>=actionCount(s.config)||!Number.isFinite(a.pending.reward)))throw Error('Invalid pending update');
  if(a.lastUpdate)validateLearningRecord(a.lastUpdate);if(a.updateHistory!==undefined){if(!Array.isArray(a.updateHistory)||a.updateHistory.length>80)throw Error('Invalid learning history');a.updateHistory.forEach(validateLearningRecord);}
  if(a.latestTrace){const t=a.latestTrace;if(!Number.isInteger(t.round)||t.round<1||!Array.isArray(t.beforeBelief)||!Array.isArray(t.afterBelief)||t.beforeBelief.length!==3||t.afterBelief.length!==3||[...t.beforeBelief,...t.afterBelief].some(v=>!Number.isFinite(v)))throw Error('Invalid transition trace');}
  election([a.ballot],s.config.rule);
 }
 for(const g of s.groups)if(typeof g.id!=='string'||typeof g.name!=='string'||typeof g.active!=='boolean'||!Array.isArray(g.members)||g.members.length<2||g.members.length>50||new Set(g.members).size!==g.members.length||g.members.some(i=>!Number.isInteger(i)||!s.agents[i]))throw Error('Invalid group');
 if(new Set(s.groups.map(g=>g.id)).size!==s.groups.length)throw Error('Duplicate group IDs');
 for(const m of s.history)for(const k of ['round','episode','welfare','reward','turnout','infected','error','regret','epsilon'])if(!Number.isFinite(m[k]))throw Error('Invalid metric history');
 for(const e of s.eventsLog)if(!Number.isInteger(e.round)||typeof e.text!=='string'||typeof e.type!=='string')throw Error('Invalid event ledger');
 if(!s.lastElection||!Array.isArray(s.lastElection.totals)||s.lastElection.totals.length!==3||s.lastElection.totals.some(v=>!Number.isFinite(v)||v<0)||![null,0,1,2].includes(s.lastElection.winner))throw Error('Invalid election');s.frames??=[];s.baseGroups??=[];s.changeTraces??=[];s.topologyHistory??={undo:[],redo:[]};s.episodeEnded??=false;for(const a of s.agents){a.lastUpdate??=null;a.updateHistory??=[];a.latestTrace??=null;a.rewardComponents??=null;}if(!Array.isArray(s.frames)||s.frames.length>120||!Array.isArray(s.changeTraces)||s.changeTraces.length>500||!Array.isArray(s.topologyHistory.undo)||!Array.isArray(s.topologyHistory.redo)||s.topologyHistory.undo.length>25||s.topologyHistory.redo.length>25)throw Error('Invalid checkpoint histories');s.frames.forEach(f=>validateFrame(f,s.config));if(s.frameSizes!==undefined){if(!Array.isArray(s.frameSizes)||s.frameSizes.some(v=>!Number.isFinite(v)||v<0))throw Error('Invalid frame bookkeeping');if(s.frameSizes.length!==s.frames.length)s.frameSizes=s.frames.map(f=>JSON.stringify(f).length);}for(const snapshot of [...s.topologyHistory.undo,...s.topologyHistory.redo]){if(!Array.isArray(snapshot.groups)||snapshot.groups.length>200000||!snapshot.config)throw Error('Invalid topology history');for(const g of snapshot.groups)validGroup(s,g);validate({...s.config,...snapshot.config});}return s;
}
