#!/usr/bin/env node
'use strict';
// Prueba de regresión sin navegador: ejecuta la función REAL del HTML
// bajo estados controlados; no replica su lógica en el test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../juego/index.html'),'utf8');
const start=html.indexOf('function fineRoute(a,b){');
const end=html.indexOf('function terrainFineRoute(',start);
assert.ok(start>=0&&end>start,'No se encuentra fineRoute en el juego');
const code=html.slice(start,end);
assert.match(code,/function fineRoute\(a,b\)/);
function run({navBlocked=true,tracedRoadLoading=false,turquoiseRoadMask=null,route=null}){
 let called=0;
 const context={
  navBlocked,tracedRoadLoading,turquoiseRoadMask,
  turquoiseRoadRoute(a,b){called++;assert.deepEqual(Array.from(a),[1,2]);assert.deepEqual(Array.from(b),[3,4]);return route},
  tracedRoadRoute(){throw Error('Fallback antiguo invocado')},
  terrainFineRoute(){throw Error('Fallback por terreno antiguo invocado')}
 };
 vm.runInNewContext(code,context,{timeout:1000});
 const value=context.fineRoute([1,2],[3,4]);
 return {value,called};
}
assert.deepEqual(run({navBlocked:false}),{value:null,called:0},'Sin navegación preparada');
assert.deepEqual(run({tracedRoadLoading:true,turquoiseRoadMask:new Uint8Array(1)}),{value:null,called:0},'Durante la carga');
assert.deepEqual(run({turquoiseRoadMask:null}),{value:null,called:0},'Error de descarga');
assert.deepEqual(run({turquoiseRoadMask:new Uint8Array(1),route:null}),{value:null,called:1},'Red desconectada');
const expected=[[1,2],[2,3],[3,4]];
const ok=run({turquoiseRoadMask:new Uint8Array(1),route:expected});
assert.deepEqual(ok.value,expected,'La ruta oficial sí se devuelve');
assert.equal(ok.called,1,'La ruta oficial se consulta una sola vez');
console.log('OK: 5 casos de navegación turquesa, sin fallback heredado.');
