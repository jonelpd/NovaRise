'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
test('cloud upload rechecks rival turn after asynchronous confirmation',()=>{
 const start=html.indexOf("el('online-save').onclick=");
 const end=html.indexOf("el('online-load').onclick=",start);
 assert(start>=0&&end>start);
 const fn=html.slice(start,end);
 const confirmation=fn.indexOf("await realmConfirm(");
 const guard=fn.indexOf("if(rivalBusy||!el('modal').hidden)",confirmation);
 const upload=fn.indexOf("db.rpc('nvr_save_campaign_if_revision'",guard);
 assert(confirmation>=0&&guard>confirmation&&upload>guard);
});
test('cloud upload snapshots current state rather than stale pre-dialogue save',()=>{
 const start=html.indexOf("el('online-save').onclick=");
 const end=html.indexOf("el('online-load').onclick=",start);
 const fn=html.slice(start,end);
 assert.match(fn,/const latestGame=JSON\.parse\(JSON\.stringify\(s\)\)/);
 assert.match(fn,/p_save_data:latestGame/);
 assert(fn.indexOf('const latestGame=')>fn.indexOf('await cloudInfo()'));
});
