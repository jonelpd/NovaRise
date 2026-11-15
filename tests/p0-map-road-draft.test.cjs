'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {createRoadGraph}=require('../scripts/map-road-graph.cjs');
const data=JSON.parse(fs.readFileSync('docs/mapa-original-rutas-borrador.json','utf8'));
test('draft road network is explicitly unverified and uses normalized nodes',()=>{
 assert.equal(data.status,'draft-unverified');
 assert.equal(data.coordinate_system,'normalized');
 assert.ok(data.nodes.length>=10);
 const graph=createRoadGraph(data.nodes,data.edges);
 assert.deepEqual(graph.route('central-castle-gate','windmill-gate').nodes.map(n=>n.id),['central-castle-gate','central-bridge','east-forest-junction','windmill-west','windmill-gate']);
 assert.ok(graph.route('central-castle-gate','east-mine-approach'));
});
