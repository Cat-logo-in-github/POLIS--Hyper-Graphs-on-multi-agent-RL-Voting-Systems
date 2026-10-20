// Browser-local independent DQN building blocks. No empirical voter model is implied.
const clone=x=>JSON.parse(JSON.stringify(x));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const zeros=(n,m)=>Array.from({length:n},()=>Array(m).fill(0));
const weights=n=>({w1:clone(n.w1),b1:[...n.b1],w2:clone(n.w2),b2:[...n.b2]});
const integer=(x,lo,hi,label)=>{if(!Number.isInteger(x)||x<lo||x>hi)throw Error('Invalid neural '+label);};
const finite=(x,label)=>{if(!Number.isFinite(x))throw Error('Invalid neural '+label);};
function counter(seed,round,id,channel=0,slot=0){let t=(seed^Math.imul(round+1,0x9e3779b1)^Math.imul(id+1,0x85ebca6b)^Math.imul(channel+1,0xc2b2ae35)^Math.imul(slot+1,0x27d4eb2f))>>>0;t=Math.imul(t^t>>>16,0x7feb352d);t=Math.imul(t^t>>>15,0x846ca68b);return((t^t>>>16)>>>0)/4294967296;}

export function createNetwork(seed,id,hidden=8,random=counter){
  integer(hidden,4,24,'hidden width');const a=Math.sqrt(6/(18+hidden)),b=Math.sqrt(6/(hidden+8));
  const n={input:18,hidden,outputs:8,w1:Array.from({length:hidden},(_,j)=>Array.from({length:18},(_,k)=>(2*random(seed,0,id,70,j*18+k)-1)*a)),b1:Array(hidden).fill(0),w2:Array.from({length:8},(_,j)=>Array.from({length:hidden},(_,k)=>(2*random(seed,0,id,71,j*hidden+k)-1)*b)),b2:Array(8).fill(0),replay:[],updates:0,targetCopies:0,lastLoss:null,lastGradientNorm:0};
  n.target=weights(n);return n;
}
function forward(n,state,target=false){
  integer(state,0,17,'observation');const w=target?n.target:n,h=w.b1.map((bias,j)=>Math.tanh(bias+w.w1[j][state])),q=w.b2.map((bias,k)=>bias+h.reduce((v,z,j)=>v+w.w2[k][j]*z,0));return{h,q};
}
export const predict=(network,state,target=false)=>forward(network,state,target).q;
export function policyProbabilities(values,temperature){
  if(!Array.isArray(values)||!values.length||values.some(v=>!Number.isFinite(v))||!Number.isFinite(temperature)||temperature<0)throw Error('Invalid logit scores or temperature');
  const best=Math.max(...values);if(temperature===0){const count=values.filter(v=>v===best).length;return values.map(v=>v===best?1/count:0);}
  const xs=values.map(v=>Math.exp((v-best)/temperature)),sum=xs.reduce((a,b)=>a+b,0);return xs.map(v=>v/sum);
}
export function sampleProbabilities(ps,u){if(!Number.isFinite(u)||u<0||u>=1)throw Error('Invalid decision draw');let total=0;for(let i=0;i<ps.length;i++){total+=ps[i];if(u<total)return i;}return ps.length-1;}

