'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {createRoadGraph}=require('../scripts/map-road-graph.cjs');
const data=JSON.parse(fs.readFileSync('docs/mapa-original-rutas-borrador.json','utf8'));
test('draft roads cannot be used in verified-only navigation',()=>{
 assert.equal(data.status,'draft-unverified');
 assert.equal(data.coordinate_system,'normalized');
 assert.ok(data.nodes.length>=10);
 assert.ok(data.edges.length>=10);
 assert.ok(data.edges.every(edge=>edge.verified===false));
 const graph=createRoadGraph(data.nodes,data.edges,{verifiedOnly:true});
 assert.equal(graph.route('central-castle-gate','windmill-gate'),null);
});
test('verified-only routing accepts only explicitly approved segments',()=>{
 const nodes=[{id:'a',x:0,y:0},{id:'b',x:.5,y:0},{id:'c',x:1,y:0}];
 const graph=createRoadGraph(nodes,[{from:'a',to:'b',verified:true},{from:'b',to:'c',verified:false}],{verifiedOnly:true});
 assert.deepEqual(graph.route('a','b').nodes.map(n=>n.id),['a','b']);
 assert.equal(graph.route('a','c'),null);
});
