'use strict';
// Independent navigation graph for a future original map.
// Coordinates are normalized (0..1) and must be traced against the final art.
function createRoadGraph(nodes,edges){
 const byId=new Map(),neighbors=new Map();
 for(const n of nodes){
  if(!n||typeof n.id!=='string'||!Number.isFinite(n.x)||!Number.isFinite(n.y)||n.x<0||n.x>1||n.y<0||n.y>1||byId.has(n.id))throw Error('Invalid or duplicate road node');
  byId.set(n.id,{...n});neighbors.set(n.id,[]);
 }
 for(const [a,b] of edges){
  if(!byId.has(a)||!byId.has(b)||a===b)throw Error('Invalid road edge');
  const p=byId.get(a),q=byId.get(b),cost=Math.hypot(p.x-q.x,p.y-q.y);
  neighbors.get(a).push({id:b,cost});neighbors.get(b).push({id:a,cost});
 }
 function route(from,to){
  if(!byId.has(from)||!byId.has(to))return null;
  const dist=new Map([[from,0]]),prev=new Map(),pending=new Set(byId.keys());
  while(pending.size){
   let u=null,best=Infinity;
   for(const id of pending){const d=dist.get(id)??Infinity;if(d<best){best=d;u=id}}
   if(u===null)break;
   pending.delete(u);if(u===to)break;
   for(const v of neighbors.get(u)){const alt=best+v.cost;if(alt<(dist.get(v.id)??Infinity)){dist.set(v.id,alt);prev.set(v.id,u)}}
  }
  if(!dist.has(to))return null;
  const path=[];for(let at=to;at!==undefined;at=prev.get(at))path.unshift(byId.get(at));
  return {nodes:path,distance:dist.get(to)};
 }
 return {route,nodes:byId};
}
module.exports={createRoadGraph};
