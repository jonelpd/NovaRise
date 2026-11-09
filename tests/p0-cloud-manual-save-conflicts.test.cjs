'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
test('manual cloud save validates current campaign immediately before revision-checked write',()=>{
 const begin=html.indexOf("el('online-save').onclick="),end=html.indexOf("el('online-load').onclick=",begin);
 assert.ok(begin>=0&&end>begin);
 const body=html.slice(begin,end);
 const read=body.indexOf("select('updated_at,revision')");
 const snapshotGuard=body.indexOf("if(JSON.stringify(s)!==JSON.stringify(latestGame))");
 const rpc=body.indexOf("db.rpc('nvr_save_campaign_if_revision'");
 assert.ok(read>=0&&snapshotGuard>read&&rpc>snapshotGuard);
 assert.match(body,/if\(newRevision===null\)throw Error\('Conflicto de versiones:/);
});
test('cloud restore checks local snapshot and remote revision before replacing local data',()=>{
 const begin=html.indexOf("el('online-load').onclick="),end=html.indexOf("db.auth.onAuthStateChange(",begin);
 assert.ok(begin>=0&&end>begin);
 const body=html.slice(begin,end);
 assert.match(body,/JSON\.stringify\(s\)!==restoringLocalSnapshot/);
 assert.match(body,/latestRemote\.revision!==data\.revision/);
 assert.match(body,/SAVE\+'-before-cloud-restore'/);
});
