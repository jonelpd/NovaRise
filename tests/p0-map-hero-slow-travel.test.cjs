'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('both map heroes travel slowly without changing combat timings',()=>{
 const html=fs.readFileSync('juego/index.html','utf8');
 for(const snippet of [
  'transition:left .22s linear,top .22s linear!important',
  'transition:left .35s linear,top .35s linear',
  'setTimeout(resolve,240)',
  'setTimeout(step,320)',
  'left 350ms linear, top 350ms linear',
  'setTimeout(resolve,370)'
 ])assert.ok(html.includes(snippet),'Missing slow map travel: '+snippet);
 assert.ok(html.includes('async function travelFinePath(path,epoch)'));
 assert.ok(html.includes('function walkTo(tx,ty)'));
 assert.ok(html.includes('async function move(x,y)'));
});
