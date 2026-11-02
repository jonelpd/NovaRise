// Focused regression suite for the current NovaRise Analytics 2.0 site.
// Legacy tests/analyzer.test.cjs documents an older site and must not be used as a release gate.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const es=fs.readFileSync('index.html','utf8');
const en=fs.readFileSync('en.html','utf8');
const css=fs.readFileSync('assets/site.css','utf8');
const script=fs.readFileSync('assets/analyzer.js','utf8');
const translations=fs.readFileSync('assets/locale-en.js','utf8');
for(const [page,lang] of [[es,'es'],[en,'en']]){
 assert.match(page,new RegExp('<html lang="'+lang+'">'));
 assert.match(page,/id="report"/);
 assert.match(page,/id="analyze"/);
 assert.match(page,/id="report-tools"/);
 assert.match(page,/id="print-report"/);
 assert.match(page,/assets\/analyzer\.js/);
 assert.match(page,/assets\/locale-en\.js/);
}
assert.match(es,/Guardar como PDF/);
assert.match(en,/Save as PDF/);
assert.match(css,/@media print/);
assert.match(script,/printing-nvra-report/);
assert.match(script,/api\.gopluslabs\.io/);
assert.match(script,/api\.dexscreener\.com/);
const nodes=new Map(),handlers=new Map();
function node(tag='div'){
 return {tagName:tag,children:[],classList:{add(){},remove(){},contains(){return false}},append(...xs){this.children.push(...xs)},replaceChildren(){this.children=[]},setAttribute(k,v){this[k]=v},addEventListener(k,fn){handlers.set((this.id||'')+':'+k,fn)},set textContent(v){this.text=v},get textContent(){return this.text||''},value:'',disabled:false};
}
const context={document:{documentElement:{lang:'es'},getElementById(id){if(!nodes.has(id)){const e=node();e.id=id;nodes.set(id,e)}return nodes.get(id)},createElement:node},console,Intl,Number,String,Array,Object,Date,RegExp,AbortController,setTimeout,clearTimeout,fetch:async()=>{throw Error('network disabled in unit tests')}};
vm.createContext(context);
vm.runInContext(translations,context);
vm.runInContext(script,context);
function check(expr,expected){assert.equal(vm.runInContext(expr,context),expected,expr)}
check('safeNumber(null)',null);
check('safeNumber(false)',null);
check('safeNumber({})',null);
check('safeNumber("-1")',null);
check('safeNumber("100")',100);
check('percentage("0.125")',12.5);
check('percentage("1.01")',null);
check('formatCount(null)','Sin datos');
check('usd(null)','Sin datos');
check('historicalPoints({data:{attributes:{ohlcv_list:[[1720000000,1,2,1,1.5,500],[1720086400,1,2,1,1.7,650]]}}}).length',2);
check('historicalPoints({data:{attributes:{ohlcv_list:[[1720000000,1,2,1,-1,100]]}}}).length',0);
check('relativeStrengthIndex(Array.from({length:15},()=>({close:5})),14)',50);
check('simpleMovingAverage([{close:2},{close:4},{close:6}],3)',4);
check('interpretHistory([{close:100},{close:110}])',null);
assert.ok(handlers.has('analyze:click'),'Analyzer click handler must exist');
assert.ok(handlers.has('address:input'),'Input invalidation handler must exist');
assert.ok(handlers.has('network:change'),'Network invalidation handler must exist');

const noData=vm.runInContext('classifySecurityIndicators({})',context);
assert.equal(noData.known,0);
assert.equal(noData.alerts,0);
assert.equal(noData.unavailable,6);
assert.ok(noData.results.every(item=>item.state==='unknown'));
const allClear=vm.runInContext("classifySecurityIndicators({is_open_source:'1',is_honeypot:'0',is_mintable:0,is_blacklisted:'0',can_take_back_ownership:0,is_proxy:'0'})",context);
assert.equal(allClear.known,6);
assert.equal(allClear.alerts,0);
assert.equal(allClear.unavailable,0);
const flagged=vm.runInContext("classifySecurityIndicators({is_open_source:'0',is_honeypot:'1',is_mintable:'1',is_blacklisted:'1',can_take_back_ownership:'1',is_proxy:'1'})",context);
assert.equal(flagged.alerts,6);
assert.ok(flagged.results.every(item=>item.state==='alert'));
const mixed=vm.runInContext("classifySecurityIndicators({is_open_source:'1',is_honeypot:'1',is_mintable:'unexpected',is_blacklisted:null})",context);
assert.equal(mixed.known,2);
assert.equal(mixed.alerts,1);
assert.equal(mixed.unavailable,4);
assert.equal(mixed.results[2].state,'unknown');
assert.equal(mixed.results[3].state,'unknown');
assert.match(script,/No se calcula una puntuación de seguridad/);
assert.match(script,/“Sin alerta” no significa “seguro”/);


