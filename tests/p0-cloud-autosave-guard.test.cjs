'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
test('autosave is armed only after a successful manual cloud save',()=>{
 const arm=html.indexOf('autoCloudRevision=newRevision;autoCloudUserId=savingUserId;autoCloudLastSaved=JSON.stringify(latestGame);autoCloudPending=false;autoCloudPaused=false');
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
 assert.match(html,/if\(changedPlayer\)stopAutoCloud\(\)/);
});

test('autosave does not re-upload an unchanged snapshot and queues edits during upload',()=>{
 assert.match(html,/if\(snapshotText===autoCloudLastSaved\)return/);
 assert.match(html,/if\(autoCloudRunning\)\{autoCloudPending=true;return\}/);
 assert.match(html,/autoCloudLastSaved=snapshotText/);
 assert.match(html,/autoCloudPending\|\|JSON\.stringify\(s\)!==snapshotText/);
 assert.match(html,/autoCloudLastSaved=JSON\.stringify\(latestGame\)/);
});

test('unchanged local snapshot can rearm a pending cloud upload safely',()=>{
 assert.match(html,/if\(previous===next\)\{window\.nvrScheduleCloudSave\?\.\(\);return true;\}/);
 assert.match(html,/if\(autoCloudLastSaved!==null&&JSON\.stringify\(s\)===autoCloudLastSaved\)return/);
});
test('cloud restore does not race an in-flight autosave',()=>{
 const restore=html.slice(html.indexOf("el('online-load').onclick"),html.indexOf('db.auth.onAuthStateChange'));
 assert.match(restore,/if\(autoCloudRunning\)throw Error/);
 assert.match(restore,/stopAutoCloud\(\);location\.reload\(\)/);
});
