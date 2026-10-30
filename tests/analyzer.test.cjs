const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const english=fs.readFileSync('en.html','utf8');
const sharedCss=fs.readFileSync('assets/site.css','utf8');
const whitepaperEs=fs.readFileSync('libro-blanco.html','utf8');
const whitepaperEn=fs.readFileSync('whitepaper-en.html','utf8');
assert.match(html,/href="libro-blanco\.html"/);
assert.match(english,/href="whitepaper-en\.html"/);
for(const [page,lang,other] of [[whitepaperEs,'es','whitepaper-en.html'],[whitepaperEn,'en','libro-blanco.html']]){
 assert.match(page,new RegExp('<html lang="'+lang+'">'));
 assert.match(page,/href="assets\/site\.css(?:\?[^"]*)?"/);
 assert.ok(page.includes('href="'+other+'"'),'Whitepaper language switch missing');
 assert.equal((page.match(/class="wp-section"/g)||[]).length,12);
 assert.match(page,/v2\.2/);
}
assert.match(whitepaperEs,/No existe un token NVRA desplegado en Base/);
assert.match(whitepaperEn,/No Base token has been deployed/);
assert.match(whitepaperEs,/100\.000\.000 NVRA/);
assert.match(whitepaperEn,/100,000,000(?:-token| test NVRA)/);
assert.match(whitepaperEs,/Polygon PoS/);
assert.match(whitepaperEn,/Polygon PoS/);
assert.match(whitepaperEs,/Amoy/);
assert.match(whitepaperEn,/Amoy/);
for(const page of [whitepaperEs,whitepaperEn]){
 assert.ok((page.match(/<tbody><tr>/g)||[]).length>=1);
 assert.ok((page.match(/<tr><td>/g)||[]).length>=5);
 assert.match(page,/wp-economics/);
}

