'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': automatic castle assault does not recreate removed siege history',()=>{
  const a=html.indexOf('function rivalCastleConquest(siteId){');
  const b=html.indexOf('function applyVerifiedSiteTurn(){',a);
  assert(a>=0&&b>a);
  const fn=html.slice(a,b);
  assert.doesNotMatch(fn,/siegeHistory|history\.unshift/);
  assert.match(fn,/if\(won\)\{owners\[target\.site\.id\]='rival'/);
  assert.match(fn,/v\.soldiers=attackers\.soldiers;v\.archers=attackers\.archers/);
  assert.match(fn,/return outcome\+' '\+details/);
 });
}
