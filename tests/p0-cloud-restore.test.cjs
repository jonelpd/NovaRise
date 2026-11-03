// Run: node --test tests/p0-cloud-restore.test.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
test('cloud restore keeps local save backup before replacement',()=>{
 const old="localStorage.getItem(SAVE)";
 const backup="localStorage.setItem(SAVE+'-before-cloud-restore',previousLocal)";
 const replace="localStorage.setItem(SAVE,JSON.stringify(g))";
 const start=html.indexOf("el('online-load').onclick");
 assert.ok(start>=0,'Cloud restore handler must exist');
 const section=html.slice(start,start+2500);
 assert.ok(section.includes(old));
 assert.ok(section.includes(backup));
 assert.ok(section.includes(replace));
 assert.ok(section.indexOf(backup)<section.indexOf(replace),'Backup must precede replacement');
 assert.ok(section.indexOf("if(!confirm('¿Reemplazar la partida local")<section.indexOf(backup),'Backup follows user confirmation');
 assert.ok(section.includes('catch(writeError)'),'Write failures must trigger rollback');
 assert.ok(section.includes('localStorage.setItem(SAVE,previousLocal)'),'Original save must be restored');
 assert.ok(section.includes('localStorage.setItem(OWNER,previousOwner)'),'Original owner must be restored');
 assert.ok(section.indexOf('catch(writeError)')<section.indexOf('location.reload()'),'Reload only after successful write');
});
test('cloud restore checks owner and valid game before writing',()=>{
 const start=html.indexOf("el('online-load').onclick");
 const section=html.slice(start,start+2500);
 assert.ok(section.includes('if(!validGame(g)'));
 assert.ok(section.includes('owner&&owner!==currentUser.id'));
 assert.ok(section.indexOf('if(!validGame(g)')<section.indexOf("localStorage.setItem(SAVE,JSON.stringify(g))"));
});
