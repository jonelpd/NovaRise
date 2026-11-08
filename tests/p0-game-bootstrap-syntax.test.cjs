'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 test(page+': all classic inline scripts compile',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
  const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  assert(scripts.length>=5,'expected game scripts');
  for(const [index,script] of scripts.entries()){
   if(/type=["']module["']/.test(script[1]))continue;
   assert.doesNotThrow(()=>new vm.Script(script[2],{filename:page+'#script-'+index}), 'script '+index+' must parse');
  }
  assert.match(scripts[0][2],/function validGame\(g\)\{/);
  assert.doesNotMatch(scripts[0][2],/async\s+async\s+function/);
  assert.match(scripts[0][2],/rivalTurn\(\)\.catch\(error=>\{/,'rival AI errors must be handled');
 });
}
