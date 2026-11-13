const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(path.join(root,'juego/nvra-wallet-readonly.js'),'utf8');
const html=fs.readFileSync(path.join(root,'juego/index.html'),'utf8');
test('wallet viewer is loaded in game and only inside NVRA center',()=>{
 assert.match(html,/<script src="nvra-wallet-readonly\.js" defer><\/script>/);
 assert.match(js,/byId\('nvra-center'\)/);
 assert.match(js,/eth_requestAccounts/);
 assert.match(js,/eth_chainId/);
 assert.match(js,/eth_call/);
 assert.match(js,/0x70a08231/);
 assert.match(js,/0x2105/);
 assert.match(js,/0xa1128B1F4CB8394c179eb2558608a7302972EcBF/);
});
test('no transaction, signature, allowance, or automatic chain switching',()=>{
 for(const forbidden of ['eth_sendTransaction','eth_sign','personal_sign','eth_signTypedData','wallet_switchEthereumChain','wallet_addEthereumChain','0x095ea7b3','0x23b872dd']){
  assert.equal(js.includes(forbidden),false,'Unexpected privileged operation '+forbidden);
 }
 assert.match(js,/addEventListener\('click',connectWallet\)/);
 assert.match(js,/addEventListener\('click',readBalance\)/);
 assert.match(js,/addEventListener\('click',\(\)=>reset/);
});
