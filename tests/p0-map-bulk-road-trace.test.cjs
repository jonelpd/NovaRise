'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {inspectBulkTrace}=require('../scripts/inspect-bulk-road-trace.cjs');
const sample=()=>({schema_version:1,status:'extracted-unverified',coordinate_system:'normalized',width:1254,height:1254,fragment_count:1,points_count:2,navigation_enabled:false,fragments:[{id:'ink-0001',verified:false,points:[[0.1,0.2],[0.3,0.4]]}]});
test('valid ink extraction remains non-deployable',()=>assert.deepEqual(inspectBulkTrace(sample()),{ready:false,errors:[],fragment_count:1,points_count:2}));
test('reject out of range coordinates',()=>{const d=sample();d.fragments[0].points[0][0]=1.2;assert.ok(inspectBulkTrace(d).errors.length)});
test('reject falsely verified extraction',()=>{const d=sample();d.fragments[0].verified=true;assert.ok(inspectBulkTrace(d).errors.length)});
test('reject mismatched counts and navigation activation',()=>{const d=sample();d.points_count=3;d.navigation_enabled=true;assert.ok(inspectBulkTrace(d).errors.length)});
