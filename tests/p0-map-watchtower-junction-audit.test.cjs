'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const draft=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
const audit=JSON.parse(fs.readFileSync('docs/auditoria-bifurcaciones-torre-central.json','utf8'));
test('watchtower and southern fork stay provisional with no fabricated links',()=>{
 assert.equal(audit.status,'visual-junction-review-pending');
 assert.equal(audit.observations.length,2);
 const ids=new Set(draft.nodes.map(n=>n.id));
 for(const fork of audit.observations){
  assert.equal(fork.verified,false);
  assert.ok(fork.approx_pixel.every(v=>Number.isInteger(v)&&v>=0&&v<1254));
  assert.ok(fork.graph_nodes_nearby.every(id=>ids.has(id)));
 }
 assert.equal(audit.checks.existing_node_count,draft.nodes.length);
 assert.equal(audit.checks.existing_edge_count,draft.edges.length);
 assert.equal(audit.checks.route_edits_made,false);
 assert.equal(audit.checks.save_changes_made,false);
 assert.ok(draft.edges.every(e=>e.verified===false));
 assert.equal(draft.edges.some(e=>e.from==='central-mill-09'&&e.to==='central-south-01'),true);
 assert.equal(draft.edges.some(e=>e.from==='central-south-03'&&e.to==='central-ruins-01'),true);
});
