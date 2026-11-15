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
 for(const landmark of data.landmarks){
  assert.ok(['castle','mine','mill'].includes(landmark.kind));
  assert.ok(landmark.pixel.every(n=>Number.isInteger(n)&&n>=0&&n<1254));
  assert.equal('legacyId' in landmark,false);
  assert.equal('verified' in landmark,false);
 }
});
