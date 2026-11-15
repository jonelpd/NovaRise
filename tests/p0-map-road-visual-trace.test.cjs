'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {createRoadGraph}=require('../scripts/map-road-graph.cjs');
const data=JSON.parse(fs.readFileSync('docs/mapa-original-rutas-trazado-preliminar.json','utf8'));
test('traced concept roads remain unapproved and disconnected',()=>{
 assert.equal(data.status,'draft-unverified');
 assert.equal(data.nodes.length,40);
 assert.equal(data.edges.length,36);
 assert.ok(data.edges.every(e=>e.verified===false));
 const graph=createRoadGraph(data.nodes,data.edges,{verifiedOnly:true});
 assert.equal(graph.route(data.nodes[0].id,data.nodes[1].id),null);
});
