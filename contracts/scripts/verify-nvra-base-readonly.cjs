#!/usr/bin/env node
'use strict';
// Read-only JSON-RPC verification. No wallet, signing, approvals or transactions.
const ADDRESS='0xa1128B1F4CB8394c179eb2558608a7302972EcBF';
const RPC=process.env.BASE_MAINNET_RPC_URL||'https://mainnet.base.org';
const TARGET=1000000n*10n**18n;
let id=0;
async function rpc(method,params=[]){
 const response=await fetch(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:++id,method,params}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('RPC HTTP '+response.status);
 const json=await response.json();
 if(json.error)throw Error('RPC '+method+': '+json.error.message);
 if(typeof json.result!=='string')throw Error('Malformed RPC response for '+method);
 return json.result;
}
function decodeString(hex){
 if(!/^0x[0-9a-f]*$/i.test(hex))throw Error('Invalid ABI hex');
 const data=hex.slice(2);
 if(data.length===64)return Buffer.from(data,'hex').toString('utf8').replace(/\0+$/,'');
 if(data.length<128)throw Error('Short dynamic ABI string');
 const offset=Number(BigInt('0x'+data.slice(0,64)))*2;
 const length=Number(BigInt('0x'+data.slice(offset,offset+64)));
 if(!Number.isSafeInteger(length)||length>512||offset+64+length*2>data.length)throw Error('Invalid ABI string bounds');
 return Buffer.from(data.slice(offset+64,offset+64+length*2),'hex').toString('utf8');
}
async function main(){
 if(!/^https:\/\//.test(RPC))throw Error('RPC must use HTTPS');
 const chain=await rpc('eth_chainId');
 if(BigInt(chain)!==8453n)throw Error('Wrong chain: expected Base 8453, got '+chain);
 const code=await rpc('eth_getCode',[ADDRESS,'latest']);
 if(!/^0x[0-9a-f]+$/i.test(code)||code==='0x')throw Error('No contract bytecode at documented address');
 const selectors={name:'0x06fdde03',symbol:'0x95d89b41',decimals:'0x313ce567',totalSupply:'0x18160ddd'};
 const values={};
 for(const [key,data] of Object.entries(selectors)){
  const raw=await rpc('eth_call',[{to:ADDRESS,data},'latest']);
  values[key]=key==='name'||key==='symbol'?decodeString(raw):BigInt(raw).toString();
 }
 const checks={name:values.name==='NovaRise Utility Token',symbol:values.symbol==='NVRA',decimals:values.decimals==='18',supply:BigInt(values.totalSupply)===TARGET};
 console.log(JSON.stringify({mode:'READ_ONLY',chainId:8453,address:ADDRESS,bytecodeBytes:(code.length-2)/2,values,checks},null,2));
 if(Object.values(checks).some(v=>!v))throw Error('Token metadata/supply mismatch: manual review required');
 console.log('Metadata checks passed. NOT a contract security audit.');
}
main().catch(e=>{console.error('NVRA verification incomplete:',e.message);process.exitCode=1});
