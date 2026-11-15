'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {inspectRoadGeometry}=require('../scripts/inspect-marked-road-geometry.cjs');
test('crossing lines are review warnings, not automatically connected roads',()=>{
 const nodes=[{id:'a',x:0,y:0},{id:'b',x:1,y:1},{id:'c',x:0,y:1},{id:'d',x:1,y:0}];
 const report=inspectRoadGeometry({nodes,edges:[{from:'a',to:'b',verified:false},{from:'c',to:'d',verified:false}]});
 assert.equal(report.unjoinedCrossings.length,1);
 assert.equal(report.releaseReady,false);
 assert.equal(report.allUnverified,true);
});
test('current marked road draft remains non-releasable and contains no duplicate edges',()=>{
 const draft=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
 const report=inspectRoadGeometry(draft);
 assert.equal(report.nodeCount,57);
 assert.equal(report.edgeCount,54);
 assert.deepEqual(report.duplicateEdges,[]);
 assert.equal(report.allUnverified,true);
 assert.equal(report.releaseReady,false);
});
