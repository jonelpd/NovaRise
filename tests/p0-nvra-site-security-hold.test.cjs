const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'juego/index.html'),'utf8');
const wallet=fs.readFileSync(path.join(root,'juego/nvra-wallet-readonly.js'),'utf8');
test('MetaMask security hold is visible and wallet module is not loaded',()=>{
 assert.match(html,/Conexión de monedero: suspendida temporalmente/);
 assert.doesNotMatch(html,/<script\b[^>]*src=["'][^"']*nvra-wallet-readonly\.js/);
 assert.doesNotMatch(html,/eth_requestAccounts|eth_sendTransaction|wallet_requestPermissions/);
});
test('wallet module remains read-only if restored after independent clearance',()=>{
 assert.match(wallet,/eth_requestAccounts/);
 assert.match(wallet,/eth_call/);
 for(const operation of ['eth_sendTransaction','eth_sign','personal_sign','wallet_switchEthereumChain','wallet_addEthereumChain']){
  assert.equal(wallet.includes(operation),false,operation+' must not be present');
 }
});
test('game contains no remote script tag; document known dynamic imports',()=>{
 const tags=[...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map(x=>x[1]);
 assert.deepEqual(tags,[]);
 assert.match(html,/https:\/\/esm\.sh\/@supabase\/supabase-js@2\.57\.0/);
 assert.match(html,/https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.169\.0/);
});

test('Pages publishes an explicit public allowlist and omits wallet script',()=>{
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/pages.yml'),'utf8');
 assert.match(workflow,/cp -- \*\.html \*\.atom robots\.txt sitemap\.xml _site\//);
 assert.match(workflow,/cp -R assets juego _site\//);
 assert.match(workflow,/rm -f _site\/juego\/nvra-wallet-readonly\.js/);
 assert.match(workflow,/path: _site/);
 assert.doesNotMatch(workflow,/path: \.(?:\r?\n|$)/);
});

test('Pages deployment smoke-checks public routes and suspended wallet exclusion',()=>{
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/pages.yml'),'utf8');
 assert.match(workflow,/Verificar HTML público y detectar rutas obsoletas/);
 assert.match(workflow,/juego\/index\.html/);
 assert.match(workflow,/juego\/nvra-wallet-readonly\.js/);
 assert.match(workflow,/docs\/plan-maestro-reinos-de-leyenda\.md/);
 assert.match(workflow,/root_code.*200/);
 assert.match(workflow,/wallet_code.*404/);
 assert.match(workflow,/docs_code.*404/);
 assert.match(workflow,/Conexión de monedero: suspendida temporalmente/);
});
