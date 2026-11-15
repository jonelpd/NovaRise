'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {decodeFile}=require('../scripts/decode-bulk-road-polylines.cjs');
const {convertBulkTrace}=require('../scripts/import-bulk-road-trace.cjs');
const {validateRoadRelease}=require('../scripts/validate-map-road-release.cjs');
test('latest blue trace decodes to isolated unverified graph',()=>{
 const data=decodeFile(fs.readFileSync('docs/mapa-caminos-actualizados.polyline','utf8'));
 assert.equal(data.fragment_count,111);
 assert.equal(data.points_count,606);
 const graph=convertBulkTrace(data);
 assert.equal(graph.nodes.length,606);
 assert.equal(graph.edges.length,495);
 assert.ok(graph.edges.every(e=>e.verified===false));
 assert.equal(validateRoadRelease(graph).ready,false);
});
test('malformed compressed line is rejected',()=>assert.throws(()=>decodeFile('!'),/Invalid|Truncated/));
