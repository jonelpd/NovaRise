'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const road=JSON.parse(fs.readFileSync(path.join(root,'juego/rutas-turquesa-160.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'juego/index.html'),'utf8');
const a=html.indexOf('const VERIFIED_MAP_SITES=['),b=html.indexOf('\n];',a)+3;
const sites=vm.runInNewContext(html.slice(a,b)+'\nVERIFIED_MAP_SITES');
test('turquoise mask has correct size and exact road-cell count',()=>{
 assert.equal(road.resolution,160);
 assert.equal(road.source,'mapa-rutas-marcadas(1).png');
 const bits=zlib.inflateSync(Buffer.from(road.compressed,'base64'));
 assert.equal(bits.length,3200);
 let total=0;
 for(const byte of bits)for(let shift=0;shift<8;shift++)total+=(byte>>shift)&1;
 assert.equal(total,road.road_cells);
 assert.equal(total,2404);
});
test('new map contains exactly the user-approved five groups',()=>{
 const count=kind=>sites.filter(s=>s.kind===kind).length;
 assert.equal(count('home')+count('rival')+count('fort'),7);
 assert.equal(count('mine'),10);
 assert.equal(count('mill'),1);
 assert.equal(count('relic'),15);
 assert.equal(count('recruit'),11);
 const ids=sites.map(s=>s.id);
 assert.equal(new Set(ids).size,44);
 for(const site of sites){
  assert.ok(site.x>=0&&site.x<=100&&site.y>=0&&site.y<=100,site.id);
  assert.ok(site.w>0&&site.h>0,site.id);
 }
});
test('the game loads turquoise routes and keeps old terrain only as fallback',()=>{
 assert.match(html,/fetch\('\.\/rutas-turquesa-160\.json'/);
 assert.match(html,/function turquoiseRoadRoute\(a,b\)/);
 assert.match(html,/const turquoise=turquoiseRoadRoute\(a,b\)/);
 assert.doesNotMatch(html,/fetch\('\.\.\/docs\/mapa-caminos-actualizados\.polyline'/);
});
