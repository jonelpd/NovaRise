'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const filename of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',filename),'utf8');
 test(filename+' rejects route initiation while rival turn is active',()=>{
  const match=html.match(/function walkTo\(tx,ty\)\{\s*if\(([^\n]+)\)return;/);
  assert(match,'walkTo guard missing');assert.match(match[1],/rivalBusy/);
 });
 test(filename+' prevents direct move while rival turn is active',()=>{
  assert.match(html,/async function move\(x,y\)\{if\(rivalBusy\|\|s\.done\|\|battle/);
 });
 test(filename+' guards reset before and after async confirmation',()=>{
  const start=html.indexOf("$('reset').onclick=async()=>"),end=html.indexOf(";$('attack').onclick",start);
  assert(start>=0&&end>start);
  const reset=html.slice(start,end);
  assert.match(reset,/if\(rivalBusy\|\|walking\|\|battle\)return/);
  assert.match(reset,/if\(!STORE\)return/);
  assert.match(reset,/const resetStore=STORE,resetState=s,resetSnapshot=JSON\.stringify\(s\)/);
  assert.match(reset,/STORE!==resetStore\|\|s!==resetState\|\|JSON\.stringify\(s\)!==resetSnapshot/);
  assert.match(reset,/localStorage\.removeItem\(resetStore\);start\(\)/);
 });
}
