"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../assets/base-portal.js"), "utf8");
const tick = () => new Promise(resolve => setImmediate(resolve));
const address = "0x" + "a".repeat(40);
async function scenario({input=address,chain="0x2105",balance="0xde0b6b3a7640000",error=false}={}) {
  const ids = ["base-status","base-form","base-address","base-check","base-result","base-result-address","base-eth","base-connect"];
  const nodes = Object.fromEntries(ids.map(id => [id,{textContent:"",dataset:{},hidden:id==="base-result",disabled:false,value:"",listeners:{},addEventListener(t,cb){this.listeners[t]=cb;}}]));
  nodes["base-address"].value = input;
  const calls = [];
  const fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    calls.push(request.method);
    if (error) throw Error("offline");
    return {ok:true,json:async()=>({result:request.method==="eth_chainId"?chain:balance})};
  };
  vm.runInNewContext(source,{document:{documentElement:{lang:"es"},getElementById:id=>nodes[id]},window:{},fetch,AbortController,setTimeout,clearTimeout,BigInt});
  nodes["base-form"].listeners.submit({preventDefault(){}});
  for(let i=0;i<12&&nodes["base-check"].disabled;i++) await tick();
  return {nodes,calls};
}
(async()=>{
  let r=await scenario();assert.equal(r.nodes["base-result"].hidden,false);assert.equal(r.nodes["base-eth"].textContent,"1");assert.deepEqual(r.calls,["eth_chainId","eth_getBalance"]);
  r=await scenario({input:"invalid"});assert.equal(r.calls.length,0);assert.equal(r.nodes["base-result"].hidden,true);
  r=await scenario({chain:"0x1"});assert.equal(r.nodes["base-result"].hidden,true);assert.deepEqual(r.calls,["eth_chainId"]);
  r=await scenario({error:true});assert.equal(r.nodes["base-result"].hidden,true);
  r=await scenario({balance:"0x0"});assert.equal(r.nodes["base-eth"].textContent,"0");
  console.log("PASS: Base portal 5 mock scenarios");
})().catch(err=>{console.error(err);process.exitCode=1;});
