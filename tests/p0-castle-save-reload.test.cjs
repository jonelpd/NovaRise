'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
function slice(a,b){const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,a);return html.slice(i,j)}
const code=slice('function persistGame()','function save()')+slice('function validGame(g)','function load()')+slice('function load()','function exportSave()')+slice('function loseBattle()','function battleAttackDamage(type)');
function fresh(){return {x:2,y:2,turn:3,gold:40,crystals:0,seasonPoints:0,moves:3,soldiers:5,archers:2,griffins:1,dragons:0,experience:10,faction:'Alianza del Alba',seen:['2,2'],taken:[],claimed:[],ownedMines:[],buildings:[],rewardClaims:[],mineLevels:{},miners:{},verifiedSites:{},message:''}}
test('castle conquest persists ownership, survivors and reward through reload',()=>{
 const store=new Map(),s=fresh(),g={defenders:{soldiers:0,archers:0,griffins:0,dragons:0}};
 const ctx={s,battle:{siteId:'fort-west',siteLabel:'Bastión',rival:false},rivalBusy:false,STORE:'campaign',selectedMine:'',window:{},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},$:()=>({hidden:false}),siteGarrison:()=>g,verifiedSiteState:()=>s.verifiedSites,awardHeroExperience:n=>{ctx.s.experience+=n;return ''},reveal:()=>{},render:()=>ctx.persistGame(),message:t=>{ctx.s.message=t;ctx.render()}};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 ctx.s.soldiers=3;ctx.hitResolveVictory();
 assert.equal(ctx.s.verifiedSites['fort-west'],'player');assert.equal(ctx.s.gold,140);assert.equal(ctx.s.experience,45);
 const before=JSON.parse(store.get('campaign'));assert.equal(before.soldiers,3);
 ctx.s=fresh();ctx.load();
 assert.equal(ctx.s.verifiedSites['fort-west'],'player');assert.equal(ctx.s.gold,140);assert.equal(ctx.s.experience,45);assert.equal(ctx.s.soldiers,3);
});
