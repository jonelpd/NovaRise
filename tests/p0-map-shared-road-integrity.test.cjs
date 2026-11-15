'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const {decodeFile}=require('../scripts/decode-bulk-road-polylines.cjs');
const {convertBulkTrace}=require('../scripts/import-bulk-road-trace.cjs');
const {validateRoadRelease}=require('../scripts/validate-map-road-release.cjs');
const raw=fs.readFileSync('docs/mapa-caminos-actualizados.polyline','utf8');
const saved=JSON.parse(fs.readFileSync('docs/mapa-caminos-actualizados-grafo.json','utf8'));
const config=JSON.parse(fs.readFileSync('docs/mapa-compartido-ediciones.json','utf8'));
test('committed graph matches the full latest traced geometry',()=>{
 const generated=convertBulkTrace(decodeFile(raw));
 assert.equal(saved.nodes.length,606);
 assert.equal(saved.edges.length,495);
 assert.deepEqual(saved.nodes,generated.nodes);
 assert.deepEqual(saved.edges,generated.edges);
 assert.equal(saved.status,'draft-unverified');
 assert.equal(saved.navigation_enabled,false);
});
test('both editions reference one shared, non-approved road graph',()=>{
 assert.deepEqual(config.editions,['novarise','itch.io']);
 assert.equal(config.source_of_truth.bulk_trace_graph,'docs/mapa-caminos-actualizados-grafo.json');
 assert.equal(validateRoadRelease(saved).ready,false);
 assert.ok(saved.edges.every(e=>e.verified===false));
});
test('original map asset exists and hash can be audited',()=>{
 const path='juego/mapa-grande.png';
 assert.ok(fs.existsSync(path),'original map missing');
 const bytes=fs.readFileSync(path);
 assert.ok(bytes.length>1000);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 const sha=crypto.createHash('sha256').update(bytes).digest('hex');
 assert.match(sha,/^[a-f0-9]{64}$/);
 console.log('Map asset SHA-256:',sha);
});
