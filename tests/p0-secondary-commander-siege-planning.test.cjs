'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const html=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const start=html.indexOf('async function enemyCastleHeroTurns(epoch){');
const end=html.indexOf('function rivalPosition(){',start);
assert.ok(start>=0&&end>start,'Secondary commander turn implementation must exist');
const turn=html.slice(start,end);

test('secondary commanders plan sieges only against player-owned fortresses',()=>{
 assert.match(turn,/target\.kind==='fort'&&owners\[target\.id\]==='player'/);
 assert.match(turn,/Math\.hypot\(target\.x-site\.x,target\.y-site\.y\)<=20/);
});

test('secondary commanders compare army power with actual garrison',()=>{
 assert.match(turn,/siteGarrison\(target\.id\)\.defenders/);
 assert.match(turn,/defenders\.soldiers\+2\*defenders\.archers\+5\*defenders\.griffins\+14\*defenders\.dragons/);
 assert.match(turn,/enemyArmy>=Math\.max\(8,Math\.ceil\(defensePower\*1\.5\)\)/);
});

test('secondary commanders keep hero pursuit ahead of castle approach',()=>{
 assert.match(turn,/const siegeObjective=!chaseRoute&&castleRoutes\.length&&h\.turns%3===0/);
 assert.match(turn,/const path=chaseRoute&&chaseRoute\.length\?chaseRoute:siegeObjective\?siegeObjective\.path/);
 assert.match(turn,/distance>15\?goal/);
});

test('secondary commanders cannot exceed four movement steps',()=>{
 assert.match(turn,/h\.moves=4/);
 assert.match(turn,/for\(const \[x,y\] of path\.slice\(0,4\)\)/);
 assert.match(turn,/navSegmentClear\(\[h\.x,h\.y\],\[x,y\]\)/);
});

test('castle approach does not bypass the existing defensive siege engine',()=>{
 assert.doesNotMatch(turn,/rivalCastleConquest\(/);
 assert.doesNotMatch(turn,/launchDefensiveSiege\(/);
});
