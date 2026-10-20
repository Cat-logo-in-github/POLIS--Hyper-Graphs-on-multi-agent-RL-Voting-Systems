import {copy,defaultConfig,eventDefaults,validate} from './schema.js';
import {create,step,cohort} from './engine.js';
import {summary} from './experiments.js';

export const objectives={welfare:{label:'Overall true welfare',direction:1},worstCommunity:{label:'Least-served community welfare',direction:1},regret:{label:'Welfare regret',direction:-1},turnout:{label:'Participation',direction:1},error:{label:'Belief error',direction:-1},composite:{label:'Your weighted objective',direction:1}};
export const defaultWeights={welfare:.5,worstCommunity:.3,turnout:.2,regret:0,error:0};
export const scenarioNotes={
  current:'Uses current generator settings, policy packages and event schedule. Fresh societies are generated; manual agent/group edits and trained Q tables are excluded.',
  publicGoods:'A hypothetical participatory budget: public investment, ecological transition and redistribution compete. Communities have different ideals; no observed population is represented.',
  access:'A hypothetical unequal-access consultation: one abstract district has ballot access 0.25 and another 0.55. Compare overall and least-served-community outcomes; this does not model any real district.',
  information:'A hypothetical information shock: a signed numerical false signal about policy C begins at round 25, followed by a correction at round 65. There is no generated political messaging.'
};
export function scenarioConfig(name,current=defaultConfig){
  if(!(name in scenarioNotes))throw Error('Unknown scenario');
  const c=copy(name==='current'?current:defaultConfig);
  if(name==='access'){c.regions[2].access=.25;c.regions[1].access=.55;}
  if(name==='information'){
    const e={...copy(eventDefaults),id:'scenario-false',name:'Synthetic information shock',start:25,duration:30,intensity:.6,coverage:.65};
    c.events=[e,{...copy(e),id:'scenario-repair',name:'Delayed correction',kind:'correction',start:65,duration:25,intensity:.8}];
  }
  return validate(c);
}
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
export function planEvaluation(options={}){
  const config=validate(options.config),seeds=options.seeds??[config.seed],rounds=options.rounds??150,window=options.window??Math.max(1,Math.floor(rounds/4)),learners=options.learners??[config.learner],objective=options.objective??'welfare';
  if(!Array.isArray(seeds)||!seeds.length||seeds.length>8||new Set(seeds).size!==seeds.length||seeds.some(x=>!Number.isInteger(x)||x<0||x>4294967295))throw Error('Use 1–8 distinct unsigned seeds');
  if(!Number.isInteger(rounds)||rounds<10||rounds>500||!Number.isInteger(window)||window<1||window>rounds)throw Error('Use 10–500 rounds and a valid final evaluation window');
  if(!Array.isArray(learners)||!learners.length||learners.length>5||new Set(learners).size!==learners.length||learners.some(x=>!['q','neural','logit','sincere','random'].includes(x)))throw Error('Invalid learner comparison');
  if(!(objective in objectives))throw Error('Unknown evaluation objective');
  const weights={...defaultWeights,...options.weights};if(Object.keys(weights).some(k=>!(k in defaultWeights))||Object.values(weights).some(x=>!Number.isFinite(x)||x<0||x>1)||Object.values(weights).reduce((a,b)=>a+b,0)<=0)throw Error('Objective weights must be in [0,1] with a positive sum');
  const rules=['plurality','approval','borda'],steps=rules.length*learners.length*seeds.length*rounds;
  if(steps>30000||steps*config.population>6000000)throw Error('Comparison exceeds 30,000 rounds or 6,000,000 agent updates; reduce workload');
  return{version:4,kind:'polis-rule-evaluation',config,seeds:[...seeds],rounds,window,learners:[...learners],rules,objective,weights,steps,scenario:options.scenario??'current',endpoint:`Mean over final ${window} rounds (${rounds-window+1}–${rounds})`,initialCondition:'Fresh generated population for each seed, identical ideals and topology within seed before the first action. Tabular Q tables start at zero; neural weights use the same initialization protocol for each rule. No claim of learning convergence.'};
}
function executeRun(p,rule,learner,seed,shouldCancel){
  const s=create({...copy(p.config),rule,learner,learning:learner==='q',seed,recordFrames:false}),initialSignature=JSON.stringify(s.agents.map(a=>[a.ideal,a.communities,a.region,a.trust,a.participation]));
  s.recordFrames=false;s.frames=[];s.frameSizes=[];
  const rows=[],communityRows=[];
  for(let i=0;i<p.rounds;i++){
    if(shouldCancel?.())return null;
    step(s);if(i>=p.rounds-p.window){rows.push(s.history.at(-1));communityRows.push(p.config.communities.map(c=>cohort(s,a=>a.communities.includes(c.id))));}
  }
  const communities=p.config.communities.map((c,i)=>{const occupied=communityRows.map(row=>row[i]).filter(x=>x.n>0);return{id:c.id,name:c.name,n:occupied[0]?.n??0,welfare:occupied.length?mean(occupied.map(x=>x.welfare)):null};});
  const metrics={...Object.fromEntries(['welfare','regret','turnout','error','infected','reward'].map(k=>[k,mean(rows.map(r=>r[k]))])),worstCommunity:Math.min(...communities.filter(c=>c.n).map(c=>c.welfare))};
  metrics.composite=Object.entries(p.weights).reduce((v,[k,w])=>v+w*(objectives[k].direction>0?metrics[k]:1-metrics[k]),0)/Object.values(p.weights).reduce((a,b)=>a+b,0);
  return{rule,learner,seed,initialSignature,metrics,communities,trajectory:copy(s.history)};
}
function finish(p,runs,cancelled){
  const cells=p.learners.flatMap(learner=>p.rules.map(rule=>{const rs=runs.filter(r=>r.rule===rule&&r.learner===learner);return{rule,learner,status:rs.length===p.seeds.length?'complete':'incomplete',n:rs.length,statistics:Object.fromEntries([...Object.keys(objectives),'infected','reward'].map(k=>[k,summary(rs.map(r=>r.metrics[k]))]))};}));
  const ranked=cells.filter(c=>c.status==='complete').sort((a,b)=>objectives[p.objective].direction*(b.statistics[p.objective].mean-a.statistics[p.objective].mean)||a.rule.localeCompare(b.rule));
  const best=ranked[0],tied=best?ranked.filter(c=>Math.abs(c.statistics[p.objective].mean-best.statistics[p.objective].mean)<1e-12).map(c=>({rule:c.rule,learner:c.learner})):[];
  const dimensions=['welfare','worstCommunity','turnout','regret','error'];
  for(const c of cells)c.pareto=c.status==='complete'&&!cells.some(d=>d!==c&&d.status==='complete'&&dimensions.every(k=>objectives[k].direction*(d.statistics[k].mean-c.statistics[k].mean)>=-1e-12)&&dimensions.some(k=>objectives[k].direction*(d.statistics[k].mean-c.statistics[k].mean)>1e-12));
  const reference=runs[0],pairedDifferences=reference?cells.filter(c=>c.n).map(c=>({rule:c.rule,learner:c.learner,reference:{rule:reference.rule,learner:reference.learner},objective:p.objective,statistics:summary(runs.filter(r=>r.rule===c.rule&&r.learner===c.learner).flatMap(r=>{const a=runs.find(x=>x.rule===reference.rule&&x.learner===reference.learner&&x.seed===r.seed);return a?[r.metrics[p.objective]-a.metrics[p.objective]]:[];}))})):[];
  // The signature is a verification aid, not needed in the downloadable result.
  const signatures=new Map();let matchedPopulation=true;for(const r of runs){if(signatures.has(r.seed)&&signatures.get(r.seed)!==r.initialSignature)matchedPopulation=false;signatures.set(r.seed,r.initialSignature);delete r.initialSignature;}
  return{protocol:p,runs,cells,ranked:ranked.map(c=>({rule:c.rule,learner:c.learner,mean:c.statistics[p.objective].mean})),bestObserved:tied,pairedDifferences,matchedPopulation,cancelled,completed:!cancelled&&runs.length===p.rules.length*p.learners.length*p.seeds.length,warnings:['Best observed is conditional on this objective, population generator, reward, horizon, seeds and candidate set. It is not a proven optimum or a real-world prediction.','Sample SD describes between-seed variation; it is not a confidence interval. Near ties can reverse under new seeds or assumptions.','Tabular and neural Q learners are independent local learners in a nonstationary environment. No centralized planner, empirical human training or convergence guarantee.','Reward is not directly comparable across voting rules because ballot/conformity terms depend on rule semantics. Welfare uses the same true utility definition.','Least-served-community welfare is the minimum of nonempty community mean utilities in the evaluation window. Overlapping memberships count in each group; geography is not this objective.']};
}
export function evaluateRules(options){const p=planEvaluation(options),runs=[];for(const learner of p.learners)for(const rule of p.rules)for(const seed of p.seeds)runs.push(executeRun(p,rule,learner,seed));return finish(p,runs,false);}
export function trainCandidate({config,rule,learner,seed,rounds,window}={}){
  const p=planEvaluation({config,seeds:[seed],learners:[learner],rounds,window});if(!p.rules.includes(rule))throw Error('Unknown candidate rule');
  const state=create({...copy(p.config),rule,learner,seed,recordFrames:false});state.recordFrames=false;state.frames=[];state.frameSizes=[];for(let i=0;i<p.rounds;i++)step(state);
  return{state,protocol:{...p,rule,learner,mode:'Exact first-seed candidate continuation; fresh generated initial society'}};
}
export async function evaluateRulesAsync(options,{onProgress,shouldCancel}={}){
  const p=planEvaluation(options),runs=[];let cancelled=false;
  outer:for(const learner of p.learners)for(const rule of p.rules)for(const seed of p.seeds){if(shouldCancel?.()){cancelled=true;break outer;}const r=executeRun(p,rule,learner,seed,shouldCancel);if(!r){cancelled=true;break outer;}runs.push(r);onProgress?.({completed:runs.length,total:p.rules.length*p.learners.length*p.seeds.length,rule,learner,seed});await new Promise(resolve=>setTimeout(resolve,0));}
  return finish(p,runs,cancelled);
}
