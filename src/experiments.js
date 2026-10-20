import {create, step, configure, copy, restore, diagnostics, draw} from './engine.js';
import {validate} from './schema.js';

export const experimentLimits=Object.freeze({pairRounds:1000,maxFrames:100,frameQValues:1500000,sweepCells:49,sweepSeeds:12,sweepRounds:500,sweepSteps:50000,agentUpdates:6000000});
export const metrics=['welfare','error','turnout','infected','reward','regret','disagreement','entropy','exposed','dose','communicationContributions'];
export const templates={topology:{base:{topology:'hypergraph'},patch:{topology:'clique'}},influence:{base:{influence:.1},patch:{influence:.7}},learning:{base:{learner:'sincere',learning:false},patch:{learner:'q',learning:true}},fragmentation:{base:{isolation:0},patch:{isolation:.5}},misinformation:{base:{events:[]},patch:{events:[{id:'false1',name:'Synthetic C signal',kind:'misinformation',policy:2,start:20,duration:30,period:1,intensity:.7,coverage:.7,enabled:true,target:{community:'any',region:'any',attribute:'none',value:'',resourceMin:0,resourceMax:1,ids:[]}}]}},correction:{base:{},patch:{}}};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const integer=(n,min,max,label)=>{if(!Number.isInteger(n)||n<min||n>max)throw Error(`${label} must be an integer in [${min}, ${max}]`);return n;};
const quantile=(sorted,p)=>{if(!sorted.length)return null;const n=(sorted.length-1)*p,i=Math.floor(n);return sorted[i]+(sorted[Math.ceil(n)]-sorted[i])*(n-i);};

