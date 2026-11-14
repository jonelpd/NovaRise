'use strict';
// A read-only terrain-only path precheck. Never authorizes campaign actions.
const {decodeTerrain}=require('./nvra-precise-terrain.cjs');
function validatePreciseRoute(route,data){
 if(!Array.isArray(route)||route.length<2||route.length>6400)return {ok:false,reason:'invalid_route'};
 let bytes;
 try{bytes=decodeTerrain(data)}catch{return {ok:false,reason:'invalid_navigation_mask'}};
 const clear=(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<80&&y>=0&&y<80&&!(bytes[(y*80+x)>>3]&(128>>((y*80+x)&7)));
 for(let i=0;i<route.length;i++){
  const p=route[i];
  if(!p||typeof p!=='object'||!clear(p.x,p.y))return {ok:false,reason:'blocked_or_invalid_cell',index:i};
  if(i===0)continue;
  const prev=route[i-1],dx=Math.abs(p.x-prev.x),dy=Math.abs(p.y-prev.y);
  if(Math.max(dx,dy)!==1)return {ok:false,reason:'non_adjacent_step',index:i};
  // Diagonal corners cannot be used to slip between two blocked cells.
  if(dx===1&&dy===1&&!clear(prev.x,p.y)&&!clear(p.x,prev.y))
   return {ok:false,reason:'blocked_diagonal_corner',index:i};
 }
 return {ok:true,requires_server_state_and_encounter_validation:true,steps:route.length-1};
}
module.exports={validatePreciseRoute};
