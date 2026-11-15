'use strict';
// Converts extracted cyan strokes into an isolated, unapproved road graph.
// Never joins close endpoints: proximity alone does not prove a traversable junction.
const fs=require('node:fs');
const crypto=require('node:crypto');
const {inspectBulkTrace}=require('./inspect-bulk-road-trace.cjs');
function convertBulkTrace(data){
 const audit=inspectBulkTrace(data);
 if(audit.errors.length)throw Error('Invalid extraction: '+audit.errors.join('; '));
 const nodes=[],edges=[];
 for(const f of data.fragments){
  f.points.forEach(([x,y],i)=>{
   const id=f.id+'-p'+String(i).padStart(4,'0');
   nodes.push({id,x,y,source_fragment:f.id});
   if(i)edges.push({from:f.id+'-p'+String(i-1).padStart(4,'0'),to:id,verified:false});
  });
 }
 return {schema_version:2,status:'draft-unverified',coordinate_system:'normalized',
  map_asset:'mapa-grande.png',source_image:data.source_image,
  note:'Auto-extracted strokes; each fragment isolated. Junctions, obstacles and access require visual approval.',
  nodes,edges,navigation_enabled:false};
}
if(require.main===module){
 const input=process.argv[2],output=process.argv[3];
 if(!input||!output){console.error('Usage: node scripts/import-bulk-road-trace.cjs input.json output.json');process.exit(2)}
 const data=JSON.parse(fs.readFileSync(input,'utf8'));
 const result=convertBulkTrace(data);
 fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({nodes:result.nodes.length,edges:result.edges.length,status:result.status}));
}
module.exports={convertBulkTrace};
