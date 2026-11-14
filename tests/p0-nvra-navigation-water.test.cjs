const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {WATER_REGIONS,effectiveNavigationMask}=require('../server/nvra-navigation-water.cjs');
const {decodeTerrain}=require('../server/nvra-precise-terrain.cjs');
test('server water polygons match the browser game source',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
 const match=html.match(/const WATER_REGIONS=(\[[\s\S]*?\]);\s*function blockForests\(/);
 assert.ok(match,'water polygon definition');
 assert.deepEqual(WATER_REGIONS,JSON.parse(match[1]));
});
test('lake overlays are applied without changing original mask',()=>{
 const raw=decodeTerrain(),copy=Buffer.from(raw);
 const result=effectiveNavigationMask(raw);
 assert.deepEqual(raw,copy);
 assert.equal(result.length,800);
 let differences=0;for(let i=0;i<800;i++)if(result[i]!==raw[i])differences++;
 assert.ok(differences>0,'real map water and castle corrections must affect the mask');
 assert.throws(()=>effectiveNavigationMask(Buffer.alloc(4)),/invalid_navigation_mask/);
});
