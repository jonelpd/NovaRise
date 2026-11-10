'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','juego','index.html'),'utf8');
const a=source.indexOf('async function enemyCastleHeroTurns(');
const b=source.indexOf('function rivalPosition()',a);
const rival=source.slice(source.indexOf('async function rivalTurn(){'),source.indexOf('function updateSiegeReport()'));
test('secondary commander only queues siege after approaching objective',()=>{
 assert.ok(a>=0&&b>a);
 const turn=source.slice(a,b);
 assert.match(turn,/if\(siegeObjective&&Math\.hypot\(h\.x-siegeObjective\.target\.x,h\.y-siegeObjective\.target\.y\)<=5\.5\)/);
 assert.match(turn,/queueSecondarySiegeDecision\(site\.id,siegeObjective\.target\.id\)/);
});
test('secondary siege dialogue completes before releasing rival turn lock',()=>{
 assert.match(rival,/if\(!battle&&s\.pendingSecondarySiege\)await promptSecondarySiegeDefense\(true\);\s*rivalBusy=false;/);
});
test('main siege decision remains independently available',()=>{
 assert.match(rival,/if\(s\.pendingDefensiveSiege\)/);
 assert.match(rival,/launchDefensiveSiege\(site\)/);
});
test('secondary siege only plans an attack when force advantage exists',()=>{
 const turn=source.slice(a,b);
 assert.match(turn,/enemyArmy>=Math\.max\(8,Math\.ceil\(defensePower\*1\.5\)\)/);
 assert.match(turn,/const siegeObjective=!chaseRoute&&castleRoutes\.length&&h\.turns%3===0/);
});

test('cancelled rival epoch is checked after last movement await before siege or conquest',()=>{
 const turn=source.slice(a,b);
 const lastAwait=turn.indexOf('await new Promise(resolve=>setTimeout(resolve,160));');
 const guard=turn.indexOf("if(epoch!==rivalEpoch||s.done||verifiedSiteState()[site.id]!=='rival')return;",lastAwait);
 const siege=turn.indexOf('if(siegeObjective&&Math.hypot(',lastAwait);
 const resource=turn.indexOf('if(objective&&completed===path.length',lastAwait);
 assert.ok(lastAwait>=0&&guard>lastAwait&&siege>guard&&resource>guard);
});
