'use strict';
// Coarse grid guard from the actual Reinos de Leyenda map. NOT a replacement
// for nav-terrain.json precise path checks or combat / enemy collision rules.
const WATER=new Set(['3,3','3,4','4,4','1,3','6,2','6,3','2,7','8,6']);
const ROUGH=new Set(['0,2','0,3','2,3','2,4','3,5','4,5','5,5','6,4','6,5','8,7','9,7','8,8','9,8','6,9','7,9']);
function validateCoarseStep(state,action){
 if(!state||typeof state!=='object'||Array.isArray(state)||!action||action.type!=='move')return {ok:false,reason:'invalid_action'};
 if(state.status!=='active'||!Number.isSafeInteger(state.revision)||state.revision<1)return {ok:false,reason:'inactive_campaign'};
 if(!Number.isInteger(state.grid_x)||!Number.isInteger(state.grid_y)||state.grid_x<0||state.grid_x>9||state.grid_y<0||state.grid_y>9)return {ok:false,reason:'missing_server_grid_position'};
 const {x,y}=action;
 if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>9||y<0||y>9)return {ok:false,reason:'out_of_bounds'};
 if(Math.max(Math.abs(x-state.grid_x),Math.abs(y-state.grid_y))!==1)return {ok:false,reason:'not_adjacent'};
 const key=x+','+y;
 if(WATER.has(key))return {ok:false,reason:'water_blocked'};
 const cost=ROUGH.has(key)?2:1;
 if(!Number.isSafeInteger(state.moves)||state.moves<cost)return {ok:false,reason:'insufficient_moves'};
 // Deliberately returns only eligibility; no state update until precise map
 // route and hostile encounter validation are implemented on the server.
 return {ok:true,requires_precise_navigation:true,cost};
}
module.exports={WATER,ROUGH,validateCoarseStep};