function evaluate(expression){return vm.runInContext(expression,context)}
function approx(actual,expected,tolerance=1e-8){assert.ok(Math.abs(actual-expected)<=tolerance,`Expected ${actual} ≈ ${expected}`)}
const sortedHistory=evaluate('historicalPoints({data:{attributes:{ohlcv_list:[[300,1,2,1,3,30],[100,1,2,1,1,10],[200,1,2,1,2,20],[200,1,2,1,2.5,25],[400,1,2,1,0,40],[500,1,2,1,-1,50]]}}})');
assert.deepEqual(Array.from(sortedHistory,p=>p.time),[100,200,300]);
assert.deepEqual(Array.from(sortedHistory,p=>p.close),[1,2.5,3]);
assert.equal(evaluate('historicalPoints({data:{attributes:{ohlcv_list:"invalid"}}}).length'),0);
assert.equal(evaluate('historicalPoints(null).length'),0);
const trends=evaluate('interpretHistory([{close:10,volume:100},{close:11,volume:100},{close:12,volume:200},{close:13,volume:200}])');
approx(trends.change,30);
approx(trends.volumeChange,100);
assert.equal(trends.observations,4);
assert.equal(evaluate('interpretHistory([{close:1},{close:0},{close:3}])'),null);
assert.equal(evaluate('interpretHistory([{close:1},{close:2}])'),null);
assert.equal(evaluate('simpleMovingAverage([{close:1},{close:2}],3)'),null);
assert.equal(evaluate('simpleMovingAverage([{close:1},{close:2},{close:3}],3)'),2);
assert.equal(evaluate('relativeStrengthIndex(Array.from({length:15},(_,i)=>({close:i+1})),14)'),100);
assert.equal(evaluate('relativeStrengthIndex(Array.from({length:15},(_,i)=>({close:15-i})),14)'),0);
assert.equal(evaluate('relativeStrengthIndex(Array.from({length:14},(_,i)=>({close:i+1})),14)'),null);
assert.equal(evaluate('relativeStrengthIndex(Array.from({length:15},()=>({close:5})),14)'),50);
assert.match(script,/No son datos agregados de todo el mercado/);
assert.match(script,/No implica un cambio de tendencia próximo/);


/* PDF/print behavior: no empty exports, and cleanup after print or print errors. */
function makePrintHarness(){
 const printNodes=new Map(),listeners=new Map(),classes=new Set();
 const makeNode=(id='')=>({id,textContent:'',value:'',disabled:false,children:[],classList:{contains(c){return id==='report'?classes.has(c):false},add(){},remove(){}},append(){},replaceChildren(){},setAttribute(){},addEventListener(type,handler){listeners.set(id+':'+type,handler)}});
 const bodyClasses=new Set();
 const body={classList:{add(c){bodyClasses.add(c)},remove(c){bodyClasses.delete(c)},contains(c){return bodyClasses.has(c)}}};
 const doc={documentElement:{lang:'es'},body,getElementById(id){if(!printNodes.has(id))printNodes.set(id,makeNode(id));return printNodes.get(id)},createElement(){return makeNode()}};
 let calls=0,shouldThrow=false;
 const win={addEventListener(type,handler){listeners.set('window:'+type,handler)},print(){calls++;if(shouldThrow)throw Error('print failed')}};
 const ctx={document:doc,window:win,console,Intl,Number,String,Array,Object,Date,RegExp,AbortController,setTimeout,clearTimeout,fetch:async()=>{throw Error('network disabled')}};
 vm.createContext(ctx);vm.runInContext(translations,ctx);vm.runInContext(script,ctx);
 return {classes,bodyClasses,nodes:printNodes,listeners,click(){listeners.get('print-report:click')()},afterprint(){listeners.get('window:afterprint')()},calls(){return calls},fail(){shouldThrow=true}};
}
const printHarness=makePrintHarness();
assert.ok(printHarness.listeners.has('print-report:click'));
assert.ok(printHarness.listeners.has('window:afterprint'));
printHarness.classes.add('hidden');
printHarness.nodes.get('report').textContent='Report';
printHarness.click();
assert.equal(printHarness.calls(),0,'Hidden reports must not be printed');
printHarness.classes.delete('hidden');
printHarness.nodes.get('report').textContent='  ';
printHarness.click();
assert.equal(printHarness.calls(),0,'Empty reports must not be printed');
printHarness.nodes.get('report').textContent='Security report with source data';
printHarness.click();
assert.equal(printHarness.calls(),1);
assert.ok(printHarness.bodyClasses.has('printing-nvra-report'));
printHarness.afterprint();
assert.ok(!printHarness.bodyClasses.has('printing-nvra-report'));
printHarness.fail();
assert.throws(()=>printHarness.click(),/print failed/);
assert.ok(!printHarness.bodyClasses.has('printing-nvra-report'));
assert.match(css,/@page\s*\{size:A4;margin:15mm\}/);
assert.match(css,/body\.printing-nvra-report #report/);
assert.match(css,/thead\{display:table-header-group\}/);
assert.match(css,/break-inside:avoid/);
assert.match(es,/id="print-report"/);
assert.match(en,/id="print-report"/);


// Missing security indicators must not be presented as an all-clear category.
assert.match(script,/missingCount===items\.length/);
assert.match(script,/No indicators available/);
assert.match(script,/Ningún indicador disponible/);
assert.match(script,/Missing data never counts as a positive result/);
assert.match(script,/Los campos ausentes no se consideran seguros/);
assert.match(script,/No fue posible obtener información de GoPlus/);
assert.match(script,/No es una auditoría ni asesoramiento financiero/);

// Missing pool volume must not be silently displayed as $0 in the chart inspector.
assert.match(script,/point\.volume===null\?nvraText\('Sin datos'\):usd\(point\.volume,0\)/);
assert.match(script,/Histórico no disponible temporalmente para este pool/);
assert.match(script,/Datos de mercado no disponibles en este momento/);
console.log('PASS: current Analytics 2.0 markup, PDF, provider hooks and calculation regressions');
