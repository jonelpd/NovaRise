'use strict';
// Server-only read-only preflight. Does not mutate campaigns or authorize rewards.
const {validatePreciseRoute}=require('./nvra-precise-route.cjs');
function validateServerRoutePreflight(campaign,action,terrain){
 if(!campaign||typeof campaign!=='object'||campaign.status!=='active'||!Number.isSafeInteger(campaign.revision)||campaign.revision<1)return {ok:false,reason:'inactive_campaign'};
 if(!Number.isInteger(campaign.nav_x)||!Number.isInteger(campaign.nav_y)||campaign.nav_x<0||campaign.nav_x>79||campaign.nav_y<0||campaign.nav_y>79)return {ok:false,reason:'missing_authoritative_position'};
 if(!action||action.type!=='move'||!Number.isSafeInteger(action.expectedRevision)||action.expectedRevision!==campaign.revision)return {ok:false,reason:'stale_or_invalid_revision'};
 if(!Array.isArray(action.route)||action.route.length<2)return {ok:false,reason:'invalid_route'};
 const start=action.route[0];
 if(!start||start.x!==campaign.nav_x||start.y!==campaign.nav_y)return {ok:false,reason:'origin_mismatch'};
 const check=validatePreciseRoute(action.route,terrain);
 if(!check.ok)return check;
 if(!Number.isSafeInteger(campaign.moves)||campaign.moves<check.steps)return {ok:false,reason:'insufficient_moves'};
 return {ok:true,requires_authoritative_encounter_and_atomic_commit:true,steps:check.steps};
}
module.exports={validateServerRoutePreflight};
