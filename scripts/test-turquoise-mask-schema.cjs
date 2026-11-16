#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'juego/index.html'),'utf8');
const mask=JSON.parse(fs.readFileSync(path.join(root,'juego/rutas-turquesa-160.json'),'utf8'));
const match=html.match(/if\(data\.version!==([0-9]+)\|\|data\.resolution!==([0-9]+)\|\|data\.encoding!=='([^']+)'\)/);
assert.ok(match,'No se encuentra la validación de formato en el decodificador del juego');
assert.equal(mask.version,Number(match[1]),'La versión de la máscara no es compatible con el navegador');
assert.equal(mask.resolution,Number(match[2]),'La resolución de la máscara no es compatible');
assert.equal(mask.encoding,match[3],'La codificación de la máscara no es compatible');
const bytes=zlib.inflateSync(Buffer.from(mask.compressed,'base64'));
assert.equal(bytes.length,mask.resolution**2/8,'Longitud del bitset incorrecta');
const cells=[...bytes].reduce((sum,b)=>sum+b.toString(2).replace(/0/g,'').length,0);
assert.equal(cells,mask.road_cells,'El número de celdas no coincide con la máscara');
console.log('OK: esquema de máscara compatible con el decodificador, '+cells+' celdas transitables.');
