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
console.log('PASS: current Analytics 2.0 markup, PDF, provider hooks and calculation regressions');
