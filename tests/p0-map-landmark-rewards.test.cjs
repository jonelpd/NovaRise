const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
test('original map landmarks provide three distinct one-time rewards',()=>{
 for(const [id,reward] of [['relic-desert-well','experience'],['relic-north-cabin','soldiers'],['relic-east-ruin','gold']]){
  assert.ok(html.includes("id:'"+id+"'"));
  assert.ok(html.includes("reward:'"+reward+"'"));
 }
 assert.match(html,/if\(s\.landmarkRewards\[site\.id\]\)return message/);
 assert.match(html,/s\.landmarkRewards\[site\.id\]=true/);
 assert.match(html,/campaignGoldIncome\(100\)/);
 assert.match(html,/awardHeroExperience\(55\)/);
 assert.match(html,/s\.soldiers\+=3/);
});
