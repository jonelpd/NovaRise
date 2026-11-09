'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
test('automatic cloud sync refuses stale snapshot after asynchronous revision check',()=>{
 const start=html.indexOf('async function autoCloudSave()'),end=html.indexOf('function status(t)',start);
 assert.ok(start>=0&&end>start);
 const fn=html.slice(start,end);
 const read=fn.indexOf("await db.from('nvr_game_saves').select('revision')");
 const guard=fn.indexOf("if(JSON.stringify(s)!==snapshotText){autoCloudPending=true;return;}");
 const write=fn.indexOf("await db.rpc('nvr_save_campaign_if_revision'");
 assert.ok(read>=0&&guard>read&&write>guard,'snapshot must be rechecked between remote revision read and RPC write');
 assert.match(fn,/finally\{autoCloudRunning=false;if\(!autoCloudPaused&&currentUser\?\.id===uid&&\(autoCloudPending\|\|JSON\.stringify\(s\)!==snapshotText\)\)window\.nvrScheduleCloudSave\?\.\(\)\}/);
});
