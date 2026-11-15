'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const inventory=JSON.parse(fs.readFileSync('docs/mapa-original-lugares-inventario.json','utf8'));
const routes=JSON.parse(fs.readFileSync('docs/mapa-original-rutas-trazado-preliminar.json','utf8'));
test('concept map locations are recorded without falsely approved road access',()=>{
 assert.equal(inventory.status,'draft-unverified');
 assert.equal(inventory.map_asset,routes.map_asset);
 assert.equal(inventory.places.length,16);
 assert.equal(new Set(inventory.places.map(p=>p.id)).size,inventory.places.length);
 for(const p of inventory.places){
  assert.ok(['castle','mine','treasure','bridge','other'].includes(p.kind));
  assert.ok(Number.isFinite(p.x)&&p.x>=0&&p.x<=1);
  assert.ok(Number.isFinite(p.y)&&p.y>=0&&p.y<=1);
  assert.equal(p.road_node_id,null);
 }
});
