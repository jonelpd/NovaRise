'use strict';
// Deterministic step-by-step movement along an approved route. No game-state writes.
const {createRoadGraph}=require('./map-road-graph.cjs');
const {validateRoadRelease}=require('./validate-map-road-release.cjs');
function createRoadWalker(roadData,from,to,{speed=0.08}={}){
 if(!Number.isFinite(speed)||speed<=0||speed>1)throw Error('Invalid normalized movement speed');
 const validation=validateRoadRelease(roadData,[from,to]);
 if(!validation.ready)throw Error('Road map is not approved: '+validation.errors.join('; '));
 const route=createRoadGraph(roadData.nodes,roadData.edges,{verifiedOnly:true}).route(from,to);
 if(!route)throw Error('No approved route');
 const points=route.nodes;
 let segment=0,x=points[0].x,y=points[0].y;
 function step(dt){
  if(!Number.isFinite(dt)||dt<0||dt>60)throw Error('Invalid elapsed time');
  let remaining=dt*speed;
  while(remaining>0&&segment<points.length-1){
   const next=points[segment+1],distance=Math.hypot(next.x-x,next.y-y);
   if(distance<=remaining+1e-12){x=next.x;y=next.y;remaining-=distance;segment++}
   else {const ratio=remaining/distance;x+=(next.x-x)*ratio;y+=(next.y-y)*ratio;remaining=0}
  }
  return position();
 }
 function position(){return {x,y,segment,done:segment>=points.length-1}}
 return {step,position,route:points.map(n=>({id:n.id,x:n.x,y:n.y}))};
}
module.exports={createRoadWalker};