assert.match(sharedCss,/\.wp-layout\{/);

assert.match(html,/href="assets\/site\.css(?:\?[^"]*)?"/);
assert.match(english,/href="assets\/site\.css(?:\?[^"]*)?"/);
assert.match(sharedCss,/@media\(max-width:780px\)/);
assert.doesNotMatch(html,/<style>/);
assert.doesNotMatch(english,/<style>/);
assert.match(html,/<html lang="es">/);
assert.match(english,/<html lang="en">/);
for(const page of [html,english]){
 assert.match(page,/<aside class="token-launch" aria-labelledby="token-launch-title">/);
 assert.ok(page.indexOf('class="token-launch"')<page.indexOf('id="inicio"'),'NVRA announcement should appear before hero');
 assert.match(page,/href="#nvr"/);
}
assert.match(html,/Sin lanzamiento|SIN LANZAMIENTO|sin lanzamiento|Sin token mainnet|SIN TOKEN MAINNET/);
assert.match(english,/No launch|NO LAUNCH|no launch|No mainnet token|NO MAINNET TOKEN/);
assert.match(sharedCss,/\.token-launch\{/);
for(const page of [html,english]){
 assert.match(page,/<section id="ecosistema" class="ecosystem-section"/);
 assert.match(page,/<section id="roadmap" class="roadmap-section"/);
 assert.match(page,/class="ecosystem-grid"/);
 assert.match(page,/class="roadmap-grid"/);
 assert.ok((page.match(/class="feature ecosystem-card"/g)||[]).length>=6);
 assert.ok((page.match(/class="roadmap-card"/g)||[]).length>=1);
 assert.ok(page.indexOf('id="ecosistema"')<page.indexOf('id="planes"'));
}
assert.match(html,/En estudio/);
assert.match(english,/Under consideration/);
assert.match(sharedCss,/\.ecosystem-grid\{/);
assert.match(sharedCss,/\.roadmap-grid\{/);


assert.match(html,/href="en\.html"/);
assert.match(english,/href="index\.html"/);
const script=fs.readFileSync('assets/analyzer.js','utf8');
const translations=fs.readFileSync('assets/locale-en.js','utf8');
for(const page of [html,english]){
 assert.match(page,/src="assets\/locale-en\.js(?:\?[^"]*)?"/);
 assert.match(page,/src="assets\/analyzer\.js(?:\?[^"]*)?"/);
 assert.doesNotMatch(page,/<script>/);
}
for(const name of ['historicalPoints','drawHistoricalChart','appendHistoricalChart','appendTechnicalIndicators','relativeStrengthIndex','simpleMovingAverage','appendMarketFromApi']){
 assert.ok(script.includes('function '+name+'('),'Shared analyzer missing '+name);
}
assert.match(translations,/Analyze live contract/);
assert.doesNotMatch(english,/Tools que explican|Analyzer of contratos|Experimental tool con datos/);
assert.match(english,/Tools that explain, not confuse/);
assert.match(english,/Contract analyzer/);
for(const phrase of ['Checking GoPlus','DEX markets · DexScreener','Featured DEX pairs','Incomplete']){
 assert.ok(translations.includes(phrase),'Missing English translation: '+phrase);
}

assert.match(translations,/Educational technical indicators/);

const nodes=new Map();
const handlers=new Map();
function node(tag='div'){
 return {tagName:tag,children:[],classList:{add(){},remove(){}},append(...items){this.children.push(...items)},replaceChildren(){this.children=[]},setAttribute(name,value){this[name]=value},addEventListener(type,handler){handlers.set((this.id||'')+':'+type,handler)},set textContent(v){this.text=v},get textContent(){return this.text},value:'',disabled:false};
}
const context={document:{getElementById(id){if(!nodes.has(id)){const e=node();e.id=id;nodes.set(id,e)}return nodes.get(id)},createElement:node},console,Intl,Number,String,Array,Object,Date,RegExp,AbortController,setTimeout,clearTimeout,fetch:async()=>{throw Error('network disabled in unit tests')}};
vm.createContext(context);vm.runInContext(translations,context);vm.runInContext(script,context);
function check(expression,expected){assert.equal(vm.runInContext(expression,context),expected,expression);}
check('percentage("0.125")',12.5);
check('percentage("1")',100);
check('percentage("1.01")',null);
check('percentage(null)',null);
check('safeNumber("")',null);
check('safeNumber("-1")',null);
check('safeNumber("100")',100);
check('safeNumber(false)',null);
check('safeNumber(true)',null);
check('safeNumber({})',null);
check('formatCount(null)','Sin datos');
check('usd(null)','Sin datos');
check('percentage("invalid")',null);
check('historicalPoints({data:{attributes:{ohlcv_list:[[1720000000,1,2,1,1.5,500],[1720086400,1,2,1,1.7,650]]}}}).length',2);
check('historicalPoints({data:{attributes:{ohlcv_list:[[1720000000,1,2,1,-1,100]]}}}).length',0);
check('historicalPoints({data:{attributes:{ohlcv_list:[[1720000000,1,2,1,1.5,500]]}}})[0].volume',500);
check('interpretHistory([{close:100,volume:100},{close:110,volume:120},{close:121,volume:140}]).change',21);
check('interpretHistory([{close:100,volume:100},{close:110,volume:120}])',null);
check('interpretHistory([{close:0,volume:100},{close:110,volume:120},{close:121,volume:140}])',null);
check('simpleMovingAverage([{close:2},{close:4},{close:6}],3)',4);
check('simpleMovingAverage([{close:2}],3)',null);
assert.match(script,/drawHistoricalChart\(available,pricePlot,'close',true\)/);
assert.match(script,/showAverages&&metric==='close'/);
assert.match(script,/average.period===14\?'7 4':'none'/);
check('relativeStrengthIndex(Array.from({length:15},(_,i)=>({close:i+1})),14)',100);
check('relativeStrengthIndex(Array.from({length:15},(_,i)=>({close:15-i})),14)',0);
check('relativeStrengthIndex(Array.from({length:15},()=>({close:5})),14)',50);
check('relativeStrengthIndex([{close:1},{close:2}],14)',null);
check('advancedHistorySignals([{close:10,volume:100},{close:12,volume:200},{close:9,volume:300}]).maxDrawdown',25);
check('advancedHistorySignals([{close:10,volume:100},{close:12,volume:null},{close:9,volume:300}]).volumeCoverage',200/3);
check('advancedHistorySignals([{close:0},{close:2},{close:3}])',null);
check('advancedHistorySignals([{close:2},{close:3}])',null);
assert.ok(script.includes('appendAdvancedHistoryInterpretation(available,box)'));
assert.ok(script.includes('appendDynamicHistoryNarrative(available,box)'));
assert.ok(script.includes('appendSupportResistanceInterpretation(available,box)'));
assert.match(translations,/Support, resistance and potential breakouts/);
assert.ok(script.includes('const available=points;'));
assert.match(script,/indicatorTitle\.id='report-indicators'/);
assert.match(script,/holdersTitle\.id='report-holders'/);
assert.match(script,/marketTitle\.id='report-markets'/);
assert.match(script,/report\.append\(guide\)/);
assert.ok(script.indexOf("report.append(indicatorTitle)")<script.indexOf("appendDashboard(token);"),'Security indicators must precede holder dashboard');

assert.ok(script.includes('const volumePoints=points.filter(p=>p.volume!==null);'));

context.levelSample=[10,9,8,9,11,13,12,11,12,14,13,12,13].map(close=>({close,volume:100}));
check('supportResistanceLevels(levelSample).support.price',11);
check('supportResistanceLevels(levelSample).resistance.price',13);
check('supportResistanceLevels(levelSample).breakout','none');
context.breakoutUp=[10,9,8,9,11,13,12,11,12,14,13,12,15].map(close=>({close,volume:100}));
check('supportResistanceLevels(breakoutUp).breakout','up');
context.breakoutDown=[10,9,8,9,11,13,12,11,12,14,13,12,7].map(close=>({close,volume:100}));
check('supportResistanceLevels(breakoutDown).breakout','down');
check('supportResistanceLevels([{close:1},{close:2}])',null);

assert.match(translations,/Data-driven chart assessment/);
const rising=Array.from({length:20},(_,i)=>({close:100+i*3,volume:100+i*10}));
const falling=Array.from({length:20},(_,i)=>({close:100-i*3,volume:300-i*10}));
const sideways=Array.from({length:20},(_,i)=>({close:100+(i%2)*.1,volume:100}));
context.rising=rising;context.falling=falling;context.sideways=sideways;
check('dynamicHistoryNarrative(rising).trend','up');
check('dynamicHistoryNarrative(rising).volume','rising');
check('dynamicHistoryNarrative(rising).confluence','aligned-up');
check('dynamicHistoryNarrative(falling).trend','down');
check('dynamicHistoryNarrative(falling).volume','falling');
check('dynamicHistoryNarrative(falling).confluence','aligned-down');
check('dynamicHistoryNarrative(sideways).trend','sideways');
check('dynamicHistoryNarrative(sideways).confluence','range');

assert.match(translations,/Expanded analysis: how to read the chart/);

assert.match(script,/https:\/\/api\.dexscreener\.com\/token-pairs\/v1\//);
assert.match(script,/https:\/\/api\.gopluslabs\.io\/api\/v1\/token_security\//);
assert.match(html,/aria-live="polite"/);
assert.match(sharedCss,/:focus-visible/);
assert.match(html,/<a class="skip-link" href="#contenido">Ir al contenido principal<\/a>/);
assert.match(english,/<a class="skip-link" href="#contenido">Skip to main content<\/a>/);
assert.match(html,/<main id="contenido">/);
assert.match(english,/<main id="contenido">/);
assert.match(sharedCss,/\.skip-link:focus\{transform:translateY\(0\)\}/);
assert.match(sharedCss,/@media\(max-width:480px\)/);
assert.match(sharedCss,/\.history-insights h6/);

assert.match(sharedCss,/prefers-reduced-motion/);
assert.match(script,/Comparar precio y volumen/);
assert.match(script,/Seleccionar día del histórico/);
assert.match(script,/Variación del precio en el periodo/);
assert.match(script,/history-inspector/);
assert.match(script,/days===1\?nvraText\('24 horas'\)/);
assert.match(script,/historyPeriod===1\?'hour':'day'/);
assert.match(script,/historyPeriod===1\?24:historyPeriod/);
const captured=[];
vm.runInContext('appendMarket([{chainId:"ethereum",baseToken:{address:"0x1111111111111111111111111111111111111111",symbol:"A"},quoteToken:{address:"0x2222222222222222222222222222222222222222",symbol:"B"},liquidity:{usd:1000},volume:{h24:400},priceUsd:"2",priceChange:{h24:3}}],"0x2222222222222222222222222222222222222222","Ethereum")',context);
const report=nodes.get('report');
function allText(n){return [n.text||'',...(n.children||[]).flatMap(allText)].join(' ')}
assert.match(allText(report),/Sin datos/,'No atribuir el precio del activo base al secundario');
assert.match(allText(report),/Liquidez del par/);
// Las solicitudes anteriores deben cancelarse al cambiar el formulario.
vm.runInContext('securityController={abort(){this.aborted=true}};marketController={abort(){this.aborted=true}}',context);
const securityBefore=vm.runInContext('securityController',context);
const marketBefore=vm.runInContext('marketController',context);
handlers.get('address:input')();
assert.equal(securityBefore.aborted,true,'La consulta GoPlus debe abortarse');
assert.equal(marketBefore.aborted,true,'La consulta DEX debe abortarse');
assert.equal(vm.runInContext('securityController',context),null);
assert.equal(vm.runInContext('marketController',context),null);
// Cambiar la dirección o la red debe borrar el informe anterior.
nodes.get('address').value='0x1111111111111111111111111111111111111111';
handlers.get('address:input')();
assert.equal(nodes.get('report').children.length,0,'El cambio de dirección limpia resultados');
assert.equal(nodes.get('analyze').disabled,false,'Permite nueva consulta');
vm.runInContext('showMessage("Informe anterior","Contrato anterior")',context);
handlers.get('network:change')();
assert.equal(nodes.get('report').children.length,0,'El cambio de red limpia resultados');
async function scenario(name,api,expected){
 nodes.get('address').value='0x1111111111111111111111111111111111111111';
 nodes.get('network').value='Ethereum';
 const calls=[];
 context.fetch=async url=>{
  calls.push(url);
  if(url.includes('gopluslabs.io')){
   if(api==='fail-security')throw Error('GoPlus offline');
   if(api==='empty-security')return {ok:true,json:async()=>({code:1,result:{}})};
   if(api==='uppercase-key')return {ok:true,json:async()=>({code:1,result:{['0x1111111111111111111111111111111111111111'.toUpperCase()]:{is_open_source:'1',is_honeypot:'0',holders:[]}}})};
   return {ok:true,json:async()=>({code:1,result:{'0x1111111111111111111111111111111111111111':{is_open_source:'1',is_honeypot:'0',holder_count:'12',holders:[]}}})};
  }
  if(api==='fail-market')throw Error('DexScreener offline');
  return {ok:true,json:async()=>[{chainId:'ethereum',baseToken:{address:'0x1111111111111111111111111111111111111111',symbol:'TEST'},quoteToken:{address:'0x2222222222222222222222222222222222222222',symbol:'USD'},liquidity:{usd:1000},volume:{h24:100},priceUsd:'1'}]};
 };
 await handlers.get('analyze:click')();
 const output=allText(nodes.get('report'));
 assert.match(output,expected,name);
 assert.equal(calls.length,2,name+' consulta ambas fuentes');
 assert.equal(nodes.get('analyze').disabled,false,name+' desbloquea botón');
}
(async()=>{
 await scenario('datos completos','ok',/Indicadores reales/);
 await scenario('datos completos repetidos','ok',/Indicadores reales/);
 await scenario('dirección devuelta en mayúsculas','uppercase-key',/Indicadores reales/);
 await scenario('sin cobertura GoPlus','empty-security',/Mercados DEX/);
 await scenario('GoPlus no disponible','fail-security',/Mercados DEX/);
 await scenario('DexScreener no disponible','fail-market',/Datos de mercado no disponibles/);
 console.log('Pruebas unitarias y 4 escenarios simulados: OK');
})().catch(error=>{console.error(error);process.exitCode=1;});
