'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const autoStart=html.indexOf('async function autoCloudSave(){');
const autoEnd=html.indexOf('\nfunction status(',autoStart);
const restoreStart=html.indexOf("el('online-load').onclick=");
const restoreEnd=html.indexOf("db.auth.onAuthStateChange(",restoreStart);
const inspectStart=html.indexOf('async function inspectCloudOnEntry(');
const inspectEnd=html.indexOf('async function refresh()',inspectStart);
const auto=html.slice(autoStart,autoEnd),restore=html.slice(restoreStart,restoreEnd),inspect=html.slice(inspectStart,inspectEnd);
test('cloud autosave pauses on network error without replacing local campaign',()=>{
 assert(autoStart>=0&&autoEnd>autoStart);
 assert.match(auto,/catch\(e\)\{autoCloudPaused=true;/);
 assert.match(auto,/La partida local permanece guardada/);
 assert.doesNotMatch(auto,/localStorage\.(?:setItem|removeItem)\(SAVE/);
});
test('cloud autosave uses server revision and stops on conflict',()=>{
 assert.match(auto,/remote\?\.revision/);
 assert.match(auto,/autoCloudPaused=true/);
 assert.match(auto,/nvr_save_campaign_if_revision/);
 assert.match(auto,/if\(newRevision===null\)/);
});
test('cloud restore validates remote revision after confirmation and before local write',()=>{
 assert(restoreStart>=0&&restoreEnd>restoreStart);
 const confirm=restore.indexOf("await realmConfirm('☁️ Recuperar partida'");
 const check=restore.indexOf('latestRemote.revision!==data.revision');
 const write=restore.indexOf('localStorage.setItem(SAVE,JSON.stringify(g))');
 assert(confirm>=0&&check>confirm&&write>check);
 assert.match(restore,/SAVE\+'-before-cloud-restore'/);
 assert.match(restore,/if\(previousLocal===null\)localStorage\.removeItem\(SAVE\)/);
});
test('entry comparison never overwrites local progress and handles disconnection',()=>{
 assert(inspectStart>=0&&inspectEnd>inspectStart);
 assert.match(inspect,/if\(error\)throw error/);
 assert.match(inspect,/No se pudo comparar la nube/);
 assert.match(inspect,/localStorage\.getItem\(localKey\)!==localSnapshot/);
 assert.doesNotMatch(inspect,/localStorage\.(?:setItem|removeItem)\(/);
});
