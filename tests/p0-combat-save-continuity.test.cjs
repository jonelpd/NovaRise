'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const section=(start,end)=>{const a=html.indexOf(start),b=html.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,start);return html.slice(a,b)};
const persistence=section('function persistGame()','function save()')+section('function validGame(g)','function load()');
const outcomes=section('function loseBattle()','function battleAttackDamage(type)');
const base=()=>({x:2,y:2,turn:3,gold:50,crystals:0,seasonPoints:0,moves:3,soldiers:4,archers:2,griffins:1,dragons:0,experience:10,faction:'Alianza del Alba',seen:['2,2'],taken:[],claimed:[],ownedMines:[],buildings:[],rewardClaims:[],mineLevels:{},miners:{},verifiedSites:{},message:''});
test('duel victory survives serialize/reload with rewards, casualties and rival state',()=>{
 const store=new Map(),s=base(),v={soldiers:8,archers:3,gold:125,defeated:false,recovery:2};
 s.rival=v;
 const ctx={s,battle:{rival:true},rivalBusy:false,STORE:'campaign',localStorage:{getItem:k=>store.get(k)||null,setItem:(k,x)=>store.set(k,x)},window:{},rivalState:()=>v,$:()=>({hidden:false}),awardHeroExperience:n=>{s.experience+=n;return ''}};
 ctx.render=()=>ctx.persistGame();
 vm.createContext(ctx);vm.runInContext(persistence+outcomes,ctx);
 s.soldiers=2;s.archers=1;ctx.hitResolveVictory();
 assert.equal(ctx.battle,null);assert.ok(store.has('campaign'));
 const saved=JSON.parse(store.get('campaign'));
 assert.deepEqual([saved.soldiers,saved.archers,saved.gold,saved.experience],[2,1,175,90]);
 assert.equal(saved.rival.defeated,true);
 assert.equal(ctx.validGame(saved),true);
});
test('active battle cannot overwrite previously saved campaign',()=>{
 const store=new Map(),s=base(),ctx={s,battle:null,rivalBusy:false,STORE:'campaign',localStorage:{getItem:k=>store.get(k)||null,setItem:(k,x)=>store.set(k,x)},window:{}};
 vm.createContext(ctx);vm.runInContext(persistence,ctx);
 assert.equal(ctx.persistGame(),true);
 const before=store.get('campaign');s.soldiers=0;ctx.battle={rival:true};
 assert.equal(ctx.persistGame(),false);assert.equal(store.get('campaign'),before);
});
