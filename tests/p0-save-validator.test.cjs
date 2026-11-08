'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 test(page+': shared save validation accepts legitimate campaigns and rejects invalid values',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
  const a=html.indexOf('function validGame(g){'),b=html.indexOf('function validImport(v){',a);
  assert(a>=0&&b>a,'save validator and import validator must exist');
  const gameEnd=html.indexOf('\n}',a)+2;
  const importEnd=html.indexOf("$('export-save').onclick",b);
  const ctx={};vm.createContext(ctx);
  vm.runInContext(html.slice(a,gameEnd)+'\n'+html.slice(b,importEnd),ctx);
  const game={x:1,y:1,turn:8,moves:7,gold:200,crystals:10,seasonPoints:0,soldiers:4,archers:2,griffins:0,dragons:0,experience:60,seen:[],taken:[],claimed:[],ownedMines:[],buildings:[],rewardClaims:[],mineLevels:{},miners:{},faction:'Alianza del Alba'};
  assert.equal(ctx.validGame(game),true);
  assert.equal(ctx.validImport({format:'novarise-local-save',version:10,game}),true);
  for(const changes of [{moves:8},{x:-1},{gold:-1},{turn:0},{dragons:100001},{miners:{mine:4}},{seen:null},{faction:'invalid'}]){
   assert.equal(ctx.validGame({...game,...changes}),false,JSON.stringify(changes));
  }
 });
 test(page+': movement waits for decisions and blocks modal reentry',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
  assert.match(html,/await move\(x,y\)/);
  assert.match(html,/async function move\(x,y\)\{if\(s.done\|\|battle\|\|[^\n]*document.querySelector\('\.realm-dialog'\)/);
  assert.match(html,/s\.taken\.push\(k\);recordMapTreasure\(k\);if\(chooseExperience\)/);
 });
}
