'use strict';
// Generate review candidates only. Geometry proximity is NOT evidence of safe passage.
const fs=require('node:fs');
function auditJunctionCandidates(data,{thresholdPx=4,mapSize=1254}={}){
 if(!data||!Array.isArray(data.nodes)||!Array.isArray(data.edges))throw Error('Invalid graph');
 if(!Number.isFinite(thresholdPx)||thresholdPx<0||!Number.isFinite(mapSize)||mapSize<=0)throw Error('Invalid audit parameters');
 const byId=new Map(data.nodes.map(n=>[n.id,n]));
 const groups=new Map();
 for(const n of data.nodes){if(!groups.has(n.source_fragment))groups.set(n.source_fragment,[]);groups.get(n.source_fragment).push(n)}
 const ends=[...groups].map(([fragment,ns])=>({fragment,points:[ns[0],ns.at(-1)]}));
 const candidates=[];
 for(let i=0;i<ends.length;i++)for(let j=i+1;j<ends.length;j++){
  let best=null;
  for(const a of ends[i].points)for(const b of ends[j].points){
   const d=Math.hypot(a.x-b.x,a.y-b.y)*mapSize;
   if(best===null||d<best.distance_px)best={a:a.id,b:b.id,distance_px:d};
  }
  if(best.distance_px<=thresholdPx+0.002)candidates.push({fragment_a:ends[i].fragment,fragment_b:ends[j].fragment,node_a:best.a,node_b:best.b,distance_px:+best.distance_px.toFixed(3),status:'needs-visual-review',approved:false});
 }
 candidates.sort((a,b)=>a.distance_px-b.distance_px||a.fragment_a.localeCompare(b.fragment_a)||a.fragment_b.localeCompare(b.fragment_b));
 return {schema_version:1,status:'review-only',threshold_px:thresholdPx,candidate_count:candidates.length,approved_count:0,candidates};
}
if(require.main===module){
 const src=process.argv[2]||'docs/mapa-caminos-actualizados-grafo.json',dest=process.argv[3];
 const result=auditJunctionCandidates(JSON.parse(fs.readFileSync(src,'utf8')));
 if(dest)fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({candidate_count:result.candidate_count,approved_count:0,status:result.status}));
}
module.exports={auditJunctionCandidates};
