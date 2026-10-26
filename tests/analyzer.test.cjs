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
check('formatCount(null)','Sin datos');
check('usd(null)','Sin datos');
check('percentage("invalid")',null);
assert.match(html,/https:\/\/api\.dexscreener\.com\/token-pairs\/v1\//);
assert.match(html,/https:\/\/api\.gopluslabs\.io\/api\/v1\/token_security\//);
const captured=[];
vm.runInContext('appendMarket([{chainId:"ethereum",baseToken:{address:"0x1111111111111111111111111111111111111111",symbol:"A"},quoteToken:{address:"0x2222222222222222222222222222222222222222",symbol:"B"},liquidity:{usd:1000},volume:{h24:400},priceUsd:"2",priceChange:{h24:3}}],"0x2222222222222222222222222222222222222222","Ethereum")',context);
const report=nodes.get('report');
function allText(n){return [n.text||'',...(n.children||[]).flatMap(allText)].join(' ')}
assert.match(allText(report),/Sin datos/,'No atribuir el precio del activo base al secundario');
assert.match(allText(report),/Liquidez del par/);
console.log('Pruebas unitarias de conversiones y par DEX: OK');
