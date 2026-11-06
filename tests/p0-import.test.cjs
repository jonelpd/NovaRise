// Run: node --test tests/p0-import.test.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 test(page+': import validates save format and rejects corrupt state',()=>{
  const html=fs.readFileSync(path.join(__dirname,'..','juego',page),'utf8');
  const begin=html.indexOf('function validGame(g){');
  const end=html.indexOf("$('export-save').onclick",begin);
  assert.ok(begin>=0&&end>begin);
  const ctx={W:10,H:10};vm.createContext(ctx);vm.runInContext(html.slice(begin,end),ctx);
  const game={x:2,y:3,gold:250,crystals:12,soldiers:7,archers:2,moves:3,seen:[],taken:[],claimed:[],ownedMines:[],buildings:[],rewardClaims:[],mineLevels:{},miners:{},seasonPoints:0,turn:5,experience:0,griffins:1,dragons:0,faction:'Alianza del Alba',verifiedSites:{'fort-west':'player'}};
  const save={format:'novarise-local-save',version:10,game};
  assert.ok(ctx.validImport(save));
  assert.ok(!ctx.validImport({...save,version:9}));
  assert.ok(!ctx.validImport({...save,format:'invalid'}));
  assert.ok(!ctx.validImport({...save,game:{...game,gold:-1}}));
  assert.ok(!ctx.validImport({...save,game:{...game,archers:undefined}}));
  assert.match(html,/if\(battle\)\{\$\('import-file'\)\.value='';return message\('Termina el combate antes de importar una partida\.'\)\}/);
 });
}
