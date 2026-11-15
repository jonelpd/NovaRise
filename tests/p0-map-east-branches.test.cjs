'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {auditEastBranches}=require('../scripts/audit-east-branches.cjs');
const roads=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
const review=JSON.parse(fs.readFileSync('docs/auditoria-bifurcaciones-torre-central.json','utf8'));
test('two visible eastern candidates cannot be mistaken for two mapped routes',()=>{
 const result=auditEastBranches(roads,review);
 assert.equal(result.candidate_count,2);
 assert.equal(result.eastward_entry_present,true);
 assert.equal(result.eastward_entry_degree,2);
 assert.equal(result.separately_mapped_eastern_candidates,0);
 assert.equal(result.missing_candidate_mappings.length,2);
 assert.equal(result.release_ready,false);
 assert.equal(result.edges_added,0);
 assert.equal(result.graph_modified,false);
});
test('audit never invents mapping even if candidate labels change',()=>{
 const modified=structuredClone(review);
 modified.east_branch_review.visible_candidates[0].id='other-visible-candidate';
 const before=JSON.stringify(roads);
 const result=auditEastBranches(roads,modified);
 assert.equal(result.candidate_ids[0],'other-visible-candidate');
 assert.equal(JSON.stringify(roads),before);
 assert.equal(result.separately_mapped_eastern_candidates,0);
});
