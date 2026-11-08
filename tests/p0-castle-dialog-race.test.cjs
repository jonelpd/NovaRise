'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 for(const [start,end,operation] of [
  ['async function recruitFromCastle(site){','async function manageCastleGarrison(site){','reclutamiento'],
  ['async function manageCastleGarrison(site){','async function castleGarrisonMenu(site){','guarnición']
 ]){
  test(page+': '+operation+' revalidates ownership and garrison after prompts',()=>{
   const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
   assert(a>=0&&b>a);
   const body=html.slice(a,b);
   const prompt=body.lastIndexOf('await realmPrompt(');
   const guard=body.indexOf("verifiedSiteState()[site.id]!=='player'||siteGarrison(site.id)!==g");
   const mutation=operation==='reclutamiento'?body.indexOf('s.gold-=price'):body.indexOf('g.defenders[type]+=amount');
   assert(prompt>=0&&guard>prompt&&mutation>guard);
  });
 }
}
