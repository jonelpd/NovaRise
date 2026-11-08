'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 test(page+': NVRA modal does not interfere with adventure controls',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
  assert.match(html,/async function move\(x,y\)\{if\(rivalBusy\|\|s\.done\|\|battle\|\|!document\.getElementById\('nvra-center'\)\?\.hidden/);
  assert.match(html,/if\(!nvraCenter\.hidden\|\|battle\|\|document\.querySelector\('\.realm-dialog'\)/);
  assert.match(html,/id="nvra-center"[^>]*hidden role="dialog"/);
  assert.match(html,/id="nvra-center-close"/);
  assert.match(html,/id="nvra-merit-mines"/);
  assert.match(html,/id="nvra-merit-treasures"/);
  assert.match(html,/id="nvra-merit-castles"/);
  assert.match(html,/const mineDisplay=document\.getElementById\('nvra-center-mines'\)/);
  assert.doesNotMatch(html,/const mines=document\.getElementById\('nvra-center-mines'\)/);
  assert.doesNotMatch(html,/<details id="siege-report"/);
  assert.doesNotMatch(html,/<details id="realm-intelligence"/);
 });
}
