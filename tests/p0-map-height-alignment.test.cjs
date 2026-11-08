'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const css=html.slice(html.indexOf('<style id="realm-map-height-alignment">'),html.indexOf('</style>',html.indexOf('<style id="realm-map-height-alignment">')));
test('desktop map stretches with sidebar without clipping the viewport',()=>{
 assert.match(css,/@media\(min-width:901px\)/);
 assert.match(css,/\.layout>\.realm-sidebar\{align-self:stretch\}/);
 assert.match(css,/\.adventure-stage\{flex:1 1 auto/);
 assert.match(css,/#world-viewport\{flex:1 1 auto;height:auto;min-height:660px;max-height:none\}/);
});
test('mobile keeps a bounded scrollable map',()=>{
 assert.match(css,/@media\(max-width:900px\)/);
 assert.match(css,/#world-viewport\{height:68vh;min-height:380px\}/);
 assert.match(html,/#world-viewport\{height:min\(76vh,900px\)/);
});
