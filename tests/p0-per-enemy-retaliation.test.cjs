'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': each enemy stack has its own one-time melee retaliation',()=>{
  assert.match(html,/battle\.phase=0;battle\.counterUsed=false;battle\.counterUsedByEnemy=\[\]/);
  assert.match(html,/battle\.acted=\[\];battle\.guarding=\[\];battle\.counterUsed=false;battle\.counterUsedByEnemy=\[\]/);
  const hit=html.slice(html.indexOf('function hit(defend)'),html.indexOf('function hireMiner()'));
  assert.match(hit,/!battle\.counterUsedByEnemy\?\.includes\(struckEnemy\.id\)/);
  assert.match(hit,/battle\.counterUsedByEnemy\.push\(struckEnemy\.id\)/);
  assert.match(hit,/\(!struckEnemy\|\|struckEnemy\.count>0\)/);
 });
}
