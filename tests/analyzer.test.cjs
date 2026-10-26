const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const script=html.split('<script>')[1]?.split('</script>')[0];
assert.ok(script,'Debe existir script');
const nodes=new Map();
const handlers=new Map();
function node(tag='div'){
 return {tagName:tag,children:[],classList:{add(){},remove(){}},append(...items){this.children.push(...items)},replaceChildren(){this.children=[]},addEventListener(type,handler){handlers.set((this.id||'')+':'+type,handler)},set textContent(v){this.text=v},get textContent(){return this.text},value:'',disabled:false};
}
const context={document:{getElementById(id){if(!nodes.has(id)){const e=node();e.id=id;nodes.set(id,e)}return nodes.get(id)},createElement:node},console,Intl,Number,String,Array,Object,Date,RegExp,AbortController,setTimeout,clearTimeout,fetch:async()=>{throw Error('network disabled in unit tests')}};
vm.createContext(context);vm.runInContext(script,context);
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
assert.match(html,/drawHistoricalChart\(available,pricePlot,'close',true\)/);
assert.match(html,/showAverages&&metric==='close'/);
assert.match(html,/average.period===14\?'7 4':'none'/);
check('relativeStrengthIndex(Array.from({length:15},(_,i)=>({close:i+1})),14)',100);
check('relativeStrengthIndex(Array.from({length:15},(_,i)=>({close:15-i})),14)',0);
check('relativeStrengthIndex(Array.from({length:15},()=>({close:5})),14)',50);
check('relativeStrengthIndex([{close:1},{close:2}],14)',null);
assert.match(html,/https:\/\/api\.dexscreener\.com\/token-pairs\/v1\//);
assert.match(html,/https:\/\/api\.gopluslabs\.io\/api\/v1\/token_security\//);
assert.match(html,/aria-live="polite"/);
assert.match(html,/:focus-visible/);
assert.match(html,/prefers-reduced-motion/);
assert.match(html,/Comparar precio y volumen/);
assert.match(html,/Seleccionar día del histórico/);
assert.match(html,/Variación del precio en el periodo/);
assert.match(html,/history-inspector/);
assert.match(html,/days===1\?'24 horas'/);
assert.match(html,/historyPeriod===1\?'hour':'day'/);
assert.match(html,/historyPeriod===1\?24:historyPeriod/);
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
