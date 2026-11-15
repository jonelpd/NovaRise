'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
test('guest edition build excludes remote auth without changing NovaRise source',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'itchio-'));
 try{
  const original=fs.readFileSync('juego/index.html','utf8');
  cp.execFileSync(process.execPath,['scripts/build-itchio-guest.cjs','juego',tmp]);
  const built=fs.readFileSync(path.join(tmp,'index.html'),'utf8');
  assert.equal(fs.readFileSync('juego/index.html','utf8'),original);
  assert.match(built,/itchio-guest-bootstrap/);
  assert.match(built,/nvrSwitchPlayer\('itchio-guest-v1'\)/);
  assert.doesNotMatch(built,/esm\.sh\/@supabase|spaafpqczvqahhwjxxrz\.supabase\.co|createClient\s*\(/);
  assert.match(built,/id="game-screen"/);
  assert.match(built,/<title>Reinos de Leyenda · Edición itch.io<\/title>/);
  assert.match(built,/<h1>⚔️ Reinos de Leyenda<\/h1>/);
  assert.match(built,/Edición itch.io · En desarrollo/);
  assert.doesNotMatch(built,/Beta pública|<h1>⚔️ NovaRise: Reinos de Leyenda<\/h1>/);
  assert.equal(fs.existsSync(path.join(tmp,'nvra-wallet-readonly.js')),false);
  assert.equal(fs.existsSync(path.join(tmp,'nvra-merit-validation.cjs')),false);
  const shared=JSON.parse(fs.readFileSync(path.join(tmp,'shared-map-hashes.json'),'utf8'));
  assert.equal(shared.status,'draft-not-active');
  assert.equal(shared.active_status,'turquoise-map-active');
  for(const [source,target] of [
   ['juego/mapa-reinos-2048.jpg','mapa-reinos-2048.jpg'],
   ['juego/rutas-turquesa-160.json','rutas-turquesa-160.json']
  ]){
   const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
   assert.equal(hash(source),hash(path.join(tmp,target)));
   assert.equal(shared.active_files[source],hash(source));
  }
  assert.match(built,/function turquoiseRoadRoute\(a,b\)/);
  assert.match(built,/const VERIFIED_MAP_SITES=\[/);
  const {verify}=require('../scripts/verify-shared-map-editions.cjs');
  assert.equal(verify('.',tmp).ok,true,'both editions must share live map and roads');

  for(const [source,target] of [
   ['juego/mapa-rutas-marcadas.png','mapa-rutas-marcadas.png'],
   ['docs/mapa-rutas-marcadas-tramo-central.json','mapa-rutas-marcadas-tramo-central.json']
  ]){
   const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
   assert.equal(hash(source),hash(path.join(tmp,target)));
   assert.equal(shared.files[source],hash(source));
  }
 }finally{fs.rmSync(tmp,{recursive:true,force:true})}
});
