import test from 'node:test';
import assert from 'node:assert/strict';
import {create,step,restore,checkpoint,configure,copy} from '../src/engine.js';
import {runForecast} from '../src/forecast.js';

test('conditional neural forecasts preserve online/target/replay/pending state and match actual reseeded continuation',()=>{
  for(const taskMode of ['continuing','finiteHorizon']){
    const original=create({population:12,learner:'neural',taskMode,episodeLength:5,recordFrames:false});for(let i=0;i<6;i++)step(original);
    const saved=checkpoint(original),forecast=runForecast({snapshot:original,seeds:[999],rounds:5,window:2,parameters:[{key:'turnout',min:.55,max:.55}]});
    assert.deepEqual(checkpoint(original),saved);assert.deepEqual(forecast.protocol.snapshot.agents.map(a=>a.neural),saved.agents.map(a=>a.neural));assert.deepEqual(forecast.protocol.snapshot.agents.map(a=>a.pending),saved.agents.map(a=>a.pending));
    const manual=restore(saved);manual.config.seed=999;manual.recordFrames=false;configure(manual,{turnout:.55});
    const actual=[];for(let i=0;i<5;i++){const m=step(manual),scores=manual.lastElection.shares;actual.push({round:manual.round,winner:m.winner===null?'none':['A','B','C'][m.winner],shareA:scores[0],shareB:scores[1],shareC:scores[2],turnout:m.turnout,welfare:m.welfare,error:m.error,regret:m.regret,reward:m.reward});}
    assert.deepEqual(forecast.runs[0].trajectory,actual);assert.equal(forecast.protocol.origin,6);assert.equal(forecast.protocol.targetRound,11);assert.equal(forecast.runs[0].metrics.reward,(actual[3].reward+actual[4].reward)/2);
    assert.notDeepEqual(manual.agents[0].neural,saved.agents[0].neural);
  }
});
