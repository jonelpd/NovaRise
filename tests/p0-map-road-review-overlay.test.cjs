'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('tools/revisar-rutas-marcadas.html','utf8');
test('review overlay uses original user-marked map and current draft',()=>{
 assert.match(html,/\.\.\/juego\/mapa-rutas-marcadas\.png/);
 assert.match(html,/\.\.\/docs\/mapa-rutas-marcadas-tramo-central\.json/);
 assert.match(html,/viewBox="0 0 1254 1254"/);
 assert.match(html,/n\.pixel\[0\]/);
 assert.match(html,/n\.pixel\[1\]/);
});
test('review page never approves routes or changes gameplay',()=>{
 assert.match(html,/NO rutas activas del juego/);
 assert.doesNotMatch(html,/localStorage\.setItem/);
 assert.doesNotMatch(html,/verified\s*=\s*true/);
});

test('review overlay flags both unapproved forks and provides a focused inspection view',()=>{
 assert.match(html,/auditoria-bifurcaciones-torre-central\.json/);
 assert.match(html,/id="hazards"/);
 assert.match(html,/id="focusTower"/);
 assert.match(html,/SIN PASO CONFIRMADO/);
 assert.match(html,/audit\.junction_specs/);
 assert.doesNotMatch(html,/fetch\([^)]*,\s*\{\s*method:\s*['"]POST/);
});

test('all draft edges incident to an unresolved fork are highlighted, never silently approved',()=>{
 assert.match(html,/pending\.has\(e\.from\)\|\|pending\.has\(e\.to\)/);
 assert.match(html,/stroke:danger\?'#ff3030'/);
 assert.match(html,/audit\?\.junction_specs/);
});

test('east pond inspection does not conflate unverified visual branches with approved graph edges',()=>{
 assert.match(html,/id="focusEast"/);
 assert.match(html,/audit\.east_branch_review\.visible_candidates\.length/);
 assert.match(html,/correspondencia con grafo sin resolver/);
 assert.match(html,/ninguna aprobada/);
});
