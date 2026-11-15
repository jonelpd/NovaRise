'use strict';
/** Server-side transition primitive. Only call with state loaded from a server-owned store.
 * This module is NOT exposed to the browser and does not award tokens or points.
 */
const MINES=Object.freeze({
 'mine-mina-cueva-oeste':Object.freeze({x:9.65,y:24.16}),
 'mine-west':Object.freeze({x:9.65,y:35.96}),
 'mine-center':Object.freeze({x:36.04,y:45.69}),
 'mine-mina-cueva-norte':Object.freeze({x:62.92,y:5.74}),
 'mine-mina-cueva-noreste':Object.freeze({x:71.69,y:18.98}),
 'mine-east':Object.freeze({x:92.19,y:18.1}),
 'mine-mina-nieve-este':Object.freeze({x:92.11,y:30.94}),
 'mine-mina-sur-este':Object.freeze({x:89.95,y:65.95}),
 'mine-mina-cueva-sur':Object.freeze({x:69.94,y:72.57}),
 'mine-mina-suroeste':Object.freeze({x:5.34,y:82.7})
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
