#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {validateRoadRelease}=require('./validate-map-road-release.cjs');
function validateMapBundle(roadFile,imageFile,accessFile){
 const roads=JSON.parse(fs.readFileSync(roadFile,'utf8'));
 const accesses=JSON.parse(fs.readFileSync(accessFile,'utf8'));
 const errors=[];
 if(!Array.isArray(accesses)||!accesses.length)errors.push('Access manifest must contain at least one destination');
 const ids=new Set();
 if(Array.isArray(accesses))for(const a of accesses){
  if(!a||typeof a.id!=='string'||!a.id.trim()||ids.has(a.id)||!['castle','mine','treasure','bridge','town','ruin','other'].includes(a.kind)||typeof a.node_id!=='string'||!a.node_id.trim())errors.push('Invalid or duplicate destination');
  else ids.add(a.id);
 }
 if(!fs.existsSync(imageFile))errors.push('Final map image missing');
 else {
  const hash=crypto.createHash('sha256').update(fs.readFileSync(imageFile)).digest('hex');
  if(roads.map_sha256!==hash)errors.push('Map image hash does not match road data');
  if(roads.map_asset!==path.basename(imageFile))errors.push('Map filename does not match road data');
 }
 const required=Array.isArray(accesses)?accesses.filter(a=>a&&typeof a.node_id==='string').map(a=>a.node_id):[];
 const checked=validateRoadRelease(roads,required);
 return {ready:!errors.length&&checked.ready,errors:[...errors,...checked.errors]};
}
if(require.main===module){
 const [roadFile,imageFile,accessFile]=process.argv.slice(2);
 if(!roadFile||!imageFile||!accessFile){console.error('Usage: node scripts/check-original-map-bundle.cjs <roads.json> <map.png> <accesses.json>');process.exit(2)}
 try{const result=validateMapBundle(roadFile,imageFile,accessFile);console.log(JSON.stringify(result,null,2));if(!result.ready)process.exitCode=1}
 catch(err){console.error(err.message);process.exitCode=1}
}
module.exports={validateMapBundle};
