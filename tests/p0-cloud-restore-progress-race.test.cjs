'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
test('cloud restore captures the current local campaign before awaiting network or confirmation',()=>{
 const start=html.indexOf("el('online-load').onclick=");
 const end=html.indexOf("db.auth.onAuthStateChange(",start);
 assert(start>=0&&end>start);
 const source=html.slice(start,end);
 const snapshot=source.indexOf('const restoringLocalSnapshot=JSON.stringify(s)');
 const fetch=source.indexOf("await db.from('nvr_game_saves')");
 const confirm=source.indexOf("await realmConfirm('☁️ Recuperar partida'");
 const guard=source.indexOf('JSON.stringify(s)!==restoringLocalSnapshot');
 const write=source.indexOf('localStorage.setItem(SAVE,JSON.stringify(g))');
 assert(snapshot>=0&&fetch>snapshot&&confirm>fetch&&guard>confirm&&write>guard);
});
test('cloud restore preserves local save before replacement and rollback on write errors',()=>{
 const start=html.indexOf("el('online-load').onclick=");
 const end=html.indexOf("db.auth.onAuthStateChange(",start);
 const source=html.slice(start,end);
 assert.match(source,/SAVE\+'-before-cloud-restore'/);
 assert.match(source,/if\(previousLocal===null\)localStorage\.removeItem\(SAVE\)/);
});
