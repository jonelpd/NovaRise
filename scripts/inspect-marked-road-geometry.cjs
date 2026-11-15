'use strict';
// Geometric warnings only: intersections in a drawing are not proof of passable crossroads.
function inspectRoadGeometry(data){
 if(!data||!Array.isArray(data.nodes)||!Array.isArray(data.edges))throw Error('Invalid road data');
 const nodes=new Map(data.nodes.map(n=>[n.id,n]));
 if(nodes.size!==data.nodes.length)throw Error('Duplicate road nodes');
 const segments=data.edges.map((e,index)=>{
  const a=nodes.get(e.from),b=nodes.get(e.to);
  if(!a||!b||a===b)throw Error('Invalid road segment '+index);
  return {index,from:e.from,to:e.to,a,b};
 });
 function orientation(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)}
 function crossing(p,q){
  const o1=orientation(p.a,p.b,q.a),o2=orientation(p.a,p.b,q.b);
  const o3=orientation(q.a,q.b,p.a),o4=orientation(q.a,q.b,p.b);
  // Strict crossing only: avoid collinear/touching numerical ambiguities.
  const eps=1e-10;
  return Math.abs(o1)>eps&&Math.abs(o2)>eps&&Math.abs(o3)>eps&&Math.abs(o4)>eps&&o1*o2<0&&o3*o4<0;
 }
 const unjoinedCrossings=[];
 for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++){
  const p=segments[i],q=segments[j];
  if([p.from,p.to].some(id=>id===q.from||id===q.to))continue;
  if(crossing(p,q))unjoinedCrossings.push({first:[p.from,p.to],second:[q.from,q.to],review:'crossing-may-be-bridge-or-unjoined-junction'});
 }
 const duplicateEdges=[],seen=new Set();
 for(const e of segments){const k=[e.from,e.to].sort().join('|');if(seen.has(k))duplicateEdges.push([e.from,e.to]);seen.add(k)}
 const allUnverified=data.edges.every(e=>e.verified===false);
 return {nodeCount:nodes.size,edgeCount:segments.length,unjoinedCrossings,duplicateEdges,allUnverified,releaseReady:false};
}
module.exports={inspectRoadGeometry};
if(require.main===module){
 const fs=require('node:fs'),p=process.argv[2];
 if(!p){console.error('Usage: node scripts/inspect-marked-road-geometry.cjs <draft.json>');process.exit(2)}
 try{console.log(JSON.stringify(inspectRoadGeometry(JSON.parse(fs.readFileSync(p,'utf8'))),null,2))}
 catch(e){console.error(e.message);process.exitCode=2}
}
