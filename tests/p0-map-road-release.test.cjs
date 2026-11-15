'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {validateRoadRelease}=require('../scripts/validate-map-road-release.cjs');
const draft=JSON.parse(fs.readFileSync('docs/mapa-original-rutas-borrador.json','utf8'));
const hash='a'.repeat(64);
const nodes=[{id:'castle',x:.1,y:.1},{id:'bridge',x:.3,y:.3},{id:'mine',x:.5,y:.5}];
const approved={schema_version:2,coordinate_system:'normalized',status:'approved',map_asset:'mapa-original.png',map_sha256:hash,nodes,edges:[{from:'castle',to:'bridge',verified:true},{from:'bridge',to:'mine',verified:true}]};
test('unverified draft is blocked for release',()=>{const result=validateRoadRelease(draft,['central-castle-gate']);assert.equal(result.ready,false);assert.ok(result.errors.length)});
test('approved connected map passes release gate',()=>assert.deepEqual(validateRoadRelease(approved,['mine']),{ready:true,errors:[]}));
test('blocked segment, duplicate, missing access and disconnected access fail',()=>{
 assert.equal(validateRoadRelease({...approved,edges:[{from:'castle',to:'bridge',verified:false}]},['mine']).ready,false);
 assert.equal(validateRoadRelease({...approved,edges:[...approved.edges,{from:'mine',to:'bridge',verified:true}]}).ready,false);
 assert.equal(validateRoadRelease(approved,['missing']).ready,false);
 assert.equal(validateRoadRelease({...approved,edges:[approved.edges[0]]},['mine']).ready,false);
});
