'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {createRoadGraph}=require('../scripts/map-road-graph.cjs');
const {validateRoadRelease}=require('../scripts/validate-map-road-release.cjs');
const data=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
test('central marked road corridor is a connected provisional trace',()=>{
 assert.equal(data.status,'draft-unverified');
 assert.equal(data.map_asset,'mapa-rutas-marcadas.png');
 assert.equal(data.nodes.length,13);
 assert.equal(data.edges.length,12);
 assert.ok(data.nodes.every(n=>n.x>=0&&n.x<=1&&n.y>=0&&n.y<=1));
 const route=createRoadGraph(data.nodes,data.edges).route(data.nodes[0].id,data.nodes.at(-1).id);
 assert.equal(route.nodes.length,13);
});
test('provisional user-marked trace is rejected by the release gate',()=>{
 assert.equal(validateRoadRelease(data).ready,false);
 assert.equal(createRoadGraph(data.nodes,data.edges,{verifiedOnly:true}).route(data.nodes[0].id,data.nodes.at(-1).id),null);
});
