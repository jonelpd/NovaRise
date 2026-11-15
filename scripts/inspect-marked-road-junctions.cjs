'use strict';
// Graph-topology audit only. A mathematical fork does not establish a walkable road.
function inspectJunctions(road, specs){
 if(!road||!Array.isArray(road.nodes)||!Array.isArray(road.edges)||!Array.isArray(specs))throw Error('Invalid junction audit inputs');
 const nodes=new Map(road.nodes.map(n=>[n.id,n]));
 if(nodes.size!==road.nodes.length)throw Error('Duplicate node IDs');
 const adj=new Map([...nodes.keys()].map(id=>[id,new Set()]));
 for(const edge of road.edges){
  if(!adj.has(edge.from)||!adj.has(edge.to)||edge.from===edge.to)throw Error('Invalid road edge');
  adj.get(edge.from).add(edge.to);adj.get(edge.to).add(edge.from);
 }
 return specs.map(spec=>{
  const node=nodes.get(spec.node_id);
  if(!node)throw Error('Unknown junction '+spec.node_id);
  const neighbors=[...adj.get(spec.node_id)].sort();
  const expected=[...spec.expected_neighbors].sort();
  return {id:spec.id,node_id:spec.node_id,pixel:node.pixel,degree:neighbors.length,neighbors,topologyMatches:JSON.stringify(neighbors)===JSON.stringify(expected),visuallyApproved:false};
 });
}
module.exports={inspectJunctions};
if(require.main===module){
 const fs=require('node:fs');
 const road=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
 const audit=JSON.parse(fs.readFileSync('docs/auditoria-bifurcaciones-torre-central.json','utf8'));
 const report=inspectJunctions(road,audit.junction_specs);
 console.log(JSON.stringify(report,null,2));
 if(report.some(x=>!x.topologyMatches))process.exitCode=1;
}
