'use strict';
// Compare visually observed eastern candidates with the existing draft only.
// No pixel inference, edges or approvals are generated here.
const fs=require('node:fs');
function auditEastBranches(roads,review){
 const candidates=review.east_branch_review?.visible_candidates||[];
 const ids=new Set(roads.nodes.map(n=>n.id));
 const edges=roads.edges.filter(e=>ids.has(e.from)&&ids.has(e.to));
 const adj=new Map([...ids].map(id=>[id,new Set()]));
 for(const e of edges){adj.get(e.from).add(e.to);adj.get(e.to).add(e.from)}
 const tower='central-mill-09',east='central-mill-10';
 const towerNeighbors=[...(adj.get(tower)||[])].sort();
 const eastContinuation=edges.filter(e=>e.from==='central-mill-10'||e.to==='central-mill-10');
 const distinctMappedCandidates=candidates.filter(c=>c.approved===true&&c.draft_node_id&&ids.has(c.draft_node_id));
 return {status:'mapping-unresolved',candidate_count:candidates.length,
  candidate_ids:candidates.map(c=>c.id),tower_node:tower,tower_neighbors:towerNeighbors,
  eastward_draft_entry:east,eastward_entry_present:towerNeighbors.includes(east),
  eastward_entry_degree:adj.get(east)?.size||0,
  separately_mapped_eastern_candidates:distinctMappedCandidates.length,
  missing_candidate_mappings:candidates.filter(c=>!c.draft_node_id).map(c=>c.id),
  release_ready:false,edges_added:0,graph_modified:false};
}
module.exports={auditEastBranches};
if(require.main===module){const roads=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
 const review=JSON.parse(fs.readFileSync('docs/auditoria-bifurcaciones-torre-central.json','utf8'));
 console.log(JSON.stringify(auditEastBranches(roads,review),null,2));}
