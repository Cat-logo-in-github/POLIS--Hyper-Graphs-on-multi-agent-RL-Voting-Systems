import{runPair}from './experiments.js';
self.onmessage=e=>{const {jobs}=e.data;try{for(let i=0;i<jobs.length;i++){const result=runPair(jobs[i]);if(i>0){delete result.a;delete result.b;}self.postMessage({index:i,total:jobs.length,result});}self.postMessage({done:true});}catch(e){self.postMessage({error:e.message});}};
