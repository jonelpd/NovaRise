'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {inventoryLegacySites,auditMigrationSites}=require('../scripts/audit-map-site-migration.cjs');
const html=fs.readFileSync('juego/index.html','utf8');
const roads=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
test('all legacy real map sites are inventoried without mapping to fictional targets',()=>{
 const sites=inventoryLegacySites(html);
 assert.ok(sites.length>=25);
 assert.equal(new Set(sites.map(s=>s.id)).size,sites.length);
 assert.ok(sites.some(s=>s.id==='home'));
 assert.ok(sites.some(s=>s.id==='rival'));
 const report=auditMigrationSites(html,roads);
 assert.equal(report.legacy_site_count,sites.length);
 assert.equal(report.unmapped.length,sites.length);
 assert.equal(report.candidate_mapping_count,0);
 assert.ok(report.unmapped.every(s=>s.targetRoadNode===null&&s.targetMapPixel===null&&s.verifiedOnOriginalImage===false));
 assert.equal(report.ready,false);
});

test('legacy inventory recognizes first object ID directly after opening brace',()=>{
 const sample="const VERIFIED_MAP_SITES=[{id:'home',label:'Castillo del jugador',x:11.8,y:12.1,w:6,h:6,kind:'home',k:'1,1'}];";
 assert.deepEqual(inventoryLegacySites(sample),[{id:'home',label:'Castillo del jugador',kind:'home',oldMapPercent:{x:11.8,y:12.1}}]);
});
