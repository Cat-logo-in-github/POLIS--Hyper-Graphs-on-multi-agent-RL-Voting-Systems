import test from 'node:test';
import assert from 'node:assert/strict';
import {create,step} from '../src/engine.js';
import {copy} from '../src/schema.js';
import {runPair,agentDivergence} from '../src/experiments.js';
test('V4 divergence detects actual neural parameters even when tabular caches match',()=>{const a=create({population:12,learner:'neural',recordFrames:false}),b=copy(a);b.agents[0].neural.w1[0][0]+=.001;const d=agentDivergence(a,b);assert.equal(d.count,1);assert(d.agents[0].fields.includes('neural'));assert.deepEqual(a.agents[0].q,b.agents[0].q);});
test('V4 recorded neural pair obeys a tighter retention cap and preserves exact transitions',()=>{const r=runPair({config:{population:12,learner:'neural',neuralReplay:256,neuralHidden:24,recordFrames:false},seed:42,rounds:30,maxFrames:100});assert(r.recording.cap<100);assert.equal(r.pairedFrames[0].round,0);assert.equal(r.pairedFrames.at(-1).round,30);assert.deepEqual(r.a.agents,r.b.agents);const s=create({population:12,learner:'neural',neuralReplay:256,neuralHidden:24,recordFrames:false});for(let i=0;i<30;i++)step(s);assert.deepEqual(r.a.agents,s.agents);});
test('V4 oversized detailed neural replay fails with a clear workload message',()=>{assert.throws(()=>runPair({config:{population:600,learner:'neural',neuralHidden:24,neuralReplay:256,recordFrames:false},rounds:1,recordFrames:true}),/retained-state budget/);});
