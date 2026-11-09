'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': ranged enemy archers cannot fire adjacent or through aligned obstacles',()=>{
  const start=html.indexOf('function duelEnemyTurn(done)');
  const end=html.indexOf('function battleCount(type)',start);
  assert.ok(start>=0&&end>start);
  const code=html.slice(start,end);
  assert.match(code,/distance<=\(u\.id==='archers'\?3:1\)/);
  assert.match(code,/\(u\.id!=='archers'\|\|distance>=2\)/);
  assert.match(code,/\(u\.id!=='archers'\|\|clearShot\(u\.x,u\.y,nearest\.x,nearest\.y\)\)/);
  assert.match(code,/targetDistance>=2&&targetDistance<=3&&clearShot/);
 });
}
