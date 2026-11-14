#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
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
const built=html.replace(auth,guest);
if(/esm\.sh\/@supabase|spaafpqczvqahhwjxxrz\.supabase\.co|createClient\s*\(/.test(built))throw Error('Supabase auth still referenced');
fs.mkdirSync(out,{recursive:true});
fs.cpSync(src,out,{recursive:true,force:true});
fs.writeFileSync(path.join(out,'index.html'),built);
console.log('itch.io guest edition generated; source untouched');
