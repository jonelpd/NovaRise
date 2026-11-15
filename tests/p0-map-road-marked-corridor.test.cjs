'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {createRoadGraph}=require('../scripts/map-road-graph.cjs');
const {validateRoadRelease}=require('../scripts/validate-map-road-release.cjs');
const data=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
test('central marked road corridor is a connected provisional trace',()=>{
 assert.equal(data.status,'draft-unverified');
 assert.equal(data.map_asset,'mapa-rutas-marcadas.png');
 assert.equal(data.nodes.length,26);
 assert.equal(data.edges.length,25);
 assert.ok(data.nodes.every(n=>n.x>=0&&n.x<=1&&n.y>=0&&n.y<=1));
 const route=createRoadGraph(data.nodes,data.edges).route(data.nodes[0].id,'central-mill-13');
 assert.equal(route.nodes.length,13);
 const branch=createRoadGraph(data.nodes,data.edges).route('central-mill-01','central-ruins-06');
 assert.equal(branch.nodes.at(-1).id,'central-ruins-06');
 assert.equal(branch.nodes.length,14);
 const volcanic=createRoadGraph(data.nodes,data.edges).route('central-mill-01','central-south-07');
 assert.equal(volcanic.nodes.length,16);
});
test('provisional user-marked trace is rejected by the release gate',()=>{
 assert.equal(validateRoadRelease(data).ready,false);
 assert.equal(createRoadGraph(data.nodes,data.edges,{verifiedOnly:true}).route(data.nodes[0].id,data.nodes.at(-1).id),null);
});
