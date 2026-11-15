'use strict';
// Report disconnected components; never authorize geometric proximity as movement.
const fs=require('node:fs');
function auditConnectivity(graph){
 if(!graph||!Array.isArray(graph.nodes)||!Array.isArray(graph.edges))throw Error('Invalid road graph');
 const parent=new Map(graph.nodes.map(n=>[n.id,n.id]));
 if(parent.size!==graph.nodes.length)throw Error('Duplicate node IDs');
 function root(id){if(!parent.has(id))throw Error('Missing node '+id);while(parent.get(id)!==id)id=parent.get(id);return id}
 for(const edge of graph.edges){const a=root(edge.from),b=root(edge.to);if(a!==b)parent.set(a,b)}
 const components=new Map();
 for(const node of graph.nodes){const key=root(node.id);if(!components.has(key))components.set(key,[]);components.get(key).push(node.id)}
 const sizes=[...components.values()].map(nodes=>nodes.length).sort((a,b)=>b-a);
 return {schema_version:1,status:'review-only',node_count:graph.nodes.length,edge_count:graph.edges.length,component_count:components.size,largest_component_nodes:sizes[0]||0,component_sizes:sizes,fully_connected:components.size===1,approved:false};
}
if(require.main===module){
 const input=process.argv[2]||'docs/mapa-caminos-actualizados-grafo.json';
 const report=auditConnectivity(JSON.parse(fs.readFileSync(input,'utf8')));
 console.log(JSON.stringify(report,null,2));
}
module.exports={auditConnectivity};
