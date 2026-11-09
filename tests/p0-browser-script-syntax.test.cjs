'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {spawnSync}=require('node:child_process');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
 test(page+': inline browser scripts have valid JavaScript syntax',()=>{
  assert.ok(scripts.length>0,'no scripts found');
  for(const [i,m] of scripts.entries()){
   const attrs=m[1],code=m[2];if(/\bsrc\s*=/.test(attrs)||!code.trim())continue;
   if(/\btype\s*=\s*["']module["']/i.test(attrs)){
    const result=spawnSync(process.execPath,['--check','--input-type=module'],{input:code,encoding:'utf8'});
    assert.equal(result.status,0,'module script '+i+': '+result.stderr);
   }else{
    assert.doesNotThrow(()=>new vm.Script(code,{filename:page+':script-'+i}));
   }
  }
 });
}
