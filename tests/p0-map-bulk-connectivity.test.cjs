'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {auditConnectivity}=require('../scripts/audit-bulk-road-connectivity.cjs');
const graph=JSON.parse(fs.readFileSync('docs/mapa-caminos-actualizados-grafo.json','utf8'));
test('latest full map remains disconnected and unapproved',()=>{
 const report=auditConnectivity(graph);
 assert.equal(report.node_count,606);
 assert.equal(report.edge_count,495);
 assert.equal(report.component_count,111);
 assert.equal(report.largest_component_nodes,21);
 assert.equal(report.fully_connected,false);
 assert.equal(report.approved,false);
});
test('simple connected sample is recognized without approval',()=>{
 const report=auditConnectivity({nodes:[{id:'a'},{id:'b'}],edges:[{from:'a',to:'b'}]});
 assert.equal(report.fully_connected,true);
 assert.equal(report.approved,false);
});
