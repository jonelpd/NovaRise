const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const script=html.split('<script>')[1]?.split('</script>')[0];
assert.ok(script,'Debe existir script');
const nodes=new Map();
function node(tag='div'){
 return {tagName:tag,children:[],classList:{add(){},remove(){}},append(...items){this.children.push(...items)},replaceChildren(){this.children=[]},addEventListener(){},set textContent(v){this.text=v},get textContent(){return this.text},value:'',disabled:false};
}
const context={document:{getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},createElement:node},console,Intl,Number,String,Array,Object,Date,RegExp,AbortController,setTimeout,clearTimeout,fetch:async()=>{throw Error('network disabled in unit tests')}};
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
console.log('10 comprobaciones de cálculos y fuentes: OK');
