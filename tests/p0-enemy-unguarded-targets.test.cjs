'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': enemy prioritizes unguarded targets only within immediate attack range',()=>{
  const start=html.indexOf('function duelEnemyTurn(done)'),end=html.indexOf('function battleCount(type)',start);
  assert.ok(start>=0&&end>start);
  const code=html.slice(start,end);
  assert.match(code,/const inReach=u\.id==='archers'\?available:candidates\.filter\(t=>distanceTo\(t\)===1\)/);
  assert.match(code,/const choices=inReach\.length\?inReach:candidates/);
  assert.match(code,/Number\(!!current\.guarding\?\.includes\(a\.type\)\)-Number\(!!current\.guarding\?\.includes\(b\.type\)\)/);
  assert.match(code,/const validShot=t=>distanceTo\(t\)>=2&&distanceTo\(t\)<=3&&clearShot/);
 });
}
