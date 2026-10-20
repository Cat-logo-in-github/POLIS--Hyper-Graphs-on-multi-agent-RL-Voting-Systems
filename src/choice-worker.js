import {runHandbookExperiment} from './social-choice.js';
self.onmessage=e=>{try{self.postMessage({result:runHandbookExperiment(e.data.chapter,e.data.input)});}catch(error){self.postMessage({error:error.message});}};