// Sample SD. Quartiles linearly interpolate at (n - 1) p; never call SD a CI.
export function summary(xs){
  if(!Array.isArray(xs)||xs.some(x=>!Number.isFinite(x)))throw Error('Summary requires finite numerical observations');
  const sorted=[...xs].sort((a,b)=>a-b),n=xs.length,mean=n?xs.reduce((s,x)=>s+x,0)/n:null,q1=quantile(sorted,.25),q3=quantile(sorted,.75);
  return{n,mean,sd:n>1?Math.sqrt(xs.reduce((v,x)=>v+(x-mean)**2,0)/(n-1)):null,median:quantile(sorted,.5),q1,q3,iqr:n?q3-q1:null,min:n?sorted[0]:null,max:n?sorted.at(-1):null,quartileMethod:'linear interpolation at (n - 1) p'};
}
function category(key){
  if(['topology','groupSize','overlap','grouping','homophily','geographicLocality','bridges','isolation','membershipBudget','communicationBudget','matchingStrategy'].includes(key))return'topology';
  if(['aggregation','amplification','threshold','confidence','influence','diffusion','spread','noise','memory','decay'].includes(key))return'information';
  if(/Reward$/.test(key)||key==='votingCost')return'reward';
  if(['learning','learner','taskMode','alpha','gamma','epsilon','epsilonDecay','epsilonFloor','episodeLength'].includes(key))return'learning';
  return['rule','tieBreak','allowAbstain','turnout'].includes(key)?'voting':'environment';
}
export function parameterDifferences(a,b){const ca=a.config||a,cb=b.config||b;return[...new Set([...Object.keys(ca),...Object.keys(cb)])].sort().filter(key=>!same(ca[key],cb[key])).map(key=>({key,baseline:copy(ca[key]??null),treatment:copy(cb[key]??null),category:category(key)}));}
function topologyStats(s){
  const d=diagnostics(s),active=s.groups.filter(g=>g.active),incidences=active.reduce((n,g)=>n+g.members.length,0),potentialContributions=active.reduce((n,g)=>n+g.members.length**2,0);
  return{...copy(d),population:s.agents.length,groupCount:active.length,hyperedges:active.filter(g=>g.members.length>2).length,pairwiseEdges:active.filter(g=>g.members.length===2).length,groupSizes:active.map(g=>g.members.length).sort((a,b)=>a-b),incidences,potentialContributions,configuredCommunicationBudget:s.config.communicationBudget??0,actualContributions:d.actualContributions??null};
}
const initialAgentSignature=s=>s.agents.map(a=>({id:a.id,ideal:a.ideal,salience:a.salience,communities:a.communities,region:a.region,metadata:a.metadata,trust:a.trust,susceptibility:a.susceptibility,belief:a.belief,q:a.q,pending:a.pending,distortion:a.distortion}));
export function comparisonContract(a,b,{seedCount=1,sameCheckpoint=false}={}){
  const differences=parameterDifferences(a,b),ta=topologyStats(a),tb=topologyStats(b),matchedInitialConditions=same(initialAgentSignature(a),initialAgentSignature(b)),warnings=[];
  const matching={population:a.agents.length===b.agents.length,initialConditions:matchedInitialConditions,membershipBudget:ta.incidences===tb.incidences,groupSizes:same(ta.groupSizes,tb.groupSizes),configuredCommunicationBudget:(a.config.communicationBudget??0)===(b.config.communicationBudget??0),potentialContributions:ta.potentialContributions===tb.potentialContributions,actualContributions:ta.actualContributions===tb.actualContributions,aggregation:same(a.config.aggregation,b.config.aggregation),reward:!differences.some(d=>d.category==='reward'),voting:!differences.some(d=>d.category==='voting')};
  if(!matching.population)warnings.push('Population differs.');
  if(!matching.initialConditions)warnings.push('Initial beliefs, preferences, metadata, or learned policies differ.');
  if(!matching.membershipBudget)warnings.push('Actual agent-to-group incidence counts differ.');
  if(!matching.groupSizes)warnings.push('Actual group-size distributions differ.');
  if(!matching.potentialContributions)warnings.push('Potential per-round information contributions differ; configured caps alone do not prove equal delivered exposure.');
  if(!matching.actualContributions)warnings.push('Delivered contribution counts differ at this checkpoint.');
  if(!matching.configuredCommunicationBudget)warnings.push('Configured communication caps differ.');
  if(!matching.aggregation)warnings.push('Aggregation changes as well as the comparison dimension.');
  if(!matching.reward)warnings.push('Reward functions differ.');
  if(!matching.voting)warnings.push('Voting or participation settings differ.');
  if(differences.filter(d=>d.key!=='seed').length>1)warnings.push('Multiple configuration fields change; interpret the joint treatment, not an isolated topology effect.');
  if(seedCount<3)warnings.push('Fewer than three seeds: variability is poorly characterized; one seed has no estimable sample SD.');
  if(sameCheckpoint)warnings.push('Conditional futures share one checkpoint. New future seeds do not create independently generated starting societies.');
  return{differences,matching,baseline:ta,treatment:tb,warnings,explanation:`Changed fields: ${differences.map(d=>d.key).join(', ')||'none'}. Matching is measured from actual starting states. Equal population, incidence count, group sizes, and communication need not be simultaneously attainable.`,exposurePolicy:'Same counter-based draws by seed, absolute round, agent, channel, and event identity; topology can still alter delivered social information.'};
}
export function matchConfigurations(baseline,treatment,{preserve=['topology'],strategy='population'}={}){
  const a=validate(baseline.config||baseline),original=validate(treatment.config||treatment),b=copy(a);
  for(const key of preserve){if(!(key in a))throw Error('Unknown matching field: '+key);b[key]=copy(original[key]);}
  if('matchingStrategy'in b){a.matchingStrategy=strategy;b.matchingStrategy=strategy;}
  // Measure unbounded generated structures before choosing a shared positive cap.
  if(['membership','communication'].includes(strategy)){
    const pa=create({...a,recordFrames:false,matchingStrategy:'population'}),pb=create({...b,recordFrames:false,matchingStrategy:'population'}),da=topologyStats(pa),db=topologyStats(pb),key=strategy==='membership'?'membershipBudget':'communicationBudget';
    a[key]=b[key]=Math.min(strategy==='membership'?da.incidences:da.potentialContributions,strategy==='membership'?db.incidences:db.potentialContributions);
  }
  const ca=validate(a),cb=validate(b),patch=Object.fromEntries(parameterDifferences(ca,cb).map(d=>[d.key,d.treatment]));
  return{baseline:ca,treatment:cb,patch,differences:parameterDifferences(ca,cb),strategy,limitations:['Matching aligns compatible configuration fields and assigns shared finite budgets for membership/communication strategies. Verify actual delivered counts: group sizes, confidence gating and an indivisible final message can leave counts unequal.','Clique projection generally changes group sizes and incidence counts; it is a comparison baseline, not an equivalent representation.']};
}
function frame(s){return{version:s.version,config:copy(s.config),round:s.round,agents:s.agents.map(a=>{const x=copy(a);x.rewards=a.rewards?.slice(-1)||[];if(x.updateHistory)x.updateHistory=x.updateHistory.slice(-1);return x;}),groups:copy(s.groups),history:s.history.length?[copy(s.history.at(-1))]:[],eventsLog:copy(s.eventsLog.slice(-12)),lastElection:copy(s.lastElection),selection:s.selection??0,episodeReturn:s.episodeReturn??0,recorded:true};}
const equalValues=(x,y)=>{if(x===y)return true;if(x===null||y===null||typeof x!=='object'||typeof y!=='object'||Array.isArray(x)!==Array.isArray(y))return false;const keys=Object.keys(x);if(keys.length!==Object.keys(y).length)return false;return keys.every(k=>Object.hasOwn(y,k)&&equalValues(x[k],y[k]));};
export function agentDivergence(a,b){
  const agents=[];
  for(let i=0;i<Math.max(a.agents.length,b.agents.length);i++){const x=a.agents[i],y=b.agents[i];if(!x||!y){agents.push({id:i,fields:['presence']});continue;}const fields=['belief','distortion','state','action','ballot','reward','q','neural','pending','lastUpdate'].filter(k=>!equalValues(x[k],y[k]));if(fields.length)agents.push({id:x.id,fields});}
  return{agents,count:agents.length,winnerChanged:a.lastElection.winner!==b.lastElection.winner,groupsChanged:!same(a.groups,b.groups),welfareDelta:(b.history.at(-1)?.welfare??0)-(a.history.at(-1)?.welfare??0)};
}
function recordingRounds(start,rounds,cap,events=[],disruption=null){
  const end=start+rounds,selected=new Set([start,end]),priorities=[];
  for(const e of events)for(const r of[e.start-1,e.start,e.start+e.duration-1,e.start+e.duration])priorities.push(r);
  if(disruption)for(const r of[disruption.round-1,disruption.round,disruption.round+(disruption.duration??rounds)-1,disruption.round+(disruption.duration??rounds)])priorities.push(r);
  for(const r of priorities.sort((a,b)=>a-b))if(r>start&&r<end&&selected.size<cap)selected.add(r);
  for(let i=0;i<cap&&selected.size<cap;i++)selected.add(start+Math.round(i*rounds/Math.max(1,cap-1)));
  return selected;
}
function validateDisruption(input,start,end){
  if(!input)return null;const d={kind:'group',round:start+1,duration:end-start,count:1,...copy(input)};
  if(!['group','highestMembershipGroup','randomGroups','agentDisconnect','randomAgents'].includes(d.kind))throw Error('Unknown synthetic failure kind');
  integer(d.round,start+1,end,'Failure round');integer(d.duration,1,1000,'Failure duration');integer(d.count,1,50,'Failure count');
  if(d.kind==='agentDisconnect'&&d.agentId!==undefined)integer(d.agentId,0,599,'Agent ID');return d;
}
function disconnect(s,d){
  const active=s.groups.filter(g=>g.active),memberships=s.agents.map(()=>0);for(const g of active)for(const id of g.members)memberships[id]++;
  let chosen=[],agentIds=[];
  if(d.kind==='group'){const g=active.find(g=>g.id===d.groupId);if(!g)throw Error('Selected group must exist and be active');chosen=[g];}
  if(d.kind==='highestMembershipGroup')chosen=[...active].sort((a,b)=>b.members.reduce((n,id)=>n+memberships[id],0)-a.members.reduce((n,id)=>n+memberships[id],0)||a.id.localeCompare(b.id)).slice(0,d.count);
  if(d.kind==='randomGroups')chosen=[...active].sort((a,b)=>draw(s.config.seed,d.round,active.indexOf(a),81)-draw(s.config.seed,d.round,active.indexOf(b),81)).slice(0,d.count);
  if(d.kind==='agentDisconnect')agentIds=[d.agentId??memberships.indexOf(Math.max(...memberships))];
  if(d.kind==='randomAgents')agentIds=s.agents.map(a=>a.id).sort((a,b)=>draw(s.config.seed,d.round,a,82)-draw(s.config.seed,d.round,b,82)).slice(0,d.count);
  if(agentIds.some(id=>!s.agents[id]))throw Error('Unknown failure agent');
  if(agentIds.length)chosen=active.filter(g=>g.members.some(id=>agentIds.includes(id)));
  const before=copy(chosen),directlyAffected=[...new Set(chosen.flatMap(g=>g.members))];
  for(const g of chosen)if(agentIds.length){const remaining=g.members.filter(id=>!agentIds.includes(id));if(remaining.length<2)g.active=false;else g.members=remaining;}else g.active=false;
  const event={round:d.round,type:'failure',text:`${d.kind}: ${chosen.length} groups changed`,kind:d.kind,groupIds:chosen.map(g=>g.id),agentIds,directlyAffected,before,after:copy(chosen),directEffect:'Communication opportunities changed before this round. Subsequent belief, learning and outcome differences are observed downstream responses.'};s.eventsLog.push(event);return{before,event};
}
function reconnect(s,saved,round){for(const original of saved.before){const g=s.groups.find(g=>g.id===original.id);if(g)Object.assign(g,copy(original));}const event={round,type:'failure-end',text:'Scheduled communication structure restored',groupIds:saved.before.map(g=>g.id),directlyAffected:saved.event.directlyAffected};s.eventsLog.push(event);return event;}

