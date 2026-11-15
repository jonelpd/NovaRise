'use strict';
// Endpoint-to-segment proximity audit; NEVER converts candidates into playable roads.
const fs=require('node:fs');
function auditEndpointSegments(graph,{thresholdPx=4,mapSize=1254}={}){
 if(!graph||!Array.isArray(graph.nodes)||!Array.isArray(graph.edges))throw Error('Invalid graph');
 if(!Number.isFinite(thresholdPx)||thresholdPx<0)throw Error('Invalid threshold');
 const byId=new Map(graph.nodes.map(n=>[n.id,n]));
 const groups=new Map();
 for(const n of graph.nodes){if(!groups.has(n.source_fragment))groups.set(n.source_fragment,[]);groups.get(n.source_fragment).push(n)}
 const ends=[...groups.values()].flatMap(ns=>[ns[0],ns.at(-1)]);
 const candidates=[];
 for(const endpoint of ends)for(let i=0;i<graph.edges.length;i++){
  const edge=graph.edges[i],a=byId.get(edge.from),b=byId.get(edge.to);
  if(!a||!b)throw Error('Missing edge node');
  if(a.source_fragment===endpoint.source_fragment)continue;
  const dx=b.x-a.x,dy=b.y-a.y,length2=dx*dx+dy*dy;
  if(length2===0)continue;
  const t=((endpoint.x-a.x)*dx+(endpoint.y-a.y)*dy)/length2;
  if(t<=0||t>=1)continue; // interior projection only; endpoint pairs audited elsewhere
  const x=a.x+t*dx,y=a.y+t*dy;
  const d=Math.hypot(endpoint.x-x,endpoint.y-y)*mapSize;
  if(d<=thresholdPx+0.002)candidates.push({
   endpoint: endpoint.id,fragment_a:endpoint.source_fragment,
   edge_index:i,fragment_b:a.source_fragment,
   distance_px:+d.toFixed(3),projection:+t.toFixed(6),
   status:'needs-visual-review',approved:false
  });
 }
 candidates.sort((a,b)=>a.distance_px-b.distance_px||a.endpoint.localeCompare(b.endpoint)||a.edge_index-b.edge_index);
 return {schema_version:1,status:'review-only',candidate_count:candidates.length,approved_count:0,candidates};
}
if(require.main===module){
 const result=auditEndpointSegments(JSON.parse(fs.readFileSync(process.argv[2]||'docs/mapa-caminos-actualizados-grafo.json','utf8')));
 if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({candidate_count:result.candidate_count,approved_count:0}));
}
module.exports={auditEndpointSegments};
