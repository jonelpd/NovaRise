const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {WATER,ROUGH,validateCoarseStep}=require('../server/nvra-authoritative-movement.cjs');
const state={status:'active',revision:1,grid_x:1,grid_y:1,moves:4};
test('grid guard accepts only plausible steps but does not authorize a move',()=>{
 assert.deepEqual(validateCoarseStep(state,{type:'move',x:2,y:1}),{ok:true,requires_precise_navigation:true,cost:1});
 assert.equal(validateCoarseStep(state,{type:'move',x:4,y:1}).reason,'not_adjacent');
 assert.equal(validateCoarseStep(state,{type:'move',x:-1,y:1}).reason,'out_of_bounds');
 assert.equal(validateCoarseStep({...state,grid_x:2,grid_y:3},{type:'move',x:3,y:3}).reason,'water_blocked');
 assert.equal(validateCoarseStep({...state,grid_x:1,grid_y:2,moves:1},{type:'move',x:0,y:2}).reason,'insufficient_moves');
 assert.equal(validateCoarseStep({...state,grid_x:undefined},{type:'move',x:2,y:1}).reason,'missing_server_grid_position');
});
test('coarse terrain catalogs agree with the real browser game',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
 const source=(name)=>{const m=html.match(new RegExp('(?:const )?'+name+'=(?:new Set\\(\\[|\\[)([^\\]]+)\\]'));assert.ok(m,name);return [...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]).sort()};
 assert.deepEqual([...WATER].sort(),source('water'));
 assert.deepEqual([...ROUGH].sort(),source('TERRAIN_ROUGH'));
});
