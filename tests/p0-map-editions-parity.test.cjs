'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {validateRoadRelease}=require('../scripts/validate-map-road-release.cjs');
const contract=JSON.parse(fs.readFileSync('docs/mapa-compartido-ediciones.json','utf8'));
const draft=JSON.parse(fs.readFileSync(contract.source_of_truth.road_draft,'utf8'));
const latest=JSON.parse(fs.readFileSync(contract.source_of_truth.bulk_trace_graph,'utf8'));
test('both editions reference one canonical map and road dataset',()=>{
 assert.deepEqual(contract.editions,['novarise','itch.io']);
 assert.equal(contract.policy,'shared-map-source');
 assert.equal(contract.source_of_truth.marked_map,draft.map_asset==='mapa-rutas-marcadas.png'?'juego/'+draft.map_asset:null);
 assert.equal(contract.source_of_truth.release_gate,'scripts/validate-map-road-release.cjs');
 assert.equal(contract.release_requirements.require_both_editions_same_map_and_road_hashes,true);
});
test('draft roads cannot be presented as deployed to either edition',()=>{
 assert.equal(draft.status,'draft-unverified');
 assert.equal(latest.status,'draft-unverified');
 assert.equal(latest.navigation_enabled,false);
 assert.equal(validateRoadRelease(latest).ready,false);
 assert.ok(draft.edges.every(e=>e.verified===false));
 assert.ok(latest.edges.every(e=>e.verified===false));
 assert.match(contract.current_state,/not deployed/i);
 assert.match(contract.bulk_trace_import.status,/unverified/);
});
