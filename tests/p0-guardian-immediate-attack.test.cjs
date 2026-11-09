'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': guardian attacks reachable stack before chasing a distant target',()=>{
  const start=html.indexOf('function enemyAdvance(onComplete)'),end=html.indexOf('function ',start+10);
  assert.ok(start>=0&&end>start);
  const body=html.slice(start,end);
  const match=body.match(/options\.sort\((\(a,b\)=>[^;]+)\);/);
  assert.ok(match,'missing tactical comparator');
  const compare=vm.runInNewContext(match[1]);
  const immediate={d:0,priority:-10,target:{type:'soldiers'}};
  const distant={d:3,priority:20,target:{type:'archers'}};
  const immediateOther={d:0,priority:5,target:{type:'griffins'}};
  const ordered=[distant,immediate,immediateOther].sort(compare);
  assert.equal(ordered[0],immediateOther);
  assert.equal(ordered[1],immediate);
  assert.equal(ordered[2],distant);
 });
}
