import test from 'node:test';
import assert from 'node:assert/strict';
import {create,step} from '../src/engine.js';
import {copy} from '../src/schema.js';
import {runForecast,runForecastAsync,planForecast,forecastSummary,forecastCSV,parseObservations,planCalibration,calibrateForecast,calibrateForecastAsync,scorePredictions,syntheticObservations} from '../src/forecast.js';
const base={config:{population:12,recordFrames:false},seeds:[41,42],rounds:8,window:3};
const observations=(patch={})=>({rule:'plurality',shareDefinition:'countedScore',source:'synthetic',label:'Known synthetic zero-turnout fixture',rows:[1,2,3,4,5,6].map(round=>({round,turnout:0,winner:'none'})),...patch});
const fit={config:{population:12,recordFrames:false},observations:observations(),seeds:[41,42],axes:[{key:'turnout',values:[0,1]}],trainFraction:.6};

test('forecast ensemble is deterministic, uses actual final winners and explicit final-window measurements',()=>{
 const r=runForecast(base),again=runForecast(base);assert.deepEqual(r,again);assert(r.completed);assert.equal(r.n,2);assert.equal(Object.values(r.probabilities).reduce((a,b)=>a+b),1);assert.equal(r.trajectory.length,8);assert.equal(r.protocol.targetRound,8);
 const s=create({...base.config,seed:41});for(let i=0;i<8;i++)step(s);const run=r.runs[0];assert.equal(run.winner,s.lastElection.winner===null?'none':['A','B','C'][s.lastElection.winner]);assert.equal(run.metrics.welfare,s.history.slice(-3).reduce((a,b)=>a+b.welfare,0)/3);assert.equal(run.trajectory.at(-1).shareA,s.lastElection.shares[0]);
});
test('uncertain parameter draws respect uniform support and normalized discrete weights',()=>{
 const r=runForecast({...base,parameters:[{key:'influence',min:.1,max:.2},{key:'turnout',distribution:'discrete',values:[0,1],weights:[0,5]}]});assert(r.runs.every(x=>x.patch.influence>=.1&&x.patch.influence<=.2&&x.patch.turnout===1));assert.deepEqual(r.protocol.parameters[1].weights,[0,1]);assert.throws(()=>planForecast({...base,parameters:[{key:'unknown',min:0,max:1}]}),/Unknown/);assert.throws(()=>planForecast({...base,parameters:[{key:'turnout',distribution:'discrete',values:[0,1],weights:[0,0]}]}),/weights/);
});
test('checkpoint forecasts preserve original learned and realized state without changing source',()=>{
 const s=create({population:12,recordFrames:false});for(let i=0;i<3;i++)step(s);const before=copy(s),r=runForecast({...base,snapshot:s});assert.deepEqual(copy(s),before);assert.equal(r.protocol.origin,3);assert.equal(r.protocol.targetRound,11);assert.equal(r.runs[0].trajectory[0].round,4);assert.deepEqual(r.protocol.snapshot.agents[0].q,before.agents[0].q);
});
test('forecast quantiles, standard errors and population scaling have explicit units',()=>{
 const s=forecastSummary([0,1]);assert.equal(s.q05,.05);assert.equal(s.q95,.95);assert(Math.abs(s.mcSE-.5)<1e-12);assert.equal(forecastSummary([.5]).mcSE,null);
 const r=runForecast({...base,representedPopulation:1200000});assert.equal(r.scale.simulatedAgents,12);assert.equal(r.scale.uniformWeightPerAgent,100000);assert.equal(r.scale.illustrativeParticipants,r.metrics.turnout.mean*1200000);assert.throws(()=>planForecast({...base,representedPopulation:2}),/Represented/);
});
test('forecast workload caps, unique seeds and windows reject invalid requested studies',()=>{
 assert.throws(()=>planForecast({...base,seeds:[1,1]}),/unique/);assert.throws(()=>planForecast({...base,window:9}),/window/);assert.throws(()=>planForecast({...base,config:{population:600},seeds:Array.from({length:128},(_,i)=>i),rounds:500}),/exceeds/);assert.match(planForecast({...base,config:{population:12,rule:'borda'}}).shareDefinition,/not population/);
});
test('cancelled ensembles retain genuine completed runs and never call unfinished work complete',async()=>{let stop=false;const r=await runForecastAsync(base,{shouldCancel:()=>stop,onProgress:()=>stop=true});assert(r.cancelled&&!r.completed);assert.equal(r.n,1);assert.equal(r.runs.length,1);assert.equal(r.winnerStats.A.mcSE,null);});
test('per-run CSV and JSON preserve exact parameter draws and forecast origin',()=>{const r=runForecast(base),csv=forecastCSV(r),roundtrip=JSON.parse(JSON.stringify(r));assert.match(csv,/targetRound/);assert.match(csv,/41/);assert.deepEqual(roundtrip.protocol.seeds,[41,42]);assert.equal(roundtrip.runs[0].trajectory.length,8);});
test('aggregate JSON and quoted CSV imports validate provenance and compatible share semantics',()=>{
 const csv='round,shareA,shareB,shareC,turnout,winner\n1,0.5,0.3,0.2,0.8,A\n2,0.4,0.3,0.3,0.7,A\n3,0.3,0.4,0.3,0.7,B\n4,0.3,0.3,0.4,0.8,C';const d=parseObservations(csv,{rule:'plurality',source:'user-supplied',label:'Import'});assert.equal(d.rows.length,4);assert.equal(d.provenanceVerified,false);assert.equal(d.rows[2].winner,'B');assert.equal(parseObservations(JSON.stringify(d)).rows[0].shareA,.5);
 assert.throws(()=>parseObservations({...d,rule:'approval',shareDefinition:'voteIntentions'}),/countedScore/);assert.throws(()=>parseObservations({...d,rows:d.rows.map(r=>({...r,name:'private voter'}))}),/Only aggregate/);assert.throws(()=>parseObservations({...d,rows:d.rows.map(r=>({...r,shareA:.8}))}),/sum/);assert.throws(()=>parseObservations({...d,rows:d.rows.map(r=>({...r,round:1}))}),/Duplicate/);
});
test('calibration training and holdout are strictly chronological with disjoint simulation seeds',()=>{
 const p=planCalibration(fit);assert(p.trainingEnd<p.holdout[0].round);assert(p.validationSeeds.every(s=>!p.seeds.includes(s)));assert.throws(()=>planCalibration({...fit,validationSeeds:[41]}),/disjoint/);assert.throws(()=>planCalibration({...fit,config:{population:12,rule:'borda'}}),/rule must match/);assert.equal(p.candidates.length,2);
});
test('calibration selects actual training fit and evaluates later timepoints plus naive baselines',()=>{
 const r=calibrateForecast(fit);assert(r.completed);assert.equal(r.bestPatch.turnout,0);assert.equal(r.bestTrainingLoss,0);assert.equal(r.holdoutScores.mae,0);assert.equal(r.baseline.scores.mae,0);assert(r.holdoutScores.winnerObservations>0);assert(Number.isFinite(r.holdoutScores.logLoss));assert.match(r.status,/Synthetic/);assert(r.candidates.find(c=>c.patch.turnout===1).loss>0);
});
test('changing held-out labels cannot change selected parameters or training loss',()=>{
 const a=calibrateForecast(fit),modified=observations();for(const r of modified.rows)if(r.round>3){r.turnout=1;r.winner='A';}const b=calibrateForecast({...fit,observations:modified});assert.deepEqual(a.bestPatch,b.bestPatch);assert.equal(a.bestTrainingLoss,b.bestTrainingLoss);assert.equal(a.holdoutScores.mae,0);assert.equal(b.holdoutScores.mae,1);
});
test('proper categorical losses and descriptive numeric errors use their defined scales',()=>{
 const o=[{round:1,turnout:.5,winner:'A'}],p=[{round:1,turnout:.7,probabilities:{A:.5,B:.5,C:0,none:0}}],s=scorePredictions(o,p);assert(Math.abs(s.mae-.2)<1e-12);assert.equal(s.brier,.5);assert.equal(s.logLoss,-Math.log(.5));assert.equal(s.empiricalIntervalCoverage90,null);
});
test('calibration cancellation marks partial candidate work without fabricated holdout scores',async()=>{let stop=false;const r=await calibrateForecastAsync(fit,{shouldCancel:()=>stop,onProgress:()=>stop=true});assert(r.cancelled&&!r.completed);assert.equal(r.candidates.length,1);assert.equal(r.holdoutScores,null);});
test('synthetic observations are generated by the engine and remain explicitly synthetic',()=>{const d=syntheticObservations({population:12,recordFrames:false},{rounds:8,every:2});assert.equal(d.source,'synthetic');assert.equal(d.rows.length,4);assert.deepEqual(d.rows.map(r=>r.round),[2,4,6,8]);assert.match(d.label,/not observed/);});
test('extreme discrete weights normalize safely and whitespace-normalized duplicate CSV headers reject',()=>{
 const p=planForecast({...base,parameters:[{key:'turnout',distribution:'discrete',values:[0,1],weights:[1e308,1e308]}]});assert.deepEqual(p.parameters[0].weights,[.5,.5]);
 assert.throws(()=>parseObservations('round, round,turnout\n1,1,.5\n2,2,.5\n3,3,.5\n4,4,.5',{rule:'plurality'}),/Duplicate CSV/);
});
test('aggregate imports reject logically incompatible score shares, participation and winners while allowing ties',()=>{
 const fixture={rule:'plurality',rows:[1,2,3,4].map(round=>({round,shareA:.5,shareB:.5,shareC:0,turnout:.5,winner:'B'}))};assert.equal(parseObservations(fixture).rows.length,4);
 assert.throws(()=>parseObservations({...fixture,rows:fixture.rows.map(r=>({...r,winner:'C'}))}),/maximal/);
 assert.throws(()=>parseObservations({...fixture,rows:fixture.rows.map(r=>({...r,turnout:0}))}),/inconsistent/);
 assert.throws(()=>parseObservations({...fixture,rows:fixture.rows.map(r=>({...r,shareA:0,shareB:0,shareC:0,turnout:0,winner:'A'}))}),/inconsistent/);
});
test('V4 behavioral and neural theory parameters are genuinely accepted by ensemble studies',()=>{
 const logit=runForecast({...base,config:{population:12,learner:'logit',recordFrames:false},parameters:[{key:'decisionTemperature',min:.01,max:.3},{key:'stubbornness',min:.2,max:.8},{key:'confirmationBias',min:0,max:.5}]});assert(logit.completed);assert(logit.runs.every(r=>r.patch.stubbornness>=.2&&Number.isFinite(r.metrics.welfare)));
 const neural=runForecast({...base,config:{population:12,learner:'neural',recordFrames:false},parameters:[{key:'neuralRate',min:.001,max:.02}]});assert(neural.completed);assert(neural.runs.every(r=>r.patch.neuralRate>=.001&&Number.isFinite(r.metrics.welfare)));
});
test('scoring helpers reject malformed probabilities and nonnumeric predictions',()=>{
 assert.throws(()=>scorePredictions([{round:1,turnout:.5}],[{round:1,turnout:NaN}]),/finite/);
 assert.throws(()=>scorePredictions([{round:1,winner:'A'}],[{round:1,probabilities:{A:1,B:1,C:0,none:0}}]),/normalized/);
});
