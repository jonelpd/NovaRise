#!/usr/bin/env node
'use strict';
// Verify copied assets in a generated itch.io package against the canonical NovaRise sources.
// Does not approve or activate draft routes.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function sha(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}
function verify(root='.',packageDir='dist/itchio'){
 const source=path.resolve(root),out=path.resolve(packageDir),errors=[];
 const files=[
  ['juego/mapa-rutas-marcadas.png','mapa-rutas-marcadas.png'],
  ['docs/mapa-rutas-marcadas-tramo-central.json','mapa-rutas-marcadas-tramo-central.json']
 ];
 let manifest;
 try{manifest=JSON.parse(fs.readFileSync(path.join(out,'shared-map-hashes.json'),'utf8'))}
 catch(e){errors.push('Missing or invalid shared-map-hashes.json');return {ok:false,errors}}
 if(manifest.status!=='draft-not-active')errors.push('Unexpected shared map activation status');
 for(const [relative,target] of files){
  const a=path.join(source,relative),b=path.join(out,target);
  if(!fs.existsSync(a)||!fs.existsSync(b)){errors.push('Missing shared map asset: '+relative);continue}
  const original=sha(a),copied=sha(b);
  if(original!==copied)errors.push('NovaRise / itch.io mismatch: '+relative);
  if(manifest.files?.[relative]!==original)errors.push('Manifest SHA mismatch: '+relative);
 }
 return {ok:errors.length===0,errors};
}
if(require.main===module){const result=verify(process.argv[2]||'.',process.argv[3]||'dist/itchio');console.log(JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1}
module.exports={verify};
