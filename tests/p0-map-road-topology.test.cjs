'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {auditRoadTopology}=require('../scripts/audit-map-road-topology.cjs');
const draft=JSON.parse(fs.readFileSync('docs/mapa-original-rutas-trazado-preliminar.json','utf8'));
test('eight provisional routes are separate and never auto-connected',()=>{
 const report=auditRoadTopology(draft,.04);
 assert.equal(report.nodeCount,98);
 assert.equal(report.edgeCount,90);
 assert.equal(report.componentCount,8);
 assert.equal(report.endpoints.length,16);
 assert.ok(report.candidates.every(c=>c.status==='unverified-needs-visual-review'));
});
test('nearby endpoints are suggestions, not edges',()=>{
 const d={nodes:[{id:'a',x:0,y:0},{id:'b',x:.2,y:.2},{id:'c',x:.21,y:.2},{id:'d',x:.5,y:.5}],edges:[['a','b'],['c','d']]};
 const result=auditRoadTopology(d,.03);
 assert.equal(result.componentCount,2);
 assert.deepEqual(result.candidates.map(x=>[x.from,x.to]),[['b','c']]);
 assert.equal(d.edges.length,2);
});
