const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {MINES,captureMine}=require('../server/nvra-authoritative-mines.cjs');
const state={status:'active',revision:3,hero_x:18.5,hero_y:46.5,moves:4,owned_mines:[]};
test('server transition captures known mine and never awards points or tokens',()=>{
 const r=captureMine(state,{type:'capture_mine',site_id:'mine-west'});
 assert.equal(r.ok,true);assert.equal(r.next.revision,4);assert.equal(r.next.moves,3);
 assert.deepEqual(r.next.owned_mines,['mine-west']);assert.equal(r.event.points,0);
 assert.deepEqual(state.owned_mines,[]);
 assert.equal(captureMine(r.next,{type:'capture_mine',site_id:'mine-west'}).reason,'already_owned');
});
test('rejects forged, distant, exhausted and malformed state transitions',()=>{
 assert.equal(captureMine(null,{type:'capture_mine',site_id:'mine-west'}).reason,'missing_server_state');
 assert.equal(captureMine(state,{type:'capture_mine',site_id:'fake-mine'}).reason,'unknown_mine');
 assert.equal(captureMine({...state,hero_x:90}, {type:'capture_mine',site_id:'mine-west'}).reason,'out_of_reach');
 assert.equal(captureMine({...state,moves:0}, {type:'capture_mine',site_id:'mine-west'}).reason,'no_moves');
 assert.equal(captureMine({...state,owned_mines:['fake-mine']},{type:'capture_mine',site_id:'mine-west'}).reason,'invalid_server_mines');
 assert.equal(captureMine({...state,status:'done'},{type:'capture_mine',site_id:'mine-west'}).reason,'inactive_campaign');
});
test('server mine catalog exactly matches real mine landmarks in game map',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
 const section=html.slice(html.indexOf('const VERIFIED_MAP_SITES=['),html.indexOf('function verifiedSiteState()'));
 const ids=[...section.matchAll(/\{id:'([^']+)'[^\n]*kind:'mine'/g)].map(x=>x[1]).sort();
 assert.deepEqual(ids,Object.keys(MINES).sort());
 for(const [id,site] of Object.entries(MINES)){
  const line=section.split('\n').find(x=>x.includes("id:'"+id+"'"));
  assert.ok(line&&line.includes('x:'+site.x)&&line.includes('y:'+site.y),id);
 }
});
test('server-only primitive is not loaded as a browser script',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../juego/index.html'),'utf8');
 assert.doesNotMatch(html,/nvra-authoritative-mines\.cjs/);
});
