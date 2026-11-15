'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {inspectJunctions}=require('../scripts/inspect-marked-road-junctions.cjs');
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

test('both mapped forks have exactly three documented neighbors, but remain unapproved',()=>{
 const results=inspectJunctions(draft,audit.junction_specs);
 assert.equal(results.length,2);
 for(const result of results){
  assert.equal(result.degree,3);
  assert.equal(result.topologyMatches,true);
  assert.equal(result.visuallyApproved,false);
 }
 assert.equal(audit.checks.pixel_route_approvals,0);
 assert.equal(audit.junction_specs.every(s=>s.approval==='topology-only-unverified'),true);
});
test('fork audit rejects invented shortcuts or missing branch edges',()=>{
 const edited={...draft,edges:draft.edges.filter(e=>!(e.from==='central-mill-09'&&e.to==='central-south-01'))};
 assert.equal(inspectJunctions(edited,audit.junction_specs)[0].topologyMatches,false);
});

test('tower footprint overlap blocks premature approval of the visible junction',()=>{
 assert.equal(audit.visual_review.tower.clearance_confirmed,false);
 assert.equal(audit.visual_review.tower.route_approval,false);
 assert.equal(audit.visual_review.ruins.route_approval,false);
 assert.equal(audit.visual_review.east.route_approval,false);
 assert.ok(audit.visual_review.tower.required_fix.includes('watchtower'));
 assert.equal(draft.edges.every(e=>e.verified===false),true);
});

const {validateRoadRelease}=require('../scripts/validate-map-road-release.cjs');
test('release gate rejects the tower and ruins forks even if all road edges are marked verified',()=>{
 const unsafe={...draft,status:'approved',map_sha256:'a'.repeat(64),edges:draft.edges.map(e=>({...e,verified:true}))};
 const result=validateRoadRelease(unsafe);
 assert.equal(result.ready,false);
 assert.ok(result.errors.some(e=>e.includes('central-mill-09')));
 assert.ok(result.errors.some(e=>e.includes('central-south-03')));
});
test('release gate requires evidence, exact neighbors and clearance for every original-map fork',()=>{
 const nodes=[{id:'a',x:.1,y:.1},{id:'b',x:.2,y:.1},{id:'c',x:.1,y:.2},{id:'d',x:.2,y:.2}];
 const edges=['b','c','d'].map(to=>({from:'a',to,verified:true}));
 const base={schema_version:2,coordinate_system:'normalized',status:'approved',map_asset:'mapa-rutas-marcadas.png',map_sha256:'a'.repeat(64),nodes,edges};
 assert.equal(validateRoadRelease(base).ready,false);
 const bad={...base,junction_clearances:{a:{clearance_confirmed:true,visual_approved:true,neighbors:['b','c'],evidence:'Reviewed map'}}};
 assert.equal(validateRoadRelease(bad).ready,false);
 const approved={...base,junction_clearances:{a:{clearance_confirmed:true,visual_approved:true,neighbors:['b','c','d'],evidence:'Reviewed marked original and confirmed obstacle-free three-way junction'}}};
 assert.equal(validateRoadRelease(approved).ready,true);
});
