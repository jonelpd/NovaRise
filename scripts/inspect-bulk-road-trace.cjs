'use strict';
// Validate raw cyan-ink extraction. Raw fragments must never be used as approved navigation.
const fs=require('node:fs');
function inspectBulkTrace(data){
 const errors=[];
 if(!data||data.schema_version!==1||data.status!=='extracted-unverified')errors.push('Unapproved extraction schema/status required');
 if(data?.coordinate_system!=='normalized'||data?.width!==1254||data?.height!==1254)errors.push('Unexpected image geometry');
 if(!Array.isArray(data?.fragments)||!data.fragments.length)return {ready:false,errors:[...errors,'No fragments']};
 const ids=new Set();let points=0;
 for(const f of data.fragments){
  if(typeof f.id!=='string'||ids.has(f.id))errors.push('Duplicate or missing fragment ID');
  ids.add(f.id);
  if(f.verified!==false)errors.push('Raw fragment incorrectly approved');
  if(!Array.isArray(f.points)||f.points.length<2){errors.push('Fragment has fewer than two points');continue}
  for(const p of f.points){points++;if(!Array.isArray(p)||p.length!==2||!p.every(v=>Number.isFinite(v)&&v>=0&&v<=1))errors.push('Invalid normalized point')}
 }
 if(data.fragment_count!==data.fragments.length||data.points_count!==points)errors.push('Incorrect extraction counts');
 if(data.navigation_enabled!==false)errors.push('Raw trace must not enable navigation');
 return {ready:false,errors,fragment_count:data.fragments.length,points_count:points};
}
if(require.main===module){const file=process.argv[2];if(!file){console.error('Usage: node scripts/inspect-bulk-road-trace.cjs FILE.json');process.exit(2)}const result=inspectBulkTrace(JSON.parse(fs.readFileSync(file,'utf8')));console.log(JSON.stringify(result,null,2));if(result.errors.length)process.exitCode=1}
module.exports={inspectBulkTrace};
