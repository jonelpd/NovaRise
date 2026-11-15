'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createRoadGraph}=require('../scripts/map-road-graph.cjs');
test('route follows defined path around forbidden direct crossing',()=>{
 const graph=createRoadGraph([{id:'start',x:0,y:0},{id:'bridge',x:0,y:0.5},{id:'end',x:1,y:0.5},{id:'isolated',x:1,y:1}],[['start','bridge'],['bridge','end']]);
 assert.deepEqual(graph.route('start','end').nodes.map(n=>n.id),['start','bridge','end']);
 assert.equal(graph.route('start','isolated'),null);
});
test('reject edges with unknown nodes',()=>{
 assert.throws(()=>createRoadGraph([{id:'a',x:0,y:0}],[['a','missing']]));
});
