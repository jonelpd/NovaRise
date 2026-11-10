'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const start=html.indexOf('function secondarySiegeEligibility(');
const end=html.indexOf('function rivalCastleConquest(siteId){',start);
assert.ok(start>=0&&end>start,'Isolated siege eligibility function must exist');
const snippet=html.slice(start,end);
function check({owner='player',homeOwner='rival',active=true,defeated=false,x=32,y=38,soldiers=7,archers=2}={}){
 const hero={active,defeated,x,y,soldiers,archers};
 const owners={'fort-west':homeOwner,'fort-center':owner};
 const sites=[{id:'fort-west',kind:'fort',x:32,y:38},{id:'fort-center',kind:'fort',x:35,y:40}];
 const guard={soldiers:4,archers:3,griffins:1,dragons:0};
 const context={verifiedSiteState:()=>owners,VERIFIED_MAP_SITES:sites,enemyCastleHeroes:()=>({'fort-west':hero}),siteGarrison:()=>({defenders:guard}),Math};
 vm.createContext(context);vm.runInContext(snippet,context);
 const result=context.secondarySiegeEligibility('fort-west','fort-center');
 return {result,hero,guard,owners};
}
test('secondary siege eligibility returns snapshot only for nearby active commander',()=>{
 const {result}=check();
 assert.ok(result);
 assert.equal(result.commanderId,'fort-west');
 assert.equal(result.castleId,'fort-center');
 assert.deepEqual({...result.attackers},{soldiers:7,archers:2});
 assert.deepEqual({...result.defenders},{soldiers:4,archers:3,griffins:1,dragons:0});
});
test('secondary siege eligibility rejects lost or non-player fortresses',()=>{
 assert.equal(check({owner:'rival'}).result,null);
 assert.equal(check({homeOwner:'player'}).result,null);
});
test('secondary siege eligibility rejects defeated, inactive and empty armies',()=>{
 assert.equal(check({defeated:true}).result,null);
 assert.equal(check({active:false}).result,null);
 assert.equal(check({soldiers:0,archers:0}).result,null);
});
test('secondary siege eligibility requires physical proximity',()=>{
 assert.equal(check({x:80,y:80}).result,null);
});
test('secondary siege eligibility never mutates troops, garrison or ownership',()=>{
 const {result,hero,guard,owners}=check();
 result.attackers.soldiers=0;result.defenders.archers=0;
 assert.equal(hero.soldiers,7);assert.equal(guard.archers,3);
 assert.equal(owners['fort-center'],'player');
});
