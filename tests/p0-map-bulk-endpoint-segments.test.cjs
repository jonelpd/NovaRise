'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {auditEndpointSegments}=require('../scripts/audit-bulk-road-endpoint-segments.cjs');
test('find T junction at middle of another fragment without approval',()=>{
 const graph={nodes:[
 {id:'a',x:0,y:0,source_fragment:'a'},{id:'b',x:1,y:0,source_fragment:'a'},
 {id:'c',x:.5,y:.001,source_fragment:'b'},{id:'d',x:.5,y:.1,source_fragment:'b'}],
 edges:[{from:'a',to:'b'},{from:'c',to:'d'}]};
 const result=auditEndpointSegments(graph);
 assert.equal(result.candidate_count,1);
 assert.equal(result.candidates[0].endpoint,'c');
 assert.equal(result.candidates[0].approved,false);
 assert.equal(result.approved_count,0);
});
test('parallel distant roads are not joined',()=>{
 const graph={nodes:[
 {id:'a',x:0,y:0,source_fragment:'a'},{id:'b',x:1,y:0,source_fragment:'a'},
 {id:'c',x:0,y:.5,source_fragment:'b'},{id:'d',x:1,y:.5,source_fragment:'b'}],
 edges:[{from:'a',to:'b'},{from:'c',to:'d'}]};
 assert.equal(auditEndpointSegments(graph).candidate_count,0);
});
