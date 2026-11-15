#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const src=path.resolve(process.argv[2]||'juego'),out=path.resolve(process.argv[3]||'dist/itchio');
if(src===out)throw Error('Source and output must differ');
const html=fs.readFileSync(path.join(src,'index.html'),'utf8');
const auth=/<script type="module">\s*import \{ createClient \} from 'https:\/\/esm\.sh\/@supabase\/supabase-js@2\.57\.0';[\s\S]*?<\/script>/g;
if((html.match(auth)||[]).length!==1)throw Error('Expected exactly one known Supabase auth module; review source before rebuilding');
if(!html.includes('window.nvrSwitchPlayer=function(userId)'))throw Error('Guest storage hook missing');
if(!html.includes('id="auth-screen"')||!html.includes('id="game-screen"'))throw Error('Expected auth/game screens missing');
const guest=`<style id="itchio-guest-style">
#auth-screen,.nvra-game-status,#nvra-center-open,#nvra-center,#game-exit{display:none!important}
</style>
<script id="itchio-guest-bootstrap">
(function(){
  function start(){
    var auth=document.getElementById('auth-screen'),game=document.getElementById('game-screen');
    if(!game||typeof window.nvrSwitchPlayer!=='function'){console.error('itch.io: guest bootstrap unavailable');return}
    if(auth)auth.hidden=true;
    game.hidden=false;
    var name=document.getElementById('player-nickname');
    if(name)name.textContent='Invitado itch.io';
    window.nvrSwitchPlayer('itchio-guest-v1');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>`;
let built=html.replace(auth,guest);
const titleChanges=[
  ['<title>NovaRise · Reinos de Leyenda</title>','<title>Reinos de Leyenda · Edición itch.io</title>'],
  ['<h1>⚔️ NovaRise: Reinos de Leyenda</h1>','<h1>⚔️ Reinos de Leyenda</h1>'],
  ['<small>Versión 1.3 · Beta pública · mapa ilustrado v1.7</small>','<small>Edición itch.io · En desarrollo · mapa ilustrado v1.7</small>']
];
for(const [before,after] of titleChanges){
  if(!built.includes(before))throw Error('Expected edition heading missing: '+before);
  built=built.replace(before,after);
}

if(/esm\.sh\/@supabase|spaafpqczvqahhwjxxrz\.supabase\.co|createClient\s*\(/.test(built))throw Error('Supabase auth still referenced');
fs.mkdirSync(out,{recursive:true});
fs.cpSync(src,out,{recursive:true,force:true});
for(const filename of ['nvra-wallet-readonly.js','nvra-merit-validation.cjs']){
  fs.rmSync(path.join(out,filename),{force:true});
}
for(const filename of ['nvra-wallet-readonly.js','nvra-merit-validation.cjs']){
  if(fs.existsSync(path.join(out,filename)))throw Error('NVRA-only file leaked: '+filename);
}
fs.writeFileSync(path.join(out,'index.html'),built);
// Shared original-map source files are staged identically for both editions.
// This does NOT activate the draft map or its unverified roads in gameplay.
const sharedRoot=path.resolve(src,'..');
const sharedFiles=[
 ['juego/mapa-rutas-marcadas.png','mapa-rutas-marcadas.png'],
 ['docs/mapa-rutas-marcadas-tramo-central.json','mapa-rutas-marcadas-tramo-central.json']
];
const sharedHashes={};
for(const [relative,destination] of sharedFiles){
 const source=path.join(sharedRoot,relative),target=path.join(out,destination);
 if(!fs.existsSync(source))throw Error('Shared map source missing: '+relative);
 fs.copyFileSync(source,target);
 const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 if(hash(source)!==hash(target))throw Error('Shared map copy mismatch: '+relative);
 sharedHashes[relative]=hash(target);
}
fs.writeFileSync(path.join(out,'shared-map-hashes.json'),JSON.stringify({schema_version:1,status:'draft-not-active',files:sharedHashes},null,2)+'\n');
console.log('itch.io guest edition generated; source untouched');
