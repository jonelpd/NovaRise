'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 test(page+': siege choice verifies campaign, epoch and castle owner after awaiting confirmation',()=>{
  const prompt=html.indexOf("const directDefense=await realmConfirm('🏰 ¡Castillo bajo ataque!'");
  assert(prompt>=0);
  const guard=html.indexOf("if(epoch===rivalEpoch&&s===siegeCampaign&&!s.done&&verifiedSiteState()[site.id]==='player')",prompt);
  const launch=html.indexOf('if(directDefense)launchDefensiveSiege(site)',prompt);
  const auto=html.indexOf('s.message=rivalCastleConquest(site.id)',launch);
  assert(guard>prompt&&launch>guard&&auto>launch);
  assert.match(html.slice(prompt-100,prompt),/const siegeCampaign=s;/);
 });
}
