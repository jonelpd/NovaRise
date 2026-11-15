'use strict';
// Audit legacy map sites without guessing that old percentages match the new artwork.
const fs=require('node:fs');
function inventoryLegacySites(html){
 const start=html.indexOf('const VERIFIED_MAP_SITES=[');
 if(start<0)throw Error('Legacy map site declaration not found');
 const end=html.indexOf('];',start);
 if(end<0)throw Error('Legacy site declaration not terminated');
 const section=html.slice(start,end);
 const sites=[];
 const entries=section.match(/\{id:'[^']+'[^{}]*\}/g)||[];
 for(const entry of entries){
  const get=k=>{const m=entry.match(new RegExp('(?:^|[,\\s])'+k+':(?:\\x27([^\\x27]*)\\x27|(-?\\d+(?:\\.\\d+)?))'));return m?(m[1]??Number(m[2])):null};
  const site={id:get('id'),label:get('label'),kind:get('kind'),oldMapPercent:{x:get('x'),y:get('y')}};
  if(!site.id||!site.kind||!Number.isFinite(site.oldMapPercent.x)||!Number.isFinite(site.oldMapPercent.y))throw Error('Unparsed legacy site: '+entry);
  sites.push(site);
 }
 if(!sites.length)throw Error('No legacy sites parsed');
 return sites;
}
function auditMigrationSites(html,roads){
 const sites=inventoryLegacySites(html);
 const ids=new Set(roads.nodes.map(n=>n.id));
 return {schema_version:1,status:'manual-mapping-required',old_map:'mapa-grande.png',new_map:roads.map_asset,legacy_site_count:sites.length,road_node_count:roads.nodes.length,unmapped:sites.map(s=>({...s,targetRoadNode:null,targetMapPixel:null,verifiedOnOriginalImage:false,reason:'Legacy coordinates refer to different artwork; no direct coordinate reuse or automatic nearest-node matching permitted'})),candidate_mapping_count:0,ready:false,errors:ids.size!==roads.nodes.length?['Duplicate road node IDs']:[]};
}
module.exports={inventoryLegacySites,auditMigrationSites};
if(require.main===module){try{const html=fs.readFileSync(process.argv[2]||'juego/index.html','utf8'),roads=JSON.parse(fs.readFileSync(process.argv[3]||'docs/mapa-rutas-marcadas-tramo-central.json','utf8'));console.log(JSON.stringify(auditMigrationSites(html,roads),null,2))}catch(e){console.error(e.message);process.exitCode=2}}
