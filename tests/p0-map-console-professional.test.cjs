'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
const a=html.indexOf('<section class="realm-map-console"'),b=html.indexOf('</section></section><aside class="realm-sidebar"',a);
const panel=html.slice(a,b+10);
test('map console keeps gameplay buttons and their unique ids',()=>{
 assert(a>=0&&b>a);
 for(const id of ['end','save','reset']){assert.match(panel,new RegExp('id="'+id+'"'));assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1)}
});
test('legend and help are available in a collapsible guide',()=>{
 assert.match(panel,/<details class="realm-map-guide">/);
 for(const label of ['Héroe','Bosque','Montaña','Río','Fortaleza','Tesoro','Mina activa'])assert(panel.includes(label));
 assert.match(panel,/casilla contigua/);
});
test('campaign objective is compact and token marketing is removed from map console',()=>{
 assert.match(panel,/realm-map-console-objective/);
 assert.doesNotMatch(panel,/NVRA|Puedes ganar sin comprar|Tu héroe ·/);
 assert.match(html,/id="realm-map-console-professional"/);
});
