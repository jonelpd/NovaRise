'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const start=html.indexOf('<style id="realm-map-height-alignment">');
const css=html.slice(start,html.indexOf('</style>',start));
test('desktop map receives a modest capped increase, not full sidebar stretch',()=>{
 assert(start>=0);
 assert.match(css,/@media\(min-width:901px\)/);
 assert.match(css,/height:min\(82vh,980px\);min-height:500px;max-height:980px/);
 assert.doesNotMatch(css,/flex:1 1 auto|align-self:stretch|max-height:none/);
});
test('mobile retains its original controlled viewport',()=>{
 assert.match(css,/@media\(max-width:900px\)/);
 assert.match(css,/height:68vh;min-height:380px/);
});