function validTransition(t,actionCount=8){
  if(!t||typeof t!=='object')throw Error('Invalid neural transition');integer(t.state,0,17,'state');integer(t.action,0,actionCount-1,'action');finite(t.reward,'reward');integer(t.round,0,1e12,'round');if(typeof t.terminal!=='boolean'||(t.terminal?t.nextState!==null:!Number.isInteger(t.nextState)||t.nextState<0||t.nextState>17))throw Error('Invalid neural terminal/next observation');
}
export function trainNetwork(n,transition,config,seed,id,round,random=counter){
  const actions=config.actions,rate=config.rate,batch=config.batch,capacity=config.capacity,targetEvery=config.targetEvery;
  integer(actions,1,8,'action count');integer(batch,1,16,'batch size');integer(capacity,8,256,'replay capacity');integer(targetEvery,1,500,'target interval');if(!Number.isFinite(rate)||rate<.0001||rate>.2||!Number.isFinite(config.gamma)||config.gamma<0||config.gamma>1)throw Error('Invalid neural rate or discount');validTransition(transition,actions);
  const p={state:transition.state,action:transition.action,reward:transition.reward,nextState:transition.nextState,terminal:transition.terminal,round:transition.round};
  n.replay.push(p);while(n.replay.length>capacity)n.replay.shift();
  const size=Math.min(batch,n.replay.length),items=[p];for(let j=1;j<size;j++)items.push(n.replay[Math.floor(random(seed,round,id,74,j)*n.replay.length)]);
  const gradients={w1:zeros(n.hidden,18),b1:Array(n.hidden).fill(0),w2:zeros(8,n.hidden),b2:Array(8).fill(0)};
  const qBefore=predict(n,p.state)[p.action],target=p.reward+(p.terminal?0:config.gamma*Math.max(...predict(n,p.nextState,true).slice(0,actions)));let loss=0;
  for(const t of items){
    const {h,q}=forward(n,t.state),y=t.reward+(t.terminal?0:config.gamma*Math.max(...predict(n,t.nextState,true).slice(0,actions))),delta=q[t.action]-y,g=clamp(delta,-1,1);
    loss+=Math.abs(delta)<=1?.5*delta*delta:Math.abs(delta)-.5;gradients.b2[t.action]+=g;
    for(let j=0;j<n.hidden;j++){gradients.w2[t.action][j]+=g*h[j];const gh=g*n.w2[t.action][j]*(1-h[j]*h[j]);gradients.w1[j][t.state]+=gh;gradients.b1[j]+=gh;}
  }
  const flat=[...gradients.w1.flat(),...gradients.b1,...gradients.w2.flat(),...gradients.b2],norm=Math.sqrt(flat.reduce((v,g)=>v+(g/size)**2,0)),scale=norm>5?5/norm:1,eta=rate*scale/size;
  for(const key of ['w1','w2'])n[key]=n[key].map((row,j)=>row.map((v,k)=>clamp(v-eta*gradients[key][j][k],-10,10)));
  for(const key of ['b1','b2'])n[key]=n[key].map((v,j)=>clamp(v-eta*gradients[key][j],-10,10));
  n.updates++;n.lastLoss=loss/size;n.lastGradientNorm=norm;const targetCopied=n.updates%targetEvery===0;if(targetCopied){n.target=weights(n);n.targetCopies++;}
  return{qBefore,qAfter:predict(n,p.state)[p.action],target,tdError:target-qBefore,loss:n.lastLoss,batchSize:size,replaySize:n.replay.length,gradientNorm:norm,gradientScale:scale,targetCopied,networkUpdates:n.updates,targetCopies:n.targetCopies,learner:'neural'};
}
export function validateNetwork(n,actionCount=8){
  if(!n||n.input!==18||n.outputs!==8)throw Error('Invalid neural network');integer(n.hidden,4,24,'hidden width');
  for(const w of [n,n.target]){
    if(!w)throw Error('Missing neural target network');for(const[key,rows,cols]of[['w1',n.hidden,18],['w2',8,n.hidden]])if(!Array.isArray(w[key])||w[key].length!==rows||w[key].some(row=>!Array.isArray(row)||row.length!==cols||row.some(v=>!Number.isFinite(v)||Math.abs(v)>10)))throw Error('Invalid neural weights');
    for(const[key,size]of[['b1',n.hidden],['b2',8]])if(!Array.isArray(w[key])||w[key].length!==size||w[key].some(v=>!Number.isFinite(v)||Math.abs(v)>10))throw Error('Invalid neural bias');
  }
  integer(n.updates,0,1e12,'update count');integer(n.targetCopies,0,n.updates,'target copies');if(n.lastLoss!==null&&(!Number.isFinite(n.lastLoss)||n.lastLoss<0))throw Error('Invalid neural loss');if(!Number.isFinite(n.lastGradientNorm)||n.lastGradientNorm<0)throw Error('Invalid neural gradient');
  if(!Array.isArray(n.replay)||n.replay.length>256)throw Error('Invalid neural replay');n.replay.forEach(t=>validTransition(t,actionCount));return n;
}
