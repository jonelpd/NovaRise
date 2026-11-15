'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {validateMapBundle}=require('../scripts/check-original-map-bundle.cjs');
test('map bundle checks real image hash, access nodes and connected roads',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'road-bundle-'));
 try{
  const image=path.join(dir,'map.png'),roads=path.join(dir,'roads.json'),access=path.join(dir,'access.json');
  fs.writeFileSync(image,Buffer.from('synthetic test image'));
  const hash=crypto.createHash('sha256').update(fs.readFileSync(image)).digest('hex');
  const data={schema_version:2,coordinate_system:'normalized',status:'approved',map_asset:'map.png',map_sha256:hash,nodes:[{id:'start',x:0,y:0},{id:'mine',x:.5,y:.5}],edges:[{from:'start',to:'mine',verified:true}]};
  fs.writeFileSync(roads,JSON.stringify(data));
  fs.writeFileSync(access,JSON.stringify([{id:'mine-a',kind:'mine',node_id:'mine'}]));
  assert.equal(validateMapBundle(roads,image,access).ready,true);
  fs.writeFileSync(image,Buffer.from('changed image'));
  assert.match(validateMapBundle(roads,image,access).errors.join(' '),/hash/);
  fs.writeFileSync(image,Buffer.from('synthetic test image'));
  fs.writeFileSync(access,JSON.stringify([{id:'mine-a',kind:'mine',node_id:'missing'}]));
  assert.match(validateMapBundle(roads,image,access).errors.join(' '),/missing/);
  fs.writeFileSync(access,JSON.stringify([]));
  assert.equal(validateMapBundle(roads,image,access).ready,false);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
