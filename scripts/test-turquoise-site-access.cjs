#!/usr/bin/env node
'use strict';
// Ejecuta siteAccessPoint real, extraída del HTML, con máscaras sintéticas.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const begin=html.indexOf('function siteAccessPoint(site,heroPoint){');
const end=html.indexOf('function interactVerifiedSite(',begin);
assert.ok(begin>=0&&end>begin,'No se encontró siteAccessPoint');
const source=html.slice(begin,end);
function check({roads,hero=[20,20],site=[30,20],loaded=true}){
 const mask=new Uint8Array(160*160),components=new Int32Array(160*160).fill(-1);
 const sizes=[];
 for(const [x,y,id] of roads){
  mask[y*160+x]=1;components[y*160+x]=id;sizes[id]=(sizes[id]||0)+1;
 }
 const context={
  turquoiseRoadMask:loaded?mask:null,
  turquoiseComponents:loaded?components:null,
  turquoiseComponentSizes:sizes,
  turquoiseCell:(x,y)=>[Math.floor(x),Math.floor(y)],
  turquoiseFree:(x,y)=>x>=0&&x<160&&y>=0&&y<160&&mask[y*160+x]===1,
  nearestTurquoise:()=>loaded?hero:null
 };
 vm.runInNewContext(source,context,{timeout:1000});
 const result=context.siteAccessPoint({x:site[0],y:site[1]},hero);
 return result?Array.from(result):null;
}
const main=[[20,20,0],[21,20,0],[22,20,0]];
assert.deepEqual(check({roads:main,site:[23,20]}),[(22.5)*.625,(20.5)*.625],'Acceso en la misma red');
assert.equal(check({roads:main,site:[40,20]}),null,'Prohibir accesos a más de 14 celdas');
assert.deepEqual(check({roads:[...main,[30,20,1],[31,20,1]],site:[30,20]}),[(22.5)*.625,(20.5)*.625],'No cruzar componentes aunque la otra esté más cerca');
assert.equal(check({roads:[[20,20,0]],site:[21,20]}),null,'No aceptar componentes aisladas de una celda');
assert.equal(check({roads:main,loaded:false}),null,'Bloquear cuando no se carga la máscara');
assert.equal(check({roads:main,site:[37,20]}),null,'Radio euclídeo estricto de 14 celdas');
console.log('OK: 6 pruebas de entrada de edificios; misma red, radio máximo y fallos de carga.');
