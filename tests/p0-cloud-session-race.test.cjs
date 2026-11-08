'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
for(const [action,next,identity,expected] of [
 ["el('online-save').onclick=","el('online-load').onclick=",'savingUserId','guardado'],
 ["el('online-load').onclick=","db.auth.onAuthStateChange(",'restoringUserId','recuperación']
]){
 test('cloud '+expected+' blocks account switch after async confirmation',()=>{
  const begin=html.indexOf(action),end=html.indexOf(next,begin+action.length);
  assert(begin>=0&&end>begin);
  const fn=html.slice(begin,end);
  const captured=fn.indexOf('const '+identity+'=currentUser.id');
  const checked=fn.indexOf('currentUser.id!=='+identity);
  const confirm=fn.indexOf('await realmConfirm(');
  assert(captured>=0&&confirm>captured&&checked>confirm);
  assert(fn.indexOf("db.from('nvr_game_saves')")>=0);
 });
}
