"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { checkSafe } = require("../scripts/check-safe-2of3.cjs");

const A = ["0x0000000000000000000000000000000000000011","0x0000000000000000000000000000000000000012","0x0000000000000000000000000000000000000013"];
const safeAddress = "0x0000000000000000000000000000000000000020";
const expectedSingleton = "0x0000000000000000000000000000000000000030";
const expectedFallbackHandler = "0x0000000000000000000000000000000000000040";
function args(provider, owners=A) {
  return { provider, safeAddress, expectedOwners:owners, expectedSingleton, expectedFallbackHandler };
}
function fakeProvider(chainId=8453n, code="0x6000") {
  return { getNetwork:async()=>({chainId}), getCode:async()=>code };
}
test("preflight rejects duplicate expected Safe owners without RPC", async()=>{
  await assert.rejects(checkSafe(args(fakeProvider(),[A[0],A[0],A[2]])),/Duplicate expected owner/);
});
test("preflight requires exactly three owners", async()=>{
  await assert.rejects(checkSafe(args(fakeProvider(),A.slice(0,2))),/Exactly three/);
});
test("preflight rejects invalid Safe address", async()=>{
  await assert.rejects(checkSafe({...args(fakeProvider()),safeAddress:"not-an-address"}),/Invalid SAFE_ADDRESS/);
});
test("preflight rejects absent singleton or fallback allowlist", async()=>{
  await assert.rejects(checkSafe({...args(fakeProvider()),expectedSingleton:undefined}),/singleton and fallback handler required/);
  await assert.rejects(checkSafe({...args(fakeProvider()),expectedFallbackHandler:undefined}),/singleton and fallback handler required/);
});
test("preflight refuses non-Base chain", async()=>{
  await assert.rejects(checkSafe(args(fakeProvider(1n))),/Wrong chain/);
});
test("preflight refuses a controller address without code", async()=>{
  await assert.rejects(checkSafe(args(fakeProvider(8453n,"0x"))),/no code/);
});

const { ethers } = require("ethers");
const ABI = [
  "function getThreshold() view returns (uint256)",
  "function getOwners() view returns (address[])",
  "function getModulesPaginated(address,uint256) view returns (address[],address)",
  "function VERSION() view returns (string)"
];
const iface = new ethers.Interface(ABI);
const SENTINEL = "0x0000000000000000000000000000000000000001";
const guardSlot = ethers.keccak256(ethers.toUtf8Bytes("guard_manager.guard.address"));
const fallbackSlot = ethers.keccak256(ethers.toUtf8Bytes("fallback_manager.handler.address"));
const word = (a) => ethers.zeroPadValue(a,32);
function simulatedSafe(overrides={}) {
  const state = {chainId:8453n, threshold:2n, owners:A, version:"1.4.1",
    modules:[], next:SENTINEL, singleton:expectedSingleton, guard:ethers.ZeroAddress,
    fallback:expectedFallbackHandler, code:"0x6000", singletonCode:"0x6001", ...overrides};
  return {
    getNetwork:async()=>({chainId:state.chainId}),
    getCode:async(address)=> address.toLowerCase()===expectedSingleton.toLowerCase()?state.singletonCode:state.code,
    getStorage:async(_address,slot)=>{
      if (BigInt(slot)===0n) return word(state.singleton);
      if (slot===guardSlot) return word(state.guard);
      if (slot===fallbackSlot) return word(state.fallback);
      throw new Error("Unexpected storage slot");
    },
    call:async({data})=>{
      const parsed=iface.parseTransaction({data});
      if (!parsed) throw new Error("Unexpected call");
      const results={
        getThreshold:[state.threshold],getOwners:[state.owners],
        getModulesPaginated:[state.modules,state.next],VERSION:[state.version]
      };
      return iface.encodeFunctionResult(parsed.name,results[parsed.name]);
    }
  };
}
test("preflight accepts a matching simulated Safe 1.5.0 state",async()=>{
  const result=await checkSafe(args(simulatedSafe({version:"1.5.0"})));
  assert.equal(result.version,"1.5.0");
  assert.equal(result.threshold,2);
});
test("preflight accepts a matching simulated Safe state",async()=>{
  const result=await checkSafe(args(simulatedSafe()));
  assert.equal(result.threshold,2);
  assert.equal(result.singleton,expectedSingleton);
  assert.equal(result.fallbackHandler,expectedFallbackHandler);
});
for (const [name,mutation,pattern] of [
  ["threshold",{threshold:1n},/threshold\/owner count mismatch/],
  ["owner identity",{owners:[...A.slice(0,2),safeAddress]},/owner identities mismatch/],
  ["enabled module",{modules:[safeAddress]},/Unexpected enabled Safe module/],
  ["version",{version:"1.3.0"},/Unexpected Safe version/],
  ["singleton",{singleton:safeAddress},/Safe singleton mismatch/],
  ["missing singleton bytecode",{singletonCode:"0x"},/Singleton missing code/],
  ["guard",{guard:safeAddress},/Unexpected Safe guard/],
  ["fallback handler",{fallback:safeAddress},/Fallback handler mismatch/]
]) {
  test("preflight rejects unexpected "+name,async()=>{
    await assert.rejects(checkSafe(args(simulatedSafe(mutation))),pattern);
  });
}
