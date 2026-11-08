'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const sidebar=html.slice(html.indexOf('<aside class="realm-sidebar"'),html.indexOf('</aside>',html.indexOf('<aside class="realm-sidebar"'))+8);
test('sidebar retains every gameplay and backup control id',()=>{
 for(const id of ['realm-player-name','realm-set-nickname','turn','moves','gold','army','strength','experience','soldier','archer','buildings','market','forge','barracks','faction','griffin','dragon','creatures','mine-select','mines','crystals','miners','yield','hire-miner','mine-upgrade','crystal-trade','mine-detail','autosave-status','nickname','profile-save','export-save','import-save','import-file','season-points','claim-reward','log']){
  assert.match(sidebar,new RegExp('id="'+id+'"'),'Missing sidebar control: '+id);
 }
});
test('sidebar removes conceptual NVRA price catalog and redundant explanations',()=>{
 assert.doesNotMatch(sidebar,/Catálogo NVRA conceptual|Fénix · 20 NVRA|Titán · 30 NVRA|Perfil local \(sin cuenta online\)/);
 assert.match(sidebar,/realm-sidebar-professional|realm-sidebar/);
 assert.match(sidebar,/<details class="realm-section"/);
});
