'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 for(const [start,end,name] of [
  ['async function recruitFromCastle(site){','async function manageCastleGarrison(site){','recruitment'],
  ['async function manageCastleGarrison(site){','async function castleGarrisonMenu(site){','garrison']
 ]){
  test(page+': '+name+' cancels stale campaign after dialogs',()=>{
   const a=html.indexOf(start),b=html.indexOf(end,a+start.length);
   assert(a>=0&&b>a);
   const code=html.slice(a,b);
   const snapshot=code.indexOf('const campaign=s;');
   const prompt=code.lastIndexOf('await realmPrompt(');
   const check=code.indexOf("if(rivalBusy||battle||s!==campaign||verifiedSiteState()[site.id]!=='player'||siteGarrison(site.id)!==g)");
   const mutation=name==='recruitment'?code.indexOf('s.gold-=price'):code.indexOf('g.defenders[type]+=amount');
   assert(snapshot>=0&&snapshot<prompt&&check>prompt&&mutation>check);
  });
 }
}
