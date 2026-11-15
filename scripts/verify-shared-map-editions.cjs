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
 if(manifest.active_status!=='turquoise-map-active')errors.push('Missing active turquoise map status');
 const activeFiles=[
  ['juego/mapa-reinos-2048.jpg','mapa-reinos-2048.jpg'],
  ['juego/rutas-turquesa-160.json','rutas-turquesa-160.json']
 ];
 for(const [relative,target] of activeFiles){
  const original=path.join(source,relative),copied=path.join(out,target);
  if(!fs.existsSync(original)||!fs.existsSync(copied)){errors.push('Missing active game asset: '+relative);continue}
  const hash=sha(original);
  if(hash!==sha(copied))errors.push('Active NovaRise / itch.io mismatch: '+relative);
  if(manifest.active_files?.[relative]!==hash)errors.push('Active map manifest SHA mismatch: '+relative);
 }
 const game=path.join(source,'juego/index.html'),itch=path.join(out,'index.html');
 if(!fs.existsSync(game)||!fs.existsSync(itch))errors.push('Missing game entrypoint');
 else{
  const expected=fs.readFileSync(game,'utf8'),actual=fs.readFileSync(itch,'utf8');
  for(const required of ["fetch('./rutas-turquesa-160.json'","function turquoiseRoadRoute(a,b)","const VERIFIED_MAP_SITES=["]){
   if(!expected.includes(required)||!actual.includes(required))errors.push('Active map gameplay missing from edition: '+required);
  }
 }

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
