'use strict';
/** Server-side transition primitive. Only call with state loaded from a server-owned store.
 * This module is NOT exposed to the browser and does not award tokens or points.
 */
const MINES=Object.freeze({
 'mine-west':Object.freeze({x:18.5,y:46.5}),
 'mine-center':Object.freeze({x:45,y:36.3}),
 'mine-east':Object.freeze({x:90.6,y:77.5})
});
const MAX_INTERACTION_DISTANCE=8;
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
function captureMine(previous,action){
 if(!previous||typeof previous!=='object'||Array.isArray(previous))return {ok:false,reason:'missing_server_state'};
 if(!action||typeof action!=='object'||Array.isArray(action))return {ok:false,reason:'invalid_action'};
 if(action.type!=='capture_mine'||typeof action.site_id!=='string'||!own(MINES,action.site_id))return {ok:false,reason:'unknown_mine'};
 if(previous.status!=='active'||!Number.isSafeInteger(previous.revision)||previous.revision<1)return {ok:false,reason:'inactive_campaign'};
 if(!Number.isFinite(previous.hero_x)||!Number.isFinite(previous.hero_y)||previous.hero_x<0||previous.hero_x>100||previous.hero_y<0||previous.hero_y>100)return {ok:false,reason:'invalid_hero_position'};
 if(!Number.isSafeInteger(previous.moves)||previous.moves<1)return {ok:false,reason:'no_moves'};
 if(!Array.isArray(previous.owned_mines)||previous.owned_mines.some(id=>!own(MINES,id)))return {ok:false,reason:'invalid_server_mines'};
 if(previous.owned_mines.includes(action.site_id))return {ok:false,reason:'already_owned'};
 const site=MINES[action.site_id];
 if(Math.hypot(previous.hero_x-site.x,previous.hero_y-site.y)>MAX_INTERACTION_DISTANCE)return {ok:false,reason:'out_of_reach'};
 return {ok:true,next:{...previous,revision:previous.revision+1,moves:previous.moves-1,owned_mines:[...previous.owned_mines,action.site_id]},event:{event_type:'mine_capture',site_id:action.site_id,save_revision:previous.revision+1,points:0}};
}
module.exports={MINES,captureMine};
