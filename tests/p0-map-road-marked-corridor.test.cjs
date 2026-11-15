'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {createRoadGraph}=require('../scripts/map-road-graph.cjs');
const {validateRoadRelease}=require('../scripts/validate-map-road-release.cjs');
const data=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
test('central marked road corridor is a connected provisional trace',()=>{
 assert.equal(data.status,'draft-unverified');
 assert.equal(data.map_asset,'mapa-rutas-marcadas.png');
 assert.equal(data.nodes.length,57);
 assert.equal(data.edges.length,54);
 assert.ok(data.nodes.every(n=>n.x>=0&&n.x<=1&&n.y>=0&&n.y<=1));
 const route=createRoadGraph(data.nodes,data.edges).route(data.nodes[0].id,'central-mill-13');
 assert.equal(route.nodes.length,13);
 const branch=createRoadGraph(data.nodes,data.edges).route('central-mill-01','central-ruins-06');
 assert.equal(branch.nodes.at(-1).id,'central-ruins-06');
 assert.equal(branch.nodes.length,18);
 const volcanic=createRoadGraph(data.nodes,data.edges).route('central-mill-01','central-south-07');
 assert.equal(volcanic.nodes.length,16);
});
test('provisional user-marked trace is rejected by the release gate',()=>{
 assert.equal(validateRoadRelease(data).ready,false);
 assert.equal(createRoadGraph(data.nodes,data.edges,{verifiedOnly:true}).route(data.nodes[0].id,data.nodes.at(-1).id),null);
});

test('pixel coordinates agree with normalized positions and provisional segments stay local',()=>{
 const byId=new Map(data.nodes.map(n=>[n.id,n]));
 for(const n of data.nodes){
  assert.equal(n.pixel.length,2);
  assert.ok(Math.abs(n.x-n.pixel[0]/1254)<.000001);
  assert.ok(Math.abs(n.y-n.pixel[1]/1254)<.000001);
 }
 for(const e of data.edges){
  const a=byId.get(e.from),b=byId.get(e.to);
  assert.ok(Math.hypot(a.pixel[0]-b.pixel[0],a.pixel[1]-b.pixel[1])<55);
  assert.equal(e.verified,false);
 }
});

test('western mine route is separate until real crossroads are inspected',()=>{
 const graph=createRoadGraph(data.nodes,data.edges);
 const west=graph.route('west-castle-mine-01','west-castle-mine-17');
 assert.equal(west.nodes.length,17);
 assert.equal(graph.route('west-castle-mine-01','central-mill-01'),null);
});

test('northern watchtower-to-cave route stays isolated until a real junction is validated',()=>{
 const graph=createRoadGraph(data.nodes,data.edges);
 const north=graph.route('north-watchtower-cave-01','north-watchtower-cave-14');
 assert.equal(north.nodes.length,14);
 assert.equal(graph.route('north-watchtower-cave-01','central-mill-01'),null);
 assert.equal(graph.route('north-watchtower-cave-01','west-castle-mine-01'),null);
});
