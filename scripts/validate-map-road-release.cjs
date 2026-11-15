'use strict';
// Release gate for original-map navigation; does not infer walkability from pixels.
const {createRoadGraph}=require('./map-road-graph.cjs');
function validateRoadRelease(data,requiredAccessIds=[]){
 const errors=[];
 if(!data||typeof data!=='object')return {ready:false,errors:['Road data missing']};
 if(data.schema_version!==2)errors.push('Unsupported road schema');
 if(data.coordinate_system!=='normalized')errors.push('Coordinates must be normalized');
 if(data.status!=='approved')errors.push('Road map has not been approved');
 if(typeof data.map_asset!=='string'||!data.map_asset.trim())errors.push('Final map asset not identified');
 if(!/^[a-f0-9]{64}$/i.test(data.map_sha256||''))errors.push('Final map SHA-256 missing');
 if(!Array.isArray(data.nodes)||!Array.isArray(data.edges))return {ready:false,errors:[...errors,'Nodes and edges must be arrays']};
 const ids=new Set();
 for(const node of data.nodes){
  if(!node||typeof node.id!=='string'||!node.id.trim()||ids.has(node.id)||!Number.isFinite(node.x)||!Number.isFinite(node.y)||node.x<0||node.x>1||node.y<0||node.y>1)errors.push('Invalid or repeated node');
  else ids.add(node.id);
 }
 const pairs=new Set();
 for(const edge of data.edges){
  if(!edge||Array.isArray(edge)||typeof edge.from!=='string'||typeof edge.to!=='string'||!ids.has(edge.from)||!ids.has(edge.to)||edge.from===edge.to){errors.push('Invalid road connection');continue}
  const pair=[edge.from,edge.to].sort().join('|');
  if(pairs.has(pair))errors.push('Duplicate road connection');
  pairs.add(pair);
  if(edge.verified!==true)errors.push('Unverified road connection');
 }
 if(!data.edges.length)errors.push('No road connections');
 if(!errors.length){
  const graph=createRoadGraph(data.nodes,data.edges,{verifiedOnly:true});
  for(const id of requiredAccessIds){
   if(!ids.has(id))errors.push('Required access missing: '+id);
   else if(!graph.route(data.nodes[0].id,id))errors.push('Required access disconnected: '+id);
  }
 }
 return {ready:errors.length===0,errors};
}
module.exports={validateRoadRelease};
