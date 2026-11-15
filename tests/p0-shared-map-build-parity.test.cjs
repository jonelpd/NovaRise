'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {verify}=require('../scripts/verify-shared-map-editions.cjs');
const crypto=require('node:crypto');
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
test('shared map verifier accepts equal bytes and rejects drift and missing files',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'shared-map-'));
 const out=path.join(root,'out');
 try{
  fs.mkdirSync(path.join(root,'juego'),{recursive:true});
  fs.mkdirSync(path.join(root,'docs'),{recursive:true});
  fs.mkdirSync(out,{recursive:true});
  const entries=[['juego/mapa-rutas-marcadas.png','mapa-rutas-marcadas.png',Buffer.from('image')],['docs/mapa-rutas-marcadas-tramo-central.json','mapa-rutas-marcadas-tramo-central.json',Buffer.from('{"status":"draft-unverified"}')]];
  const hashes={};
  for(const [src,dst,bytes] of entries){fs.writeFileSync(path.join(root,src),bytes);fs.writeFileSync(path.join(out,dst),bytes);hashes[src]=sha(bytes)}
  fs.writeFileSync(path.join(out,'shared-map-hashes.json'),JSON.stringify({status:'draft-not-active',files:hashes}));
  assert.equal(verify(root,out).ok,true);
  fs.writeFileSync(path.join(out,entries[0][1]),'different');
  assert.equal(verify(root,out).ok,false);
  fs.rmSync(path.join(out,entries[1][1]));
  assert.equal(verify(root,out).ok,false);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
