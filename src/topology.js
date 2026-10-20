// Topology construction is deliberately independent of signal aggregation.
const distance=(a,b)=>Math.sqrt(a.ideal.reduce((z,v,k)=>z+(v-b.ideal[k])**2,0))/Math.sqrt(12);
export function generateGroups(s,draw,size=s.config.groupSize){
 const c=s.config;if(c.grouping==='manual')return[];
 const eligible=s.agents.filter(a=>draw(c.seed,0,a.id,31)>=c.isolation),stride=Math.max(1,size-Math.min(size-1,c.overlap)),groups=[];
 for(let i=0;i<eligible.length;i+=stride){
  const anchor=eligible[i],others=eligible.filter(a=>a.id!==anchor.id).map(a=>{
   let similarity=c.grouping==='community'?(a.communities.some(g=>anchor.communities.includes(g))?0:1):c.grouping==='ideal'?distance(a,anchor):c.grouping==='action'?(a.action===anchor.action?0:1):0;
   return{id:a.id,score:draw(c.seed,0,a.id,32,i)+c.homophily*similarity+c.geographicLocality*Math.hypot(a.x-anchor.x,a.y-anchor.y)};
  }).sort((a,b)=>a.score-b.score||a.id-b.id),members=[anchor.id];
  for(let j=0;j<Math.min(size-1,others.length);j++){
   let id=others.find(a=>!members.includes(a.id))?.id;
   if(draw(c.seed,0,i,33,j)<c.bridges)id=[...others].sort((a,b)=>draw(c.seed,0,a.id,34,i+j)-draw(c.seed,0,b.id,34,i+j)).find(a=>!members.includes(a.id))?.id;
   if(id!==undefined)members.push(id);
  }
  if(members.length>1)groups.push({id:'g'+groups.length,name:'Interaction '+groups.length,members,active:true,manual:false});
 }
 return groups;
}
export function projectGroups(groups){
 const edges=[];for(const g of groups)for(let i=0;i<g.members.length;i++)for(let j=i+1;j<g.members.length;j++)edges.push({id:'clique:'+g.id+':'+i+':'+j,name:'Pair from '+g.name,members:[g.members[i],g.members[j]],active:g.active,manual:g.manual,sourceGroup:g.id});
 return edges; // Parallel pairs from overlapping groups remain explicit incidences.
}
export function randomizedGroups(groups,seed,draw,round=0){
 const gs=structuredClone(groups),slots=gs.flatMap((g,i)=>g.members.map((_,j)=>[i,j]));
 // Finite degree-preserving swaps; not a uniform sample from a configuration model.
 for(let n=0;n<slots.length*10;n++){
  const x=slots[Math.floor(draw(seed,round,n,81)*slots.length)],y=slots[Math.floor(draw(seed,round,n,82)*slots.length)];
  if(!x||!y||x[0]===y[0])continue;const a=gs[x[0]],b=gs[y[0]],u=a.members[x[1]],v=b.members[y[1]];
  if(a.active!==b.active||u===v||a.members.includes(v)||b.members.includes(u))continue;a.members[x[1]]=v;b.members[y[1]]=u;
 }
 return gs;
}
export function constrainMemberships(groups,budget){
 if(!budget)return groups;const out=[];let remaining=budget;
 for(const g of groups){if(!g.active){out.push(g);continue;}if(remaining<2)continue;const members=g.members.slice(0,remaining);out.push({...g,members});remaining-=members.length;}
 return out;
}
export function buildTopology(s,draw){
 const c=s.config,base=generateGroups(s,draw);s.baseGroups=structuredClone(base);
 let groups=c.topology==='none'?[]:c.topology==='clique'?projectGroups(base):c.topology==='randomized'?randomizedGroups(base,c.seed,draw):c.topology==='pairwise'?generateGroups(s,draw,2):base;
 if(c.matchingStrategy==='membership')groups=constrainMemberships(groups,c.membershipBudget);
 return groups;
}
