import test from 'node:test';
import assert from 'node:assert/strict';
import {createNetwork,predict,trainNetwork,validateNetwork,policyProbabilities,sampleProbabilities} from '../src/neural.js';
import {create,step,copy,checkpoint,restore,configure,neuralValues,behavioralBelief,frameAt,draw,actionCount} from '../src/engine.js';
import {validate,eventDefaults} from '../src/schema.js';
const run=(s,n)=>{for(let i=0;i<n;i++)step(s);return s;};
const opts={actions:4,rate:.02,batch:4,capacity:16,targetEvery:5,gamma:.8};
const transition=(patch={})=>({state:0,action:0,reward:1,nextState:1,terminal:false,round:1,...patch});
const near=(a,b,tol=1e-10)=>assert(Math.abs(a-b)<tol,`${a} differs from ${b}`);

test('neural initialization is deterministic, independent per identity and bounded',()=>{
 const a=createNetwork(42,0),b=createNetwork(42,0),c=createNetwork(42,1);assert.deepEqual(a,b);assert.notDeepEqual(a.w1,c.w1);assert.deepEqual(a.target.w1,a.w1);validateNetwork(a);assert.equal(predict(a,0).length,8);assert.throws(()=>createNetwork(42,0,100));assert.throws(()=>predict(a,18));
});
test('actual neural gradient descends a stationary terminal prediction error',()=>{
 const n=createNetwork(8,0),initial=(predict(n,0)[0]-1)**2+predict(n,0)[1]**2;
 for(let i=0;i<400;i++)trainNetwork(n,transition({action:i%2,reward:i%2?0:1,nextState:null,terminal:true,round:i+1}),{...opts,rate:.05,gamma:0},8,0,i+1);
 const final=(predict(n,0)[0]-1)**2+predict(n,0)[1]**2;assert(final<initial*.05);assert(predict(n,0)[0]>predict(n,0)[1]+.7);assert.equal(n.updates,400);assert.equal(n.targetCopies,80);assert.equal(n.replay.length,16);validateNetwork(n,4);
});
test('neural target uses frozen target weights, terminal removes bootstrap and actual Q moves',()=>{
 const n=createNetwork(42,0),before=copy(n),t=transition(),expected=t.reward+.8*Math.max(...predict(before,1,true).slice(0,4));
 const d=trainNetwork(n,t,opts,42,0,2);near(d.target,expected);near(d.qBefore,predict(before,0)[0]);near(d.qAfter,predict(n,0)[0]);assert.notDeepEqual(n.w2,before.w2);assert.deepEqual(n.target,before.target);assert(Number.isFinite(d.loss)&&d.loss>=0);
 const terminal=trainNetwork(n,transition({terminal:true,nextState:null,reward:.3}),opts,42,0,3);near(terminal.target,.3);
});
test('neural minibatch sampling and target copy boundaries reproduce exactly',()=>{
 const a=createNetwork(4,2),b=createNetwork(4,2);for(let i=1;i<=13;i++){const t=transition({state:i%18,nextState:(i+1)%18,round:i,reward:i/20});assert.deepEqual(trainNetwork(a,t,opts,4,2,i,draw),trainNetwork(b,t,opts,4,2,i,draw));}assert.deepEqual(a,b);assert.equal(a.targetCopies,2);assert.equal(a.replay.length,13);
});
test('neural engine makes real independent network updates without contaminating tabular Q',()=>{
 const s=run(create({population:12,learner:'neural',recordFrames:false,neuralTarget:2}),5);assert(s.config.learning);assert(s.agents.every(a=>a.neural.updates===4));assert(s.agents.every(a=>a.q.flat().every(v=>v===0)));const d=neuralValues(s,0);assert.equal(d.values.length,actionCount(s.config));assert.equal(d.parameters,224);assert(d.loss>=0);assert.equal(d.targetCopies,2);assert.equal(s.agents[0].lastUpdate.learner,'neural');assert(s.agents[0].lastUpdate.qAfter!==s.agents[0].lastUpdate.qBefore);assert.notDeepEqual(s.agents[0].neural.w1,s.agents[1].neural.w1);
});
test('full neural checkpoint includes replay and gives exact continuing and finite futures',()=>{
 for(const mode of ['continuing','finiteHorizon']){
  const original=run(create({population:12,learner:'neural',taskMode:mode,episodeLength:5,recordFrames:false}),7),restored=restore(checkpoint(original));
  for(let i=0;i<6;i++){assert.deepEqual(step(original),step(restored));assert.deepEqual(checkpoint(original),checkpoint(restored));}assert(original.agents[0].neural.replay.length>5);
 }
});
test('historical neural frame is actual, deep independent and validated on restore',()=>{
 const s=run(create({population:12,learner:'neural',frameLimit:10}),4),past=frameAt(s,2),at2=neuralValues(past,0);assert.equal(at2.updates,1);assert.equal(neuralValues(s,0).updates,3);past.agents[0].neural.w1[0][0]=9;assert.notEqual(frameAt(s,2).agents[0].neural.w1[0][0],9);
 const bad=checkpoint(s);bad.frames[0].agents[0].neural.target.w2[0][0]=null;assert.throws(()=>restore(bad),/neural/);
});
test('checkpoint validation rejects corrupt network, replay, anchor and numerical update data',()=>{
 const source=checkpoint(run(create({population:12,learner:'neural',recordFrames:false}),3));
 for(const corrupt of [s=>s.agents[0].neural.w1[0].pop(),s=>s.agents[0].neural.replay[0].action=9,s=>s.agents[0].neural.target=null,s=>s.agents[0].lastUpdate.loss=-1,s=>s.agents[0].anchorBelief[0]=2,s=>delete s.agents[0].neural]){const s=copy(source);corrupt(s);assert.throws(()=>restore(s));}
});
test('ballot-semantics reset clears neural replay while ordinary topology edits preserve weights',()=>{
 const s=run(create({population:12,learner:'neural',recordFrames:false}),4),before=copy(s.agents[0].neural);configure(s,{aggregation:'linear'});assert.deepEqual(s.agents[0].neural,before);configure(s,{rule:'borda'});assert.equal(s.agents[0].neural.updates,0);assert.equal(s.agents[0].neural.replay.length,0);assert.equal(s.agents[0].pending,null);run(s,2);assert(s.agents[0].neural.updates>0);configure(s,{neuralHidden:12});assert.equal(s.agents[0].neural.hidden,12);assert.equal(s.agents[0].neural.updates,0);
});
test('switching learners keeps neural and tabular representations separate and neutral no-op preserves pending',()=>{
 const s=run(create({population:12,recordFrames:false}),3),tab=copy(s.agents[0].q);configure(s,{learner:'neural'});run(s,3);assert.deepEqual(s.agents[0].q,tab);const old=checkpoint(s);configure(s,copy(s.config));assert.deepEqual(checkpoint(s),old);configure(s,{learner:'q'});assert.deepEqual(s.agents[0].q,tab);assert.equal(s.agents[0].pending,null);
});
test('resizing a dormant neural model preserves active tabular transition and exact future updates',()=>{
 const s=run(create({population:12,recordFrames:false}),3);configure(s,{learner:'neural'});run(s,3);configure(s,{learner:'q'});run(s,2);
 const control=restore(checkpoint(s)),pending=copy(s.agents[0].pending),history=copy(s.agents[0].updateHistory);assert(pending);assert.equal(s.agents[0].lastUpdate.learner,'q');
 configure(s,{neuralHidden:12});assert.equal(s.agents[0].neural.hidden,12);assert.equal(s.agents[0].neural.updates,0);assert.deepEqual(s.agents[0].pending,pending);assert.deepEqual(s.agents[0].updateHistory,history);
 assert.deepEqual(step(s),step(control));assert.deepEqual(s.agents.map(a=>a.q),control.agents.map(a=>a.q));assert.equal(s.agents[0].lastUpdate.actionRound,pending.round);
});
test('logit probabilities are normalized, stable and have an exact zero-temperature limit',()=>{
 const ps=policyProbabilities([1000,999,998],.1);near(ps.reduce((a,b)=>a+b),1);assert(ps[0]>ps[1]&&ps[1]>ps[2]);assert.deepEqual(policyProbabilities([1,1,0],0),[.5,.5,0]);assert.equal(sampleProbabilities([.1,.2,.7],.5),2);assert.throws(()=>policyProbabilities([NaN],1));
 const s=run(create({population:12,learner:'logit',recordFrames:false}),3);assert(!s.config.learning);assert(s.agents.every(a=>a.lastUpdate===null&&a.pending===null));assert(s.agents.every(a=>Math.abs(a.decisionProbabilities.reduce((a,b)=>a+b)-1)<1e-12));
});
test('zero-default behavioral controls preserve exact keyed transitions',()=>{
 const a=create({population:12,recordFrames:false}),b=create({population:12,recordFrames:false,stubbornness:0,confirmationBias:0});for(let i=0;i<10;i++)assert.deepEqual(step(a),step(b));assert.deepEqual(checkpoint(a),checkpoint(b));const candidate=[.2,.8,.3];assert.equal(behavioralBelief([.8,.2,.1],candidate,[1,0,0],{stubbornness:0,confirmationBias:0}),candidate);
});
test('stubbornness and confirmation bias have explicit inspectable modeled effects',()=>{
 assert.deepEqual(behavioralBelief([.8,.2,.1],[.4,.5,.1],[.9,.1,.2],{confirmationBias:1,stubbornness:0}),[.8,.2,.1]);assert.deepEqual(behavioralBelief([.8,.2,.1],[.4,.5,.1],[.9,.1,.2],{confirmationBias:0,stubbornness:1}),[.9,.1,.2]);
 const event={...copy(eventDefaults),start:1,duration:10,coverage:1,intensity:1},s=create({population:12,learner:'sincere',stubbornness:1,noise:0,recordFrames:false,events:[event]}),initial=s.agents.map(a=>[...a.belief]);run(s,5);assert.deepEqual(s.agents.map(a=>a.belief),initial);assert(s.agents.some(a=>a.distortion.some(v=>v>0)));assert.equal(s.agents[0].latestTrace.stubbornness,1);assert(Array.isArray(s.agents[0].latestTrace.rawBelief));
});
test('V4 schema migrates prior settings and validates bounded neural/behavioral controls',()=>{
 assert.equal(validate({version:2,learning:false}).version,4);assert.equal(validate({version:3}).version,4);assert.equal(validate({learner:'neural',learning:false}).learning,true);assert.equal(validate({learner:'logit',learning:true}).learning,false);
 for(const patch of [{neuralHidden:25},{neuralRate:0},{neuralReplay:1},{neuralBatch:17},{neuralTarget:0},{decisionTemperature:-1},{stubbornness:1.1},{confirmationBias:2}])assert.throws(()=>validate(patch));
});
