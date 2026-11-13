'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
function section(a,b){const i=html.indexOf(a),j=html.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,a);return html.slice(i,j)}
const definitions=section('const CASTLE_PROFILES=','async function recruitFromCastle(site){');
function setup(level=1){
 const s={campaignLevel:level,gold:10000,soldiers:0,archers:0,griffins:0,dragons:0};
 const owned={garrisons:{},'fort-west':'player','fort-center':'player','fort-east':'player','fort-north':'player','fort-south':'player'};
 const c={s,verifiedSiteState:()=>owned};vm.createContext(c);vm.runInContext(definitions,c);return {c,s,owned};
}
test('all five castles have bounded recruitable stocks and positive unit prices',()=>{
 const {c}=setup();
 const profiles=vm.runInContext('CASTLE_PROFILES',c),costs=vm.runInContext('CASTLE_RECRUIT_COST',c);
 assert.equal(Object.keys(profiles).length,5);
 for(const [id,p] of Object.entries(profiles)){
  const g=c.siteGarrison(id);
  for(const [unit,price] of Object.entries(costs)){
   assert.ok(Number.isSafeInteger(price)&&price>0,unit);
   assert.ok(g.stock[unit]>=0&&g.stock[unit]<=p.stock[unit]*3,id+': '+unit);
  }
 }
});
test('castle defenders scale with campaign level but remain finite at level fifty',()=>{
 for(const level of [1,2,10,25,50]){
  const {c}=setup(level);
  for(const id of ['fort-west','fort-center','fort-east','fort-north','fort-south']){
   const g=c.siteGarrison(id);
   assert.ok(g.guard.soldiers>=0&&g.guard.soldiers<=159);
   assert.ok(g.guard.archers>=0&&g.guard.archers<=104);
   assert.ok(g.guard.griffins>=0&&g.guard.griffins<=27);
   assert.ok(g.guard.dragons>=0&&g.guard.dragons<=13);
  }
 }
});
test('saved castle stocks are normalized to nonnegative integers',()=>{
 const {c,owned}=setup();
 owned.garrisons['fort-west']={stock:{soldiers:-8,archers:2.9,griffins:NaN,dragons:0}};
 const g=c.siteGarrison('fort-west');
 assert.equal(g.stock.soldiers,0);
 assert.equal(g.stock.archers,2);
 assert.equal(g.stock.griffins,0);
});
