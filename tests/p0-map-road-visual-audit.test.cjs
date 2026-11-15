'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const audit=JSON.parse(fs.readFileSync('docs/mapa-original-auditoria-visual.json','utf8'));
const routes=JSON.parse(fs.readFileSync('docs/mapa-original-rutas-trazado-preliminar.json','utf8'));
test('visual audit covers all draft routes and approves none',()=>{
 const names=new Set(routes.nodes.map(n=>n.id.replace(/-\d+$/,'')));
 assert.equal(audit.status,'review-blocked');
 assert.equal(audit.map_asset,routes.map_asset);
 assert.equal(audit.approved_route_count,0);
 assert.deepEqual(new Set(audit.route_reviews.map(r=>r.route)),names);
 assert.ok(audit.route_reviews.every(r=>r.status==='blocked'||r.status==='needs-detail-review'));
 assert.ok(routes.edges.every(e=>e.verified===false));
});
