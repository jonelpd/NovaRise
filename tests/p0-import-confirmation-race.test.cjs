'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': importing cannot overwrite progress changed during confirmation',()=>{
  const begin=html.indexOf("$('import-file').onchange=async()=>"),end=html.indexOf(";$('profile-save').onclick",begin);
  assert.ok(begin>=0&&end>begin,'import handler missing');
  const src=html.slice(begin,end);
  const before=src.indexOf('const importState=s,importSnapshot=JSON.stringify(s),importStore=STORE');
  const confirm=src.indexOf('await realmConfirm(');
  const guard=src.indexOf('s!==importState||JSON.stringify(s)!==importSnapshot||STORE!==importStore');
  const assign=src.indexOf('s=v.game;');
  assert.ok(before>=0&&before<confirm,'capture snapshot before confirmation');
  assert.ok(confirm<guard&&guard<assign,'verify snapshot before replacing campaign');
 });
}
