'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 for(const [name,next,notice] of [
  ['recruitFromCastle','// Tropas de guarnición independientes','reclutamiento'],
  ['manageCastleGarrison','async function castleGarrisonMenu','guarnición']
 ]){
  test(page+': '+name+' rejects changes during battle or rival turn after async prompt',()=>{
   const start=html.indexOf('async function '+name+'('),end=html.indexOf(next,start);
   assert.ok(start>=0&&end>start,'function missing');
   const src=html.slice(start,end);
   const prompt=src.lastIndexOf('await realmPrompt(');
   const guard=src.indexOf("if(rivalBusy||battle||s!==campaign||verifiedSiteState()[site.id]!=='player'||siteGarrison(site.id)!==g)");
   assert.ok(prompt>=0&&guard>prompt,'post-dialog lock missing');
   assert.match(src.slice(guard),new RegExp('Vuelve a abrir '+notice));
  });
 }
}
