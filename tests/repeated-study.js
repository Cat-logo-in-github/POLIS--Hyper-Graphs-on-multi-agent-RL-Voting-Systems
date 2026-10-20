import {writeFileSync,readFileSync} from 'node:fs';
import {defaultConfig,copy,validate} from '../src/schema.js';
import {runPair,summary,templates,resultRows} from '../src/experiments.js';
import {evaluateRules,scenarioConfig} from '../src/evaluation.js';
const seeds=[42,43,44,45,46,47],rounds=120,studies=[];
const designs=[
 {name:'hypergraph-versus-exact-clique',base:{topology:'hypergraph'},patch:{topology:'clique'}},
 {name:'linear-versus-nonlinear-same-hypergraph',base:{topology:'hypergraph',aggregation:'linear'},patch:{aggregation:'nonlinear'}},
 {name:'hypergraph-versus-degree-preserving-null',base:{topology:'hypergraph'},patch:{topology:'randomized'}},
 {name:'continuing-versus-finite-horizon',base:{taskMode:'continuing'},patch:{taskMode:'finiteHorizon'}},
 {name:'sincere-versus-independent-Q',...copy(templates.learning)},
 {name:'no-injection-versus-false-signal',...copy(templates.misinformation)},
 {name:'tabular-versus-neural-Q',base:{learner:'q'},patch:{learner:'neural'}},
 {name:'neutral-versus-anchored-confirmation',base:{stubbornness:0,confirmationBias:0},patch:{stubbornness:.3,confirmationBias:.5}}
];
for(const design of designs){
 const config=validate({...copy(defaultConfig),...design.base,recordFrames:false});
 const runs=seeds.map(seed=>runPair({config,patch:design.patch,seed,rounds,recordFrames:false}));
 studies.push({name:design.name,config,patch:design.patch,seeds,rounds,endpoint:'Mean over all 120 actual rounds',results:resultRows(runs),welfare:summary(runs.map(r=>r.delta.welfare)),beliefError:summary(runs.map(r=>r.delta.error)),comparison:runs[0].comparison});
}
const benchmark=evaluateRules({config:{...scenarioConfig('access'),recordFrames:false},scenario:'access',seeds:[42,43,44],rounds:100,window:30,learners:['sincere','logit','q','neural','random'],objective:'welfare'});
writeFileSync(new URL('../docs/sample-results.json',import.meta.url),JSON.stringify({version:4,description:'Measured synthetic model comparisons. Descriptive finite-seed results, no significance or real-world optimum claims.',studies,benchmark},null,2));
for(const file of ['baseline','rumor-correction','intersecting-filters']){
 const path=new URL('../examples/'+file+'.json',import.meta.url),old=JSON.parse(readFileSync(path,'utf8'));
 const config=file==='baseline'?copy(defaultConfig):validate(old.config||old);
 writeFileSync(path,JSON.stringify({kind:'polis-study',version:4,config},null,2));
}
console.log(JSON.stringify({pairedStudies:studies.length,pairedRuns:studies.length*seeds.length,branchRounds:studies.length*seeds.length*rounds*2,benchmarkRuns:benchmark.runs.length,benchmarkRounds:benchmark.runs.length*100,studies:studies.map(s=>({name:s.name,welfare:s.welfare.mean,beliefError:s.beliefError.mean})),bestObserved:benchmark.bestObserved},null,2));
