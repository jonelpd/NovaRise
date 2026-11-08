'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': defensive siege keeps army transfer but no longer writes removed siege history',()=>{
  const a=html.indexOf('function finishDefensiveSiege(won){');
  const b=html.indexOf('function launchDefensiveSiege(site){',a);
  assert(a>=0&&b>a);
  const fn=html.slice(a,b);
  assert.match(fn,/g\.defenders\[type\]=after\[type\];s\[type\]=battle\.heroArmyBefore\[type\]/);
  assert.match(fn,/verifiedSiteState\(\)\[id\]='rival'/);
  assert.doesNotMatch(fn,/siegeHistory|history\.unshift/);
  assert.match(fn,/battle=null;\$\('modal'\)\.hidden=true;message\(outcome\);render\(\)/);
 });
}