// Complete checkpoint clones. Future seed changes are explicit and shared by A/B.
export function runPair({config={},patch={},seed=42,rounds=200,snapshot=null,disruption=null,maxFrames=100,recordFrames=true,shouldCancel=null}={}){
  integer(rounds,1,experimentLimits.pairRounds,'Rounds');integer(seed,0,4294967295,'Seed');integer(maxFrames,2,experimentLimits.maxFrames,'Recorded-frame cap');
  const a=snapshot?restore(copy(snapshot)):create(validate({...config,seed})),checkpoint=copy(a),originalSeed=a.config.seed;a.config.seed=seed;a.frames=[];a.frameSizes=[];a.recordFrames=false;
  const b=restore(copy(a));b.frames=[];b.frameSizes=[];b.recordFrames=false;if(Object.keys(patch).length)configure(b,patch);
  const neuralSize=c=>c.learner==='neural'?2*(c.neuralHidden*19+8*(c.neuralHidden+1))+c.neuralReplay*6:0;
  const perAgent=144+Math.max(neuralSize(a.config),neuralSize(b.config));
  if(recordFrames&&Math.floor(experimentLimits.frameQValues/(a.agents.length*2*perAgent))<2)throw Error('Detailed neural replay exceeds the retained-state budget. Reduce agents, neural width or replay capacity, or run a Forecast ensemble without retained neural frames.');
  const start=a.round,end=start+rounds,d=validateDisruption(disruption,start,end),comparison=comparisonContract(a,b,{sameCheckpoint:!!snapshot}),cap=Math.max(2,Math.min(maxFrames,Math.floor(experimentLimits.frameQValues/(a.agents.length*2*perAgent)))),retain=recordFrames?recordingRounds(start,rounds,cap,[...a.config.events,...b.config.events],d):new Set(),pairedFrames=[],trajectory=[],sumA={},sumB={},events=[];
  const initialDivergence=agentDivergence(a,b);let failure=null,firstDivergence=initialDivergence.count||initialDivergence.groupsChanged||initialDivergence.winnerChanged?{round:start,...initialDivergence}:null;const record=()=>{if(!retain.has(a.round))return;const x=frame(a),y=frame(b),divergence=agentDivergence(x,y);pairedFrames.push({round:a.round,a:x,b:y,divergence});};record();
  for(let i=0;i<rounds;i++){
    if(shouldCancel?.())throw Error('Experiment cancelled');const r=start+i+1;
    if(d&&r===d.round){failure=disconnect(b,d);events.push(copy(failure.event));}
    if(d&&failure&&r===d.round+d.duration)events.push(reconnect(b,failure,r));
    const x=step(a),y=step(b),delta=Object.fromEntries(metrics.filter(k=>Number.isFinite(x[k])&&Number.isFinite(y[k])).map(k=>[k,y[k]-x[k]]));
    for(const key of Object.keys(delta)){sumA[key]=(sumA[key]??0)+x[key];sumB[key]=(sumB[key]??0)+y[key];}
    trajectory.push({round:r,baseline:copy(x),treatment:copy(y),delta});for(const[branch,s]of[['a',a],['b',b]])for(const event of s.eventsLog.filter(e=>e.round===r&&['start','end','rewire','episode-reset'].includes(e.type)))events.push({branch,...copy(event)});const divergence=agentDivergence(a,b);if(!firstDivergence&&(divergence.count||divergence.winnerChanged||divergence.groupsChanged))firstDivergence={round:r,...divergence};record();
  }
  const av=Object.fromEntries(Object.entries(sumA).map(([k,v])=>[k,v/rounds])),bv=Object.fromEntries(Object.entries(sumB).map(([k,v])=>[k,v/rounds])),protocol={kind:'polis-pair-protocol',version:4,environment:'POLIS V4.0',config:copy(snapshot?checkpoint.config:validate({...config,seed})),patch:copy(patch),seed,rounds,snapshot:snapshot?checkpoint:null,disruption:copy(d),endpoint:'Arithmetic mean of every engine round after checkpoint, inclusive through final round',futureSeedOverride:snapshot&&originalSeed!==seed?{from:originalSeed,to:seed}:null,recording:{recordFrames,maxFrames}};
  comparison.observedCommunication={baseline:summary(trajectory.map(t=>t.baseline.communicationContributions)),treatment:summary(trajectory.map(t=>t.treatment.communicationContributions)),matchedEveryRound:trajectory.every(t=>t.baseline.communicationContributions===t.treatment.communicationContributions)};
  if(!comparison.observedCommunication.matchedEveryRound)comparison.warnings.push('Recorded delivered communication contributions differ during the run.');
  if(d){comparison.scheduledDisruption=copy(d);comparison.differences.push({key:'scheduledFailure',baseline:null,treatment:copy(d),category:'topology'});comparison.explanation+=' Treatment alone receives the recorded scheduled structural failure.';}
  return{version:4,seed,start,rounds,baseline:av,treatment:bv,delta:Object.fromEntries(Object.keys(av).map(k=>[k,bv[k]-av[k]])),a,b,checkpoint,protocol,comparison,pairedFrames,trajectory,firstDivergence,events,recording:{source:'Actual state copied during execution; no reconstruction by rerunning',cap,retainedRounds:pairedFrames.map(f=>f.round),totalRounds:rounds+1,omittedRounds:rounds+1-pairedFrames.length,fullTrajectory:true,fullQTablesInRetainedFrames:true}};
}

