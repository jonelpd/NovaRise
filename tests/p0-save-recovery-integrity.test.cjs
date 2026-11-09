'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const cut=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,a);return html.slice(i,j)};
const code=cut('function persistGame()','function save()')+cut('function validGame(g)','function load()')+cut('function load()','function exportSave()');
function state(){return {x:2,y:2,turn:4,gold:120,crystals:25,seasonPoints:0,moves:3,soldiers:5,archers:2,griffins:1,dragons:0,experience:40,faction:'Alianza del Alba',seen:['2,2'],taken:[],claimed:[],ownedMines:[],buildings:[],rewardClaims:[],mineLevels:{},miners:{},verifiedSites:{'fort-west':'player'},message:''}}
function setup(initial){const map=new Map(Object.entries(initial)),ctx={s:state(),STORE:'campaign',selectedMine:'',battle:null,rivalBusy:false,window:{},localStorage:{getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,v)},reveal:()=>{},render:()=>{},message:t=>{ctx.s.message=t},start:()=>{ctx.started=true}};vm.createContext(ctx);vm.runInContext(code,ctx);return {ctx,map}}
test('valid primary save restores castle, troops and resources without using backup',()=>{
 const current=state(),{ctx}=setup({campaign:JSON.stringify(current),'campaign-backup':'{invalid'});
 ctx.s.gold=0;ctx.load();
 assert.equal(ctx.s.gold,120);assert.equal(ctx.s.verifiedSites['fort-west'],'player');assert.equal(ctx.s.soldiers,5);
});
test('corrupted primary is preserved and valid backup restores campaign',()=>{
 const backup=state(),{ctx,map}=setup({campaign:'{broken','campaign-backup':JSON.stringify(backup)});
 ctx.load();
 assert.equal(ctx.s.gold,120);assert.equal(ctx.s.verifiedSites['fort-west'],'player');
 assert.equal(map.get('campaign'),'{broken');
 assert.ok([...map.keys()].some(k=>k.startsWith('campaign-recovery-')));
});
test('unrecoverable primary is never overwritten by a fresh game',()=>{
 const {ctx,map}=setup({campaign:'{broken','campaign-backup':'{also-broken'});
 ctx.load();
 assert.equal(ctx.STORE,null);assert.equal(ctx.started,true);
 assert.equal(map.get('campaign'),'{broken');
 assert.ok([...map.keys()].some(k=>k.startsWith('campaign-recovery-')));
});
