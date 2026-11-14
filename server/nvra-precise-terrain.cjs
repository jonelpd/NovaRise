'use strict';
// Read-only precise terrain gate. This is not proof of legitimate movement.
const terrain=require('../juego/nav-terrain.json');
function decodeTerrain(data=terrain){
 if(!data||data.size!==80||typeof data.blocked!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(data.blocked))throw Error('invalid_navigation_mask');
 const bytes=Buffer.from(data.blocked,'base64');
 if(bytes.length!==800||bytes.toString('base64')!==data.blocked)throw Error('invalid_navigation_mask');
 return bytes;
}
function preciseTerrainCell(x,y,data=terrain){
 if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=80||y<0||y>=80)return {ok:false,reason:'out_of_bounds'};
 let bytes;
 try{bytes=decodeTerrain(data)}catch{return {ok:false,reason:'invalid_navigation_mask'}}
 const i=y*80+x;
 return (bytes[i>>3]&(128>>(i&7)))?{ok:false,reason:'blocked_terrain'}:{ok:true,requires_hostile_and_route_validation:true};
}
module.exports={decodeTerrain,preciseTerrainCell};
