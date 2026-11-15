'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
test('itch.io inventory includes hashes and does not infer licenses',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'itchio-inventory-'));
 try{
  const assets=path.join(root,'assets');fs.mkdirSync(assets);
  fs.writeFileSync(path.join(assets,'sample.png'),Buffer.from([137,80,78,71]));
  const out=path.join(root,'report.json');
  cp.execFileSync(process.execPath,['scripts/inventory-itchio-assets.cjs',root,out]);
  const report=JSON.parse(fs.readFileSync(out,'utf8'));
  assert.equal(report.asset_count,1);
  assert.equal(report.assets[0].path,'assets/sample.png');
  assert.equal(report.assets[0].sha256.length,64);
  assert.equal(report.assets[0].license,null);
  assert.equal(report.assets[0].redistribution_approved,false);
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('itch.io workflow uploads license inventory report',()=>{
 const yaml=fs.readFileSync('.github/workflows/itchio-candidate.yml','utf8');
 assert.ok(yaml.includes('node scripts/inventory-itchio-assets.cjs'));
 assert.ok(yaml.includes('dist/itchio-assets-inventory.json'));
});
