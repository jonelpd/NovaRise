'use strict';
// Pure topology audit: suggestions are NOT evidence that terrain is walkable.
function auditRoadTopology(data,threshold=.04){
 if(!data||!Array.isArray(data.nodes)||!Array.isArray(data.edges))throw Error('Invalid road data');
 if(!Number.isFinite(threshold)||threshold<=0||threshold>1)throw Error('Invalid threshold');
 const byId=new Map(data.nodes.map(n=>[n.id,n])),adj=new Map(data.nodes.map(n=>[n.id,new Set()]));
 if(byId.size!==data.nodes.length)throw Error('Duplicate nodes');
 for(const e of data.edges){
  const a=Array.isArray(e)?e[0]:e.from,b=Array.isArray(e)?e[1]:e.to;
  if(!adj.has(a)||!adj.has(b)||a===b)throw Error('Invalid edge');
  adj.get(a).add(b);adj.get(b).add(a);
 }
 const components=[],seen=new Set();
 for(const id of adj.keys()){
  if(seen.has(id))continue;
  const queue=[id],members=[];seen.add(id);
  for(let i=0;i<queue.length;i++){const u=queue[i];members.push(u);for(const v of adj.get(u))if(!seen.has(v)){seen.add(v);queue.push(v)}}
  components.push({size:members.length,first:members[0],last:members[members.length-1],ids:members});
 }
 const endpoints=[...adj].filter(([,ns])=>ns.size===1).map(([id])=>byId.get(id));
 const componentOf=new Map();components.forEach((c,i)=>c.ids.forEach(id=>componentOf.set(id,i)));
 const candidates=[];
 for(let i=0;i<endpoints.length;i++)for(let j=i+1;j<endpoints.length;j++){
  const a=endpoints[i],b=endpoints[j];
  if(componentOf.get(a.id)===componentOf.get(b.id))continue;
  const distance=Math.hypot(a.x-b.x,a.y-b.y);
  if(distance<=threshold)candidates.push({from:a.id,to:b.id,distance:+distance.toFixed(6),status:'unverified-needs-visual-review'});
 }
 candidates.sort((a,b)=>a.distance-b.distance||a.from.localeCompare(b.from));
 return {nodeCount:data.nodes.length,edgeCount:data.edges.length,componentCount:components.length,components:components.map(({size,first,last})=>({size,first,last})),endpoints:endpoints.map(n=>n.id),candidates};
}
module.exports={auditRoadTopology};
if(require.main===module){
 const fs=require('node:fs');const file=process.argv[2],threshold=process.argv[3]===undefined?.04:Number(process.argv[3]);
 if(!file){console.error('Usage: node scripts/audit-map-road-topology.cjs <roads.json> [max_normalized_distance]');process.exit(2)}
 try{const result=auditRoadTopology(JSON.parse(fs.readFileSync(file,'utf8')),threshold);console.log(JSON.stringify(result,null,2));if(result.componentCount>1)process.exitCode=1}catch(e){console.error(e.message);process.exitCode=2}
}
