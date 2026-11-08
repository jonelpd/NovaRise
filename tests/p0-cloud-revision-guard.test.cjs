'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const start=html.indexOf("el('online-save').onclick="),end=html.indexOf("el('online-load').onclick=",start);
const source=html.slice(start,end);
test('cloud upload rechecks remote revision after user confirmation',()=>{
 const confirm=source.indexOf("await realmConfirm('☁️ Guardar en la nube'");
 const recheck=source.indexOf("const {data:remoteNow,error:remoteCheckError}");
 const compare=source.indexOf("(remoteNow?.updated_at||null)!==previous");
 const upload=source.indexOf("upsert({user_id:currentUser.id,save_data:latestGame");
 assert(confirm>=0&&recheck>confirm&&compare>recheck&&upload>compare);
});
test('cloud upload rechecks session and turn state after revision fetch',()=>{
 const recheck=source.indexOf("const {data:remoteNow,error:remoteCheckError}");
 const guard=source.indexOf("currentUser.id!==savingUserId||rivalBusy||!el('modal').hidden",recheck);
 const upload=source.indexOf("upsert({user_id:currentUser.id,save_data:latestGame");
 assert(guard>recheck&&upload>guard);
});
