import {runPair,runSweepAsync} from './experiments.js';
import {evaluateRulesAsync,trainCandidate} from './evaluation.js';
let cancelled=false,running=false;
self.onmessage=async e=>{
  if(e.data.cancel){cancelled=true;return;}if(running){self.postMessage({error:'A worker experiment is already running'});return;}running=true;cancelled=false;
  try{
    const sweep=e.data.sweep||(e.data.type==='sweep'?e.data.options:null);
    if(e.data.type==='candidate'){const result=trainCandidate(e.data.options);self.postMessage({candidateDone:true,result});}
    else if(e.data.type==='evaluation'){const result=await evaluateRulesAsync(e.data.options,{shouldCancel:()=>cancelled,onProgress:progress=>self.postMessage({evaluationProgress:progress})});self.postMessage({evaluationDone:true,result});}
    else if(sweep){const result=await runSweepAsync(sweep,{shouldCancel:()=>cancelled,onProgress:(cell,progress)=>self.postMessage({sweepProgress:{cell:{id:cell.id,status:cell.status},completedSteps:progress.completedSteps,totalSteps:progress.totalSteps,total:progress.cells.length,completed:progress.cells.filter(c=>c.status==='complete').length}})});self.postMessage({sweepDone:true,result,sweepResult:result,done:true,cancelled:result.cancelled});}
    else{const{jobs}=e.data;if(!Array.isArray(jobs)||jobs.length>144)throw Error('Use at most 144 bounded paired jobs');const work=jobs.reduce((n,j)=>n+2*(j.rounds??200),0),agentWork=jobs.reduce((n,j)=>n+2*(j.rounds??200)*(j.snapshot?.agents?.length??j.config?.population??72),0);if(work>50000||agentWork>6000000)throw Error('Worker jobs exceed 50,000 branch transitions or 6,000,000 agent updates');for(let i=0;i<jobs.length;i++){if(cancelled)break;const result=runPair({...jobs[i],recordFrames:i===0&&jobs[i].recordFrames!==false,shouldCancel:()=>cancelled});if(i>0){delete result.a;delete result.b;delete result.checkpoint;delete result.pairedFrames;result.protocol.snapshot=null;result.protocol.snapshotStoredInParent=true;}self.postMessage({index:i,total:jobs.length,result});await new Promise(resolve=>setTimeout(resolve,0));}self.postMessage({done:true,cancelled});}
  }catch(error){self.postMessage({error:error.message,cancelled});}finally{running=false;}
};
