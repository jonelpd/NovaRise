'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {assessMapSaveTransition}=require('../scripts/check-map-save-transition.cjs');
test('unapproved roads and missing save migration block switching map',()=>{
 const roads=JSON.parse(fs.readFileSync('docs/mapa-rutas-marcadas-tramo-central.json','utf8'));
 const save={x:3,y:4,turn:17,gold:200};
 const before=JSON.stringify(save);
 const result=assessMapSaveTransition({activeMap:'mapa-grande.png',targetMap:'mapa-rutas-marcadas.png',save,approvedRoads:roads});
 assert.equal(result.ready,false);
 assert.ok(result.errors.some(e=>e.includes('not approved')));
 assert.ok(result.errors.some(e=>e.includes('migration plan')));
 assert.equal(JSON.stringify(save),before);
});
test('even approved routes cannot bypass required backups and position/site mapping',()=>{
 const roads={status:'approved',edges:[{from:'a',to:'b',verified:true}]};
 const base={activeMap:'old.png',targetMap:'new.png',save:{x:0,y:0},approvedRoads:roads};
 assert.equal(assessMapSaveTransition({...base,migrationPlan:{from:'old.png',to:'new.png'}}).ready,false);
 const migrationPlan={from:'old.png',to:'new.png',preservesOriginalSave:true,backupVerified:true,positionMappingValidated:true,siteMappingValidated:true,rollbackValidated:true};
 assert.equal(assessMapSaveTransition({...base,migrationPlan}).ready,true);
});
