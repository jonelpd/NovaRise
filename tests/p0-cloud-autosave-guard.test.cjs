'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
test('autosave is armed only after a successful manual cloud save',()=>{
 const arm=html.indexOf('autoCloudRevision=newRevision;autoCloudUserId=savingUserId;autoCloudPaused=false');
 const rpc=html.indexOf("db.rpc('nvr_save_campaign_if_revision'",html.indexOf("el('online-save').onclick="));
 assert(rpc>=0&&arm>rpc);
 assert.match(html,/let autoCloudRevision=null,autoCloudUserId=null,autoCloudPaused=true/);
});
test('autosave verifies remote revision and pauses on conflict',()=>{
 const fn=html.slice(html.indexOf('async function autoCloudSave()'),html.indexOf('function status(t)'));
 assert.match(fn,/select\('revision'\)/);
 assert.match(fn,/remote\?\.revision\?\?null/);
 assert.match(fn,/autoCloudPaused=true/);
 assert.match(fn,/p_expected_revision:revision/);
 assert.match(fn,/if\(newRevision===null\)/);
});
test('autosave preserves local writes and excludes combat and rival turns',()=>{
 assert.match(html,/localStorage\.setItem\(STORE,next\);\s*window\.nvrScheduleCloudSave\?\.\(\)/);
 assert.match(html,/autoCloudPaused\|\|autoCloudRunning\|\|busy/);
 assert.match(html,/rivalBusy\|\|!el\('modal'\)\.hidden/);
 assert.match(html,/if\(currentUser\?\.id!==nextUser\?\.id\)stopAutoCloud\(\)/);
});
