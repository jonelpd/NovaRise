'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync('tools/editor-caminos.html','utf8');
test('editor does not permit marking newly drawn routes as verified',()=>{
 assert.match(html,/verified:false,review:'Pending independent visual inspection/);
 assert.doesNotMatch(html,/document\.getElementById\('approved'\)\.checked/);
});
test('editor invalidates imported and changed-map route approvals',()=>{
 assert.match(html,/Revalidation required after import/);
 assert.match(html,/Map image changed; revalidation required/);
 assert.match(html,/El JSON pertenece a otro mapa/);
});
test('editor creates noncolliding IDs after import or undo',()=>{
 assert.match(html,/while\(data\.nodes\.some\(n=>n\.id===/);
});

test('editor can load user-marked map but never approves old routes',()=>{
 assert.match(html,/\.\.\/juego\/mapa-rutas-marcadas\.png/);
 assert.match(html,/\.\.\/docs\/mapa-original-rutas-trazado-preliminar\.json/);
 assert.match(html,/Old preliminary trace: retrace against user-marked black paths/);
 assert.match(html,/verified:false,review:'Review against marked user map'/);
});
