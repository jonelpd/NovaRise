const test=require('node:test');
const assert=require('node:assert/strict');
const {decodeTerrain,preciseTerrainCell}=require('../server/nvra-precise-terrain.cjs');
test('real navigation mask decodes to 800 bytes without granting movement',()=>{
 assert.equal(decodeTerrain().length,800);
 let blocked=0,open=0;
 for(let y=0;y<80;y++)for(let x=0;x<80;x++){
  const r=preciseTerrainCell(x,y);
  if(r.reason==='blocked_terrain')blocked++;
  else {assert.deepEqual(r,{ok:true,requires_hostile_and_route_validation:true});open++}
 }
 assert.ok(blocked>0&&open>0);
});
test('rejects malformed masks, out of bounds and noninteger positions',()=>{
 for(const [x,y] of [[-1,0],[80,0],[0,80],[1.5,1],[NaN,1]])assert.equal(preciseTerrainCell(x,y).reason,'out_of_bounds');
 for(const bad of [{size:80,blocked:'AA=='},{size:80,blocked:'!'},{size:79,blocked:'AA=='},null])
  assert.equal(preciseTerrainCell(1,1,bad).reason,'invalid_navigation_mask');
});
