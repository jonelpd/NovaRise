'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': autosave skips active enemy turn',()=>{
  assert.match(html,/if\(!battle&&!rivalBusy&&STORE\)persistGame\(\)/);
 });
 test(page+': manual save refuses active enemy turn without overwriting data',()=>{
  const start=html.indexOf('function save(){');
  const end=html.indexOf(page==='index.html'?'function validGame(g){':'function load(){',start);
  assert.ok(start>=0&&end>start);
  const source=html.slice(start,end);
  let writes=0,notices=[];
  const ctx={rivalBusy:true,battle:null,STORE:'campaign',s:{gold:99},
   persistGame:()=>{writes++;return true},message:x=>notices.push(x)};
  vm.createContext(ctx);vm.runInContext(source,ctx);
  ctx.save();
  assert.equal(writes,0);
  assert.match(notices[0],/turno rival/);
  ctx.rivalBusy=false;ctx.save();
  assert.equal(writes,1);
 });
 test(page+': export and import refuse unresolved enemy turn',()=>{
  assert.match(html,/function exportSave\(\)\{if\(rivalBusy\)return message/);
  assert.match(html,/\$\('import-file'\)\.onchange=async\(\)=>\{if\(rivalBusy\)/);
  assert.match(html,/if\(rivalBusy\|\|battle\)return message\('Espera a que termine el turno rival antes de importar\.'\);s=v\.game/);
 });
}
test('main page: cloud save and restore reject unresolved turns',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
 assert.match(html,/if\(!el\('modal'\)\.hidden\|\|rivalBusy\)throw Error\('Espera a que termine el combate o turno rival antes de guardar'\)/);
 assert.match(html,/if\(!el\('modal'\)\.hidden\|\|rivalBusy\)throw Error\('Espera a que termine el combate o turno rival antes de recuperar'\)/);
 assert.match(html,/if\(rivalBusy\|\|!el\('modal'\)\.hidden\)throw Error\('El estado de la partida ha cambiado/);
});