export const sweepParameters=Object.freeze({population:{min:12,max:600,integer:true,unit:'agents'},groupSize:{min:2,max:16,integer:true,unit:'agents per group'},overlap:{min:0,max:15,integer:true,unit:'members'},homophily:{min:0,max:1,unit:'similarity weight'},geographicLocality:{min:0,max:1,unit:'distance weight'},influence:{min:0,max:1,unit:'weight'},confidence:{min:0,max:1,unit:'belief distance'},noise:{min:0,max:1,unit:'amplitude'},memory:{min:0,max:1,unit:'weight'},threshold:{min:0,max:1,unit:'fraction'},spread:{min:0,max:1,unit:'weight'},decay:{min:0,max:1,unit:'fraction per round'},alpha:{min:0,max:1,unit:'learning rate'},gamma:{min:0,max:1,unit:'discount'},epsilon:{min:0,max:1,unit:'exploration rate'},conformityReward:{min:0,max:2,unit:'reward weight'},ballotReward:{min:0,max:2,unit:'reward weight'},utilityReward:{min:0,max:2,unit:'reward weight'},communicationBudget:{min:0,max:100000,integer:true,unit:'agent contributions per round (0 unlimited)'},membershipBudget:{min:0,max:100000,integer:true,unit:'agent-group incidences (0 unlimited)'}});
export function planSweep({config={},axes,seeds=[42,43,44],rounds=40,maxSteps=10000,metric='welfare',patch={},snapshot=null,maxFrames=30,endpoint='outcome'}={}){
  if(!Array.isArray(axes)||axes.length!==2||axes[0].key===axes[1].key)throw Error('Select two distinct sweep axes');
  for(const axis of axes){const spec=sweepParameters[axis.key];if(!spec)throw Error('Parameter is not sweep-whitelisted: '+axis.key);if(!Array.isArray(axis.values)||axis.values.length<1||axis.values.length>7||new Set(axis.values).size!==axis.values.length)throw Error('Each sweep axis requires 1–7 unique values');for(const v of axis.values)if(!Number.isFinite(v)||v<spec.min||v>spec.max||spec.integer&&!Number.isInteger(v))throw Error('Invalid sweep value for '+axis.key);}
  if(snapshot&&axes.some(a=>a.key==='population'))throw Error('Population sweeps require fresh societies');
  if(!Array.isArray(seeds)||seeds.length<1||seeds.length>experimentLimits.sweepSeeds||new Set(seeds).size!==seeds.length)throw Error('Use 1–12 unique seeds');seeds.forEach(s=>integer(s,0,4294967295,'Seed'));
  integer(rounds,1,experimentLimits.sweepRounds,'Sweep rounds');integer(maxSteps,1,experimentLimits.sweepSteps,'Maximum simulation steps');integer(maxFrames,2,100,'Recorded-frame cap');if(!metrics.includes(metric))throw Error('Unknown sweep outcome metric');
  if(!['outcome','effect','baseline','treatment','delta'].includes(endpoint))throw Error('Sweep endpoint must be outcome, effect, baseline, treatment or delta');const valueEndpoint=endpoint==='outcome'?'treatment':endpoint==='effect'?'delta':endpoint;
  const n=axes[0].values.length*axes[1].values.length,totalSteps=n*seeds.length*rounds*2;if(n>experimentLimits.sweepCells||totalSteps>maxSteps)throw Error(`Sweep needs ${totalSteps} branch transitions; cap is ${maxSteps}`);
  const c=validate(snapshot?snapshot.config:config),maxPop=axes.find(a=>a.key==='population')?.values.reduce((a,b)=>Math.max(a,b),0)||c.population;if(totalSteps*maxPop>experimentLimits.agentUpdates)throw Error('Sweep exceeds the 6,000,000 agent-update cap; reduce population, cells, seeds, or rounds');
  const cells=[];for(let y=0;y<axes[1].values.length;y++)for(let x=0;x<axes[0].values.length;x++){const values={[axes[0].key]:axes[0].values[x],[axes[1].key]:axes[1].values[y]};cells.push({id:`${x}:${y}`,x,y,values,config:null,status:'pending',runs:[],statistics:null,value:null,error:null});}
  return{kind:'polis-sweep',version:4,axes:copy(axes),seeds:[...seeds],rounds,metric,valueEndpoint,totalSteps,maxSteps,completedSteps:0,completed:false,cancelled:false,cells,protocol:{kind:'polis-sweep-protocol',version:4,config:copy(c),axes:copy(axes),seeds:[...seeds],rounds,maxSteps,metric,patch:copy(patch),snapshot:snapshot?copy(snapshot):null,maxFrames,endpoint,valueEndpoint,endpointDefinition:valueEndpoint==='delta'?'Treatment-minus-baseline difference of arithmetic means over every run round':`Arithmetic mean ${valueEndpoint} outcome over every continuation round`}};
}
function completeCell(cell,metric,endpoint){cell.statistics=Object.fromEntries(metrics.filter(k=>cell.runs.some(r=>Number.isFinite(r.delta[k]))).map(key=>[key,{baseline:summary(cell.runs.map(r=>r.baseline[key])),treatment:summary(cell.runs.map(r=>r.treatment[key])),delta:summary(cell.runs.map(r=>r.delta[key]))}]));cell.value=cell.statistics[metric]?.[endpoint].mean??null;cell.valueEndpoint=endpoint;}
function sweepJob(result,cell,seed){const p=result.protocol,config=validate({...p.config,...cell.values,seed});cell.config=copy(config);let snapshot=null;if(p.snapshot){snapshot=restore(copy(p.snapshot));configure(snapshot,cell.values);}return{config,patch:p.patch,seed,rounds:p.rounds,snapshot,recordFrames:false,maxFrames:p.maxFrames};}
function compactRun(run){const{a,b,checkpoint,pairedFrames,...rest}=run;rest.protocol.snapshot=null;rest.protocol.snapshotStoredInParent=true;return rest;}
export function runSweep(options,{onProgress=null,shouldCancel=null}={}){
  const result=planSweep(options);
  for(const cell of result.cells){if(shouldCancel?.()){result.cancelled=true;break;}cell.status='running';try{for(const seed of result.seeds){if(shouldCancel?.()){result.cancelled=true;break;}cell.runs.push(compactRun(runPair({...sweepJob(result,cell,seed),shouldCancel})));result.completedSteps+=2*result.rounds;}completeCell(cell,result.metric,result.valueEndpoint);cell.status=result.cancelled?'cancelled':'complete';}catch(e){cell.status='failed';cell.error=e.message;}onProgress?.(copy(cell),result);if(result.cancelled)break;}
  if(result.cancelled)for(const cell of result.cells)if(cell.status==='pending')cell.status='cancelled';result.completed=!result.cancelled&&result.cells.every(c=>c.status==='complete');return result;
}
export async function runSweepAsync(options,{onProgress=null,shouldCancel=null,yieldTask=()=>new Promise(resolve=>setTimeout(resolve,0))}={}){
  const result=planSweep(options);
  for(const cell of result.cells){if(shouldCancel?.()){result.cancelled=true;break;}cell.status='running';try{for(const seed of result.seeds){if(shouldCancel?.()){result.cancelled=true;break;}cell.runs.push(compactRun(runPair({...sweepJob(result,cell,seed),shouldCancel})));result.completedSteps+=2*result.rounds;await yieldTask();}completeCell(cell,result.metric,result.valueEndpoint);cell.status=result.cancelled?'cancelled':'complete';}catch(e){cell.status='failed';cell.error=e.message;}onProgress?.(copy(cell),result);await yieldTask();if(result.cancelled)break;}
  if(result.cancelled)for(const cell of result.cells)if(cell.status==='pending')cell.status='cancelled';result.completed=!result.cancelled&&result.cells.every(c=>c.status==='complete');return result;
}
export function compareSweepCells(a,b,metric='welfare',endpoint=a.valueEndpoint||'treatment'){
  if(!metrics.includes(metric)||!['baseline','treatment','delta'].includes(endpoint))throw Error('Unknown comparison metric or endpoint');const pairs=[];for(const run of a.runs){const other=b.runs.find(r=>r.seed===run.seed);if(other)pairs.push({seed:run.seed,a:run[endpoint][metric],b:other[endpoint][metric],difference:other[endpoint][metric]-run[endpoint][metric]});}
  return{cellA:a.id,cellB:b.id,metric,endpoint:`Cell B minus cell A ${endpoint} mean, matched by future seed`,pairs,statistics:summary(pairs.map(p=>p.difference)),differences:a.config&&b.config?parameterDifferences(a.config,b.config):[],qualification:'Pairing aligns seeds; changing population, generator parameters, or topology may leave initial conditions or information exposure unmatched.'};
}
export function csvRows(rows){if(!rows.length)return'';const cols=[...new Set(rows.flatMap(r=>Object.keys(r)))],escape=v=>'"'+String(typeof v==='object'&&v!==null?JSON.stringify(v):v??'').replaceAll('"','""')+'"';return[cols.map(escape).join(','),...rows.map(r=>cols.map(k=>escape(r[k])).join(','))].join('\r\n');}
export function resultRows(runs){return runs.map(r=>({seed:r.seed,fromRound:r.start,rounds:r.rounds,...Object.fromEntries(Object.entries(r.baseline).map(([k,v])=>['baseline_'+k,v])),...Object.fromEntries(Object.entries(r.treatment).map(([k,v])=>['treatment_'+k,v])),...Object.fromEntries(Object.entries(r.delta).map(([k,v])=>['delta_'+k,v]))}));}
export function sweepRows(sweep){return sweep.cells.flatMap(cell=>cell.runs.length?resultRows(cell.runs).map(row=>({cell:cell.id,status:cell.status,...cell.values,...row})):[{cell:cell.id,status:cell.status,...cell.values,error:cell.error??''}]);}
export const sweepCSV=sweep=>csvRows(sweepRows(sweep));
export function replayProtocol(input,options={}){
  const p=input.protocol||input;if(p.kind==='polis-sweep-protocol'||p.axes)return runSweep(p,options);if(p.kind==='polis-pair-protocol'||p.seed!==undefined)return runPair({...p,...p.recording,...options});
  if(!Array.isArray(p.seeds)||!Array.isArray(p.patches))throw Error('Expected a POLIS pair, study, or sweep protocol');const runs=[];
  for(let patchIndex=0;patchIndex<p.patches.length;patchIndex++)for(const seed of p.seeds){if(options.shouldCancel?.())return{protocol:copy(p),runs,completed:false,cancelled:true};const snapshot=p.snapshot?restore(copy(p.snapshot)):null;if(snapshot&&p.baselineOverrides)configure(snapshot,p.baselineOverrides);const r=runPair({config:p.config||p.baseline,patch:p.patches[patchIndex],seed,rounds:p.rounds,snapshot,disruption:p.disruption,...options});r.patchIndex=patchIndex;runs.push(r);options.onProgress?.(r,runs.length);}
  return{protocol:copy(p),runs,completed:true};
}
const escapeHTML=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function svgPlot(trajectory){if(!trajectory?.length)return'<p>No trajectory retained.</p>';const width=720,height=190,pad=24,pts=key=>trajectory.map((r,i)=>`${pad+i*(width-2*pad)/Math.max(1,trajectory.length-1)},${height-pad-r[key].welfare*(height-2*pad)}`).join(' ');return`<svg role="img" aria-label="Recorded baseline and treatment welfare trajectories" viewBox="0 0 ${width} ${height}"><rect x="${pad}" y="${pad}" width="${width-2*pad}" height="${height-2*pad}" fill="#f0f2f6"/><polyline fill="none" stroke="#16796e" stroke-width="2" points="${pts('baseline')}"/><polyline fill="none" stroke="#7047b8" stroke-width="2" points="${pts('treatment')}"/></svg><p>Welfare 0–1; rounds ${trajectory[0].round}–${trajectory.at(-1).round}. Baseline: green. Treatment: violet. All points are actual recorded engine metrics.</p>`;}
export function reportHTML(input,{title='POLIS V4.0 experiment report',question='',hypothesis='',literature=[]}={}){
  const runs=input.runs||input.cells?.flatMap(c=>c.runs)||[input],p=input.protocol||{},rows=resultRows(runs),keys=[...new Set(runs.flatMap(r=>Object.keys(r.delta||{})))],stats=keys.map(k=>({metric:k,...summary(runs.map(r=>r.delta[k]))})),first=runs[0],warnings=[...new Set(runs.flatMap(r=>r.comparison?.warnings||[]))],table=(items,cols)=>`<table><thead><tr>${cols.map(k=>`<th>${escapeHTML(k)}</th>`).join('')}</tr></thead><tbody>${items.map(item=>`<tr>${cols.map(k=>`<td>${escapeHTML(typeof item[k]==='object'?JSON.stringify(item[k]):item[k])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const payload={kind:'polis-report-data',version:4,protocol:p,results:rows,runs:runs.map(r=>({seed:r.seed,start:r.start,rounds:r.rounds,patchIndex:r.patchIndex,protocol:r.protocol,comparison:r.comparison,trajectory:r.trajectory,events:r.events,firstDivergence:r.firstDivergence,recording:r.recording,pairedFrames:r.pairedFrames})),sweep:input.cells?{axes:input.axes,cells:input.cells.map(c=>({id:c.id,status:c.status,values:c.values,config:c.config,statistics:c.statistics,value:c.value,error:c.error}))}:null};
  return`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(title)}</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:1100px;margin:40px auto;padding:0 22px;color:#172136;background:#fff}h1,h2{line-height:1.2}table{border-collapse:collapse;width:100%;font-size:13px;margin:16px 0;display:block;overflow:auto}th,td{border:1px solid #d3d9e3;padding:7px;text-align:left}th{background:#eef2f8}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;background:#f3f5f8;padding:16px}svg{width:100%;max-height:240px}small{color:#4b566b}@media print{details{display:block}body{margin:0}pre{font-size:9px}}</style><h1>${escapeHTML(title)}</h1><p>Environment: POLIS V4.0, browser-native synthetic voting model. Completed paired runs: ${runs.length}. Seeds: ${escapeHTML([...new Set(runs.map(r=>r.seed))].join(', '))}.</p><h2>Research question and hypothesis</h2><p>${escapeHTML(question||p.question||'Not specified')}</p><p>Hypothesis: ${escapeHTML(hypothesis||p.hypothesis||'Not prespecified; treat as exploratory.')}</p><h2>Method and endpoint</h2><p>${escapeHTML(p.endpoint||first?.protocol?.endpoint||'Arithmetic mean of all engine rounds in the continuation window; treatment minus baseline.')}</p><p>Branches clone one serialized checkpoint with independent agents, policies, topology, and deterministic counter-based random draws. The intervention is applied only to treatment. Historical replay uses actual retained states. SD is sample standard deviation; quartiles linearly interpolate at (n−1)p. These are descriptive statistics, without significance or confidence-interval claims.</p><h2>Actual paired differences</h2>${table(stats,['metric','n','mean','sd','median','q1','q3','iqr','min','max'])}<p>If this report includes multiple patches or cells, the overall table pools descriptive outcomes. Consult per-run patch indices and cell data for each separate contrast.</p><h2>Recorded first-run welfare</h2>${svgPlot(first?.trajectory)}<h2>Parameter differences and topology</h2>${first?.comparison?table(first.comparison.differences,['key','baseline','treatment','category']):'<p>No comparison contract was supplied.</p>'}<pre>${escapeHTML(JSON.stringify(first?.comparison?{matching:first.comparison.matching,baseline:first.comparison.baseline,treatment:first.comparison.treatment}:null,null,2))}</pre><h2>Confounders and limitations</h2><ul>${warnings.map(w=>`<li>${escapeHTML(w)}</li>`).join('')}<li>Synthetic assumptions are uncalibrated; effects apply to this model, not real elections or real-world causal claims.</li><li>Independent Q-learning runs in a changing environment. Q-values are discounted returns under that learning process, not probabilities of correct action.</li><li>Unmatched group sizes, membership counts, aggregation, rewards, or exposure budgets prevent an isolated topology interpretation.</li><li>Retained replay frames are bounded and can omit intermediate rounds; every endpoint uses all actual engine rounds.</li></ul><h2>Per-seed outcomes</h2>${table(rows,rows.length?Object.keys(rows[0]):['seed'])}<h2>Research sources</h2>${literature.length?'<ul>'+literature.map(s=>`<li>${escapeHTML(s.citation||s.title||s)} ${s.url&&/^https?:\/\//.test(s.url)?`<a href="${escapeHTML(s.url)}">Source</a>`:''}<p>${escapeHTML(s.use||'')}</p><small>${escapeHTML(s.access||'')}</small></li>`).join('')+'</ul>':'<p>See docs/literature.md for verified primary references and implementation differences. No published algorithm reproduction is implied.</p>'}<h2>Reproduction</h2><p>Save the experiment JSON from POLIS, then import and replay its protocol in the matching V4.0 project. The exact configuration, future seeds, observation window, schedules, source checkpoint when applicable, raw trajectory, and retained replay states are embedded below. Preserving the checkpoint is required for conditional branches.</p><details><summary>Exact configuration, rules, rewards, learning settings, schedules and recorded results</summary><pre>${escapeHTML(JSON.stringify(payload,null,2))}</pre></details></html>`;
}
