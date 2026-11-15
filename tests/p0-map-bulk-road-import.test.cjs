'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {convertBulkTrace}=require('../scripts/import-bulk-road-trace.cjs');
const {validateRoadRelease}=require('../scripts/validate-map-road-release.cjs');
const sample=()=>({schema_version:1,status:'extracted-unverified',coordinate_system:'normalized',width:1254,height:1254,fragment_count:2,points_count:5,navigation_enabled:false,source_image:'blue.png',fragments:[
{id:'ink-0001',verified:false,points:[[.1,.1],[.2,.2],[.3,.3]]},
{id:'ink-0002',verified:false,points:[[.3,.3],[.4,.4]]}]});
test('bulk importer retains all nodes and only within-fragment edges',()=>{
 const out=convertBulkTrace(sample());
 assert.equal(out.nodes.length,5);assert.equal(out.edges.length,3);
 assert.equal(out.status,'draft-unverified');assert.equal(out.navigation_enabled,false);
 assert.ok(out.edges.every(e=>e.verified===false));
 assert.ok(out.edges.every(e=>e.from.split('-p')[0]===e.to.split('-p')[0]));
 assert.equal(validateRoadRelease(out).ready,false);
});
test('coincident endpoints are not automatically joined',()=>{
 const out=convertBulkTrace(sample());
 assert.equal(out.edges.some(e=>e.from==='ink-0001-p0002'&&e.to==='ink-0002-p0000'),false);
});
test('invalid or approved raw fragments cannot be imported',()=>{
 const data=sample();data.fragments[0].verified=true;
 assert.throws(()=>convertBulkTrace(data),/Invalid extraction/);
});
