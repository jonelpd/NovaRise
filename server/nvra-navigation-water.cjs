'use strict';
// Mirror the game's water polygons and castle-access exception. Forests remain walkable.
const WATER_REGIONS=[
 [[19,57],[25,57],[31,59],[36,59],[39,57],[44,56],[46,59],[45,62],[49,63],[53,67],[59,70],[62,73],[61,76],[57,76],[52,73],[47,70],[42,69],[39,67],[34,68],[30,68],[25,66],[21,65],[18,62]],
 [[44,92],[46,89],[51,88],[56,89],[62,91],[65,94],[66,99],[43,99],[42,96]]
];


function effectiveNavigationMask(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length!==800)throw Error('invalid_navigation_mask');
 const out=Buffer.from(bytes);
 const inside=(px,py,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const [ax,ay]=poly[i],[bx,by]=poly[j];if((ay>py)!==(by>py)&&px<(bx-ax)*(py-ay)/(by-ay)+ax)hit=!hit;
 }return hit};
 const isWater=(x,y)=>WATER_REGIONS.some(p=>inside((x+.5)*1.25,(y+.5)*1.25,p));
 const set=(x,y,blocked)=>{const i=y*80+x;if(blocked)out[i>>3]|=128>>(i&7);else out[i>>3]&=~(128>>(i&7))};
 for(let y=1;y<79;y++)for(let x=1;x<79;x++)if(isWater(x,y))set(x,y,true);
 for(const [px,py] of [[11.8,12.1],[78.4,28.1],[46.3,77.3],[7.5,93]]){
  const cx=Math.floor(px*.8),cy=Math.floor(py*.8);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   const x=cx+dx,y=cy+dy;if(x<=0||y<=0||x>=79||y>=79||isWater(x,y))continue;
   set(x,y,false);
  }
 }
 return out;
}
module.exports={WATER_REGIONS,effectiveNavigationMask};
