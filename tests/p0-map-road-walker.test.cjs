'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createRoadWalker}=require('../scripts/map-road-walker.cjs');
const base={schema_version:2,coordinate_system:'normalized',status:'approved',map_asset:'map.png',map_sha256:'a'.repeat(64),nodes:[{id:'a',x:0,y:0},{id:'b',x:.3,y:0},{id:'c',x:.3,y:.4}],edges:[{from:'a',to:'b',verified:true},{from:'b',to:'c',verified:true}]};
test('walker follows bends at fixed speed and reaches destination',()=>{
 const walker=createRoadWalker(base,'a','c',{speed:.1});
 assert.deepEqual(walker.position(),{x:0,y:0,segment:0,done:false});
 let p=walker.step(2);assert.ok(Math.abs(p.x-.2)<1e-10);assert.equal(p.y,0);
 p=walker.step(2);assert.ok(Math.abs(p.x-.3)<1e-10);assert.ok(Math.abs(p.y-.1)<1e-10);
 p=walker.step(4);assert.deepEqual(p,{x:.3,y:.4,segment:2,done:true});
 assert.deepEqual(walker.step(2),p);
});
test('unapproved or disconnected roads cannot move heroes',()=>{
 assert.throws(()=>createRoadWalker({...base,status:'draft-unverified'},'a','c'),/not approved/);
 assert.throws(()=>createRoadWalker({...base,edges:[{from:'a',to:'b',verified:true}]},'a','c'),/No approved route/);
 assert.throws(()=>createRoadWalker({...base,edges:[{from:'a',to:'b',verified:false}]},'a','c'),/not approved/);
 assert.throws(()=>createRoadWalker(base,'a','c',{speed:0}),/speed/);
 assert.throws(()=>createRoadWalker(base,'a','c').step(-1),/elapsed/);
});
