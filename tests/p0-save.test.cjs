// Run: node --test tests/p0-save.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

for (const page of ['index.html','combate-demo.html']) {
 test(page + ': local save restores resources and castle ownership', () => {
  const html = fs.readFileSync(path.join(__dirname,'..','juego',page),'utf8');
  const begin = html.indexOf('function save(){');
  const end = html.indexOf('function exportSave(){',begin);
  assert.ok(begin >= 0 && end > begin);
  const game = {x:2,y:3,seen:['2,3'],taken:['fort-west'],buildings:[],ownedMines:['mine-a'],mineLevels:{},crystals:12,seasonPoints:4,rewardClaims:[],miners:{},gold:250,moves:3,soldiers:7,archers:2,griffins:1,dragons:0,verifiedSites:{'fort-west':'player'}};
  let saved = '', renders = 0, starts = 0;
  const messages = [];
  const context = {s:game,battle:null,STORE:'test-save',W:20,H:20,selectedMine:'',
   localStorage:{setItem:(_key,value)=>{saved=value;},getItem:()=>saved},
   message:text=>messages.push(text),reveal:()=>{},render:()=>{renders++;},start:()=>{starts++;}
  };
  vm.createContext(context);
  vm.runInContext(html.slice(begin,end),context);
  context.save();
  assert.equal(JSON.parse(saved).gold,250);
  context.s={...game,gold:1,verifiedSites:{}};
  context.load();
  assert.equal(context.s.gold,250);
  assert.equal(context.s.verifiedSites['fort-west'],'player');
  assert.equal(context.selectedMine,'mine-a');
  assert.equal(renders,1);
  assert.equal(starts,0);
  const before=saved;
  context.battle={round:1};
  context.save();
  assert.equal(saved,before,'Saving during combat must not overwrite storage');
  assert.ok(messages.some(m=>m.includes('Termina el combate')));
 });
}
