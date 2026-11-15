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
 assert.deepEqual(report.unjoinedCrossings,[]);
 assert.equal(draft.edges.some(e=>e.from==='central-mill-08'&&e.to==='central-ruins-01'),false);
 assert.equal(draft.edges.some(e=>e.from==='central-south-03'&&e.to==='central-ruins-01'),true);
 assert.equal(report.allUnverified,true);
 assert.equal(report.releaseReady,false);
});

test('published crossing report matches the current road graph and bridge node positions',()=>{
 const draft=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
 const stored=JSON.parse(fs.readFileSync('docs/informe-cruces-mapa-marcado.json','utf8'));
 const actual=inspectRoadGeometry(draft);
 assert.equal(stored.summary.nodes,actual.nodeCount);
 assert.equal(stored.summary.edges,actual.edgeCount);
 assert.equal(stored.summary.strict_unjoined_crossings,actual.unjoinedCrossings.length);
 assert.equal(stored.summary.verified_edges,draft.edges.filter(e=>e.verified===true).length);
 const nodes=new Map(draft.nodes.map(n=>[n.id,n]));
 for(const [id,pixel] of Object.entries(stored.findings[0].pixels))assert.deepEqual(pixel,nodes.get(id).pixel);
 assert.equal(stored.release_ready,false);
});
