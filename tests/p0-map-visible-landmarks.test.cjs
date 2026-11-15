'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('docs/mapa-hitos-visibles-original.json','utf8'));
test('original artwork landmarks remain provisional and do not silently migrate saved sites',()=>{
 assert.equal(data.status,'visual-candidates-unverified');
 assert.equal(data.all_verified,false);
 assert.equal(data.legacy_mapping.status,'not-assigned');
 assert.deepEqual(data.image_dimensions,[1254,1254]);
 assert.ok(data.landmarks.length>=10);
 assert.equal(new Set(data.landmarks.map(x=>x.id)).size,data.landmarks.length);
 assert.ok(data.landmarks.some(x=>x.kind==='castle'));
 assert.ok(data.landmarks.some(x=>x.kind==='mine'));
 assert.ok(data.landmarks.some(x=>x.kind==='mill'));
 assert.equal(data.crossings.length,1);
 assert.equal(data.crossings[0].id,'bridge-central-castle-east');
 assert.equal(data.crossings[0].structureVisuallyConfirmed,true);
 assert.equal(data.crossings[0].verified,false);
 assert.deepEqual(data.crossings[0].connectedRoadNodes,[]);
 assert.equal(data.crossings[0].geometryStatus,'bridge-corridor-retraced-provisional');
 assert.equal(data.crossings[0].blackRoadTraceApproxPixel.length,7);
 const road=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
 const nodes=road.nodes.filter(n=>/^central-mill-0[1-7]$/.test(n.id)).sort((a,b)=>a.id.localeCompare(b.id));
 assert.deepEqual(nodes.map(n=>n.pixel),data.crossings[0].blackRoadTraceApproxPixel);
 assert.ok(nodes.every(n=>Math.abs(n.x-n.pixel[0]/1254)<0.000001&&Math.abs(n.y-n.pixel[1]/1254)<0.000001));
 assert.ok(road.edges.filter(e=>nodes.some(n=>n.id===e.from||n.id===e.to)).every(e=>e.verified===false));
 assert.deepEqual(data.crossings[0].existingDraftNodeWarning,[]);
 assert.ok(Object.values(data.crossings[0].entrances).every(p=>p.length===2&&p.every(v=>Number.isInteger(v)&&v>=0&&v<1254)));
 for(const landmark of data.landmarks){
  assert.ok(['castle','mine','mill'].includes(landmark.kind));
  assert.ok(landmark.pixel.every(n=>Number.isInteger(n)&&n>=0&&n<1254));
  assert.equal('legacyId' in landmark,false);
  assert.equal('verified' in landmark,false);
 }
});
