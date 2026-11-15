'use strict';
// Review-only intersection audit. A geometric crossing is NOT a navigable junction.
const fs=require('node:fs');
function cross(a,b){return a.x*b.y-a.y*b.x}
function intersections(data,{epsilon=1e-9}={}){
 if(!data||!Array.isArray(data.nodes)||!Array.isArray(data.edges))throw Error('Invalid road graph');
 if(!Number.isFinite(epsilon)||epsilon<=0||epsilon>=0.01)throw Error('Invalid epsilon');
 const byId=new Map(data.nodes.map(n=>[n.id,n]));
 const seg=data.edges.map((e,i)=>{
  const a=byId.get(e.from),b=byId.get(e.to);
  if(!a||!b)throw Error('Missing node in edge '+i);
  return {i,a,b,fragment:a.source_fragment};
 });
 const candidates=[];
 for(let i=0;i<seg.length;i++)for(let j=i+1;j<seg.length;j++){
  const p=seg[i],q=seg[j];
  if(p.fragment===q.fragment||p.a.id===q.a.id||p.a.id===q.b.id||p.b.id===q.a.id||p.b.id===q.b.id)continue;
  const r={x:p.b.x-p.a.x,y:p.b.y-p.a.y},s={x:q.b.x-q.a.x,y:q.b.y-q.a.y};
  const denom=cross(r,s);
  if(Math.abs(denom)<=epsilon)continue; // collinear overlaps need separate visual review
  const delta={x:q.a.x-p.a.x,y:q.a.y-p.a.y};
  const t=cross(delta,s)/denom,u=cross(delta,r)/denom;
  if(t>=-epsilon&&t<=1+epsilon&&u>=-epsilon&&u<=1+epsilon){
   candidates.push({edge_a:p.i,edge_b:q.i,fragment_a:p.fragment,fragment_b:q.fragment,
    x:+(p.a.x+t*r.x).toFixed(6),y:+(p.a.y+t*r.y).toFixed(6),
    kind:(t>epsilon&&t<1-epsilon&&u>epsilon&&u<1-epsilon)?'interior-crossing':'endpoint-touch',
    status:'needs-visual-review',approved:false});
  }
 }
 return {schema_version:1,status:'review-only',candidate_count:candidates.length,approved_count:0,candidates};
}
if(require.main===module){
 const input=process.argv[2]||'docs/mapa-caminos-actualizados-grafo.json',output=process.argv[3];
 const result=intersections(JSON.parse(fs.readFileSync(input,'utf8')));
 if(output)fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({candidate_count:result.candidate_count,approved_count:0}));
}
module.exports={intersections};
