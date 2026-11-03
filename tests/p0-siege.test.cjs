// Run: node --test tests/p0-siege.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

for (const page of ['index.html', 'combate-demo.html']) {
  for (const won of [true, false]) {
    test(page + ': defensive siege ' + (won ? 'victory' : 'defeat') + ' restores hero army', () => {
      const html = fs.readFileSync(path.join(__dirname, '..', 'juego', page), 'utf8');
      const start = html.indexOf('function finishDefensiveSiege(won){');
      const end = html.indexOf('function launchDefensiveSiege(site){', start);
      assert.ok(start >= 0 && end > start);
      const state = {soldiers:3,archers:1,griffins:0,dragons:0,turn:7,verifiedSites:{'fort-west':'player'}};
      const garrison = {defenders:{soldiers:6,archers:2,griffins:0,dragons:0}};
      const rival = {defeated:false,recovery:0,soldiers:12,archers:4};
      const battle = {defenseSiteId:'fort-west',heroArmyBefore:{soldiers:20,archers:5,griffins:1,dragons:0},defenseBefore:{soldiers:9,archers:3,griffins:0,dragons:0},defenseEnemyBefore:{soldiers:12,archers:4}};
      let messages = 0;
      const context = {
        battle, s:state,
        CASTLE_PROFILES:{'fort-west':{name:'Bastión del Bosque'}},
        CASTLE_RECRUIT_COST:{soldiers:30,archers:50,griffins:110,dragons:300},
        siteGarrison:()=>garrison, rivalState:()=>rival,
        verifiedSiteState:()=>state.verifiedSites,
        $:()=>({set hidden(value){assert.equal(value,true);}}),
        message:()=>{messages++;}, render:()=>{}
      };
      vm.createContext(context);
      vm.runInContext(html.slice(start,end),context);
      assert.equal(context.finishDefensiveSiege(won),true);
      assert.equal(state.soldiers,20);
      assert.equal(state.archers,5);
      assert.equal(state.griffins,1);
      assert.equal(garrison.defenders.soldiers,won?3:0);
      assert.equal(state.verifiedSites['fort-west'],won?'player':'rival');
      assert.equal(state.siegeHistory.length,1);
      assert.equal(messages,1);
      assert.equal(context.battle,null);
      assert.equal(context.finishDefensiveSiege(won),false,'Resolution must not run twice');
      assert.equal(state.siegeHistory.length,1,'History must not duplicate');
    });
  }
}
