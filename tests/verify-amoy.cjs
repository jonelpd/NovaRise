#!/usr/bin/env node
"use strict";
/** Read-only Amoy verification. No keys, signatures, transfers or deployments. */
const address = "0xCCC748d63333F9aF58f259CDF771d5AB1226e20D";
const treasury = "0x58f15EA8C1Fb2a783dB296d6F65020B4Ab8cBE77";
const endpoint = process.env.NVRA_AMOY_RPC || "https://polygon-amoy.drpc.org";
if (!/^https:\/\//.test(endpoint)) throw Error("RPC endpoint must use HTTPS");
const assert = require("node:assert/strict");
let id = 0;
async function rpc(method, params = []) {
  const requestId = ++id;
  let response;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await fetch(endpoint, {
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({jsonrpc:"2.0",id:requestId,method,params}),
        signal:AbortSignal.timeout(15000)
      });
      if (response.status === 429 || response.status >= 500) {
        throw Error("RPC HTTP " + response.status);
      }
      break;
    } catch (error) {
      const cause = error.cause;
      const detail = [error.message, cause?.code, cause?.message].filter(Boolean).join(" | ");
      console.error("RPC attempt " + attempt + "/3 (" + method + "): " + detail);
      if (attempt === 3) throw Error(method + " connection failed after 3 attempts: " + detail);
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  if (!response.ok) throw Error(method + " HTTP " + response.status);
  const body = await response.json();
  if (body.error || typeof body.result !== "string") throw Error(method + ": invalid RPC response");
  return body.result;
}
const encodeAddress = a => a.slice(2).toLowerCase().padStart(64,"0");
const decodeText = hex => {
  assert.match(hex,/^0x[0-9a-fA-F]+$/);
  const payload=hex.slice(2);
  if(payload.length===64) return Buffer.from(payload,"hex").toString("utf8").replace(/\0+$/g,"");
  if(payload.length>=128) {
    const offset=Number(BigInt("0x"+payload.slice(0,64)))*2;
    const length=Number(BigInt("0x"+payload.slice(offset,offset+64)));
    assert(length>=0 && length<=1024);
    return Buffer.from(payload.slice(offset+64,offset+64+length*2),"hex").toString("utf8");
  }
  throw Error("Invalid ERC20 text encoding");
};
function formatUnits(value, decimals) {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const base = 10n ** decimals;
  const whole = (absolute / base).toString();
  const fractional = (absolute % base).toString().padStart(Number(decimals), "0").replace(/0+$/, "");
  return (negative ? "-" : "") + whole + (fractional ? "." + fractional : "");
}
async function main(){
  console.log("Amoy RPC host:", new URL(endpoint).host, "(read-only)");
  const chain=await rpc("eth_chainId");
  assert.equal(BigInt(chain),80002n,"Unexpected chain ID");
  const code=await rpc("eth_getCode",[address,"latest"]);
  assert.match(code,/^0x[0-9a-fA-F]+$/);
  assert(code.length>2,"No contract code found");
  const call=async data=>rpc("eth_call",[{to:address,data},"latest"]);
  const decimals=BigInt(await call("0x313ce567"));
  assert.equal(decimals,18n,"Unexpected decimals");
  const symbol=decodeText(await call("0x95d89b41"));
  assert.equal(symbol,"NVRA","Unexpected symbol");
  const supply=BigInt(await call("0x18160ddd"));
  const balance=BigInt(await call("0x70a08231"+encodeAddress(treasury)));
  const supplyTokens=formatUnits(supply,decimals);
  const balanceTokens=formatUnits(balance,decimals);
  const expectedSupplyTokens="100000000";
  const matchesSourceSupply=supplyTokens===expectedSupplyTokens;
  const checksum=await crypto.subtle.digest("SHA-256",Buffer.from(code.slice(2),"hex"));
  const codeSha=Buffer.from(checksum).toString("hex");
  console.log(JSON.stringify({network:"polygon-amoy",chainId:Number(BigInt(chain)),contract:address,bytecodeBytes:(code.length-2)/2,bytecodeSha256:codeSha,decimals:Number(decimals),symbol,totalSupplyRaw:supply.toString(),totalSupplyTokens:supplyTokens,expectedSourceSupplyTokens:expectedSupplyTokens,treasury,treasuryBalanceRaw:balance.toString(),treasuryBalanceTokens:balanceTokens,supplyMatchesSource:matchesSourceSupply,sourceMatched:false,sourceMatchNote:"Source/compiler/bytecode comparison requires independent verified build artifacts"},null,2));
  if (!matchesSourceSupply) {
    console.error("WARNING: on-chain total supply differs from repository source expectation (100000000 NVRA); investigate before source verification.");
  }
}
main().catch(error=>{console.error("AMOY VERIFICATION FAILED:",error.message);process.exitCode=1});
