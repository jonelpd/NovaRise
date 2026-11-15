'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {intersections}=require('../scripts/audit-bulk-road-crossings.cjs');
const sample={nodes:[
{id:'a',x:0,y:0,source_fragment:'one'},{id:'b',x:1,y:1,source_fragment:'one'},
{id:'c',x:0,y:1,source_fragment:'two'},{id:'d',x:1,y:0,source_fragment:'two'}],
edges:[{from:'a',to:'b',verified:false},{from:'c',to:'d',verified:false}]};
test('crossing is review-only, not an approved junction',()=>{
 const result=intersections(sample);
 assert.equal(result.candidate_count,1);assert.equal(result.approved_count,0);
 assert.equal(result.candidates[0].kind,'interior-crossing');
 assert.equal(result.candidates[0].x,0.5);assert.equal(result.candidates[0].y,0.5);
 assert.equal(result.candidates[0].approved,false);
});
test('parallel segments do not produce false crossing',()=>{
 const graph={nodes:[{id:'a',x:0,y:0,source_fragment:'one'},{id:'b',x:1,y:0,source_fragment:'one'},{id:'c',x:0,y:1,source_fragment:'two'},{id:'d',x:1,y:1,source_fragment:'two'}],edges:sample.edges};
 assert.equal(intersections(graph).candidate_count,0);
});
test('bad input rejected',()=>assert.throws(()=>intersections({}),/Invalid road graph/));
