'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {auditJunctionCandidates}=require('../scripts/audit-bulk-road-junctions.cjs');
const graph=JSON.parse(fs.readFileSync('docs/mapa-caminos-actualizados-grafo.json','utf8'));
test('review candidates are deterministic and never approved',()=>{
 const first=auditJunctionCandidates(graph),second=auditJunctionCandidates(graph);
 assert.deepEqual(first,second);
 assert.equal(first.status,'review-only');assert.equal(first.approved_count,0);
 assert.equal(first.candidate_count,126);
 assert.ok(first.candidates.every(c=>c.approved===false&&c.status==='needs-visual-review'&&c.distance_px<=4.002));
});
test('invalid threshold is rejected',()=>assert.throws(()=>auditJunctionCandidates(graph,{thresholdPx:-1}),/Invalid audit/));
