'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const expected=['relic-north-mountain-dwelling','relic-north-wooden-hall','relic-east-mountain-shelter','relic-northeast-desert-cabin','relic-central-stone-arch','relic-west-lake-shelter','relic-south-lake-cottage','relic-southwest-forest-hut','relic-southeast-lava-site','relic-far-southeast-house'];
for(const page of ['index.html','combate-demo.html']){
 const html=fs.readFileSync(path.join(__dirname,'../juego',page),'utf8');
 const catalogStart=html.indexOf('const VERIFIED_MAP_SITES='),catalogEnd=html.indexOf('\n];',catalogStart)+3;
 const drawStart=html.indexOf('function drawWorldLandmarks(map){'),drawEnd=html.indexOf('\nfunction originalLandscape()',drawStart);
 assert.ok(catalogStart>=0&&catalogEnd>catalogStart&&drawStart>=0&&drawEnd>drawStart);
 test(page+': each of ten new sites creates a clickable map button at its coordinates',()=>{
  const clicks=[],buttons=[];
  const ctx={document:{createElement:()=>({style:{},classList:{add(){}},setAttribute(k,v){this[k]=v}})},interactVerifiedSite:site=>clicks.push(site.id)};
  vm.createContext(ctx);
  vm.runInContext(html.slice(catalogStart,catalogEnd)+'\n'+html.slice(drawStart,drawEnd),ctx);
  ctx.globalButtons=buttons;ctx.mapMock={dataset:{},appendChild:b=>buttons.push(b),addEventListener(type,handler,capture){this.clickHandler=handler;this.capture=capture},getBoundingClientRect:()=>({left:0,top:0,width:1000,height:1000})};vm.runInContext('drawWorldLandmarks(mapMock)',ctx);
  assert.equal(buttons.length,page==='index.html'?30:25,'all sites in this variant should create buttons');
  for(const id of expected){const site=vm.runInContext('VERIFIED_MAP_SITES.find(v=>v.id==='+JSON.stringify(id)+')',ctx);assert.ok(site,id);const b=buttons.find(b=>b.title===site.label);assert.ok(b,id+' button missing');assert.equal(b.style.left,site.x+'%');assert.equal(b.style.top,site.y+'%');assert.equal(typeof b.onclick,'function');b.onclick()}
  assert.deepEqual(clicks,expected);
  const target={closest:()=>null};const added=vm.runInContext('VERIFIED_MAP_SITES.find(v=>v.id==="relic-north-wooden-hall")',ctx);ctx.mapMock.clickHandler({target,clientX:added.x*10,clientY:added.y*10,preventDefault(){},stopImmediatePropagation(){}});assert.equal(clicks.at(-1),added.id,'click captured even when a map tile is the target');
 });
}
