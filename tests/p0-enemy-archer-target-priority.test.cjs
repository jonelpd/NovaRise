'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': enemy archers prioritize a valid shot over an adjacent target',()=>{
  const begin=html.indexOf('function duelEnemyTurn(done)'),end=html.indexOf('function battleCount(type)',begin);
  assert.ok(begin>=0&&end>begin);
  const src=html.slice(begin,end);
  assert.match(src,/const validShot=t=>distanceTo\(t\)>=2&&distanceTo\(t\)<=3&&clearShot/);
  assert.match(src,/const available=u\.id==='archers'\?candidates\.filter\(validShot\):\[\]/);
  assert.match(src,/const nearest=\(available\.length\?available:candidates\)\.sort/);
  assert.match(src,/u\.id!=='archers'\|\|distance>=2/);
 });
}
