'use strict';
// Preflight for a future map switch. Never mutates or migrates a saved campaign.
function assessMapSaveTransition({activeMap,targetMap,save,approvedRoads,migrationPlan}){
 const errors=[];
 if(!activeMap||!targetMap)errors.push('Map identifiers required');
 if(!save||typeof save!=='object'||Array.isArray(save))errors.push('Save snapshot required');
 if(!approvedRoads||approvedRoads.status!=='approved'||!Array.isArray(approvedRoads.edges)||!approvedRoads.edges.length||!approvedRoads.edges.every(e=>e.verified===true))errors.push('Target road graph is not approved');
 if(activeMap!==targetMap){
  if(!migrationPlan||migrationPlan.from!==activeMap||migrationPlan.to!==targetMap)errors.push('Explicit map migration plan required');
  if(!migrationPlan||migrationPlan.preservesOriginalSave!==true||migrationPlan.backupVerified!==true)errors.push('Verified original-save backup required');
  if(!migrationPlan||migrationPlan.positionMappingValidated!==true||migrationPlan.siteMappingValidated!==true)errors.push('Hero positions and map sites must be mapped');
  if(!migrationPlan||migrationPlan.rollbackValidated!==true)errors.push('Rollback validation required');
 }
 return {ready:errors.length===0,errors};
}
module.exports={assessMapSaveTransition};
