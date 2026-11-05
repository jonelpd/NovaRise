"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { checkSafe } = require("../scripts/check-safe-3of5.cjs");

const A = ["0x0000000000000000000000000000000000000011","0x0000000000000000000000000000000000000012","0x0000000000000000000000000000000000000013","0x0000000000000000000000000000000000000014","0x0000000000000000000000000000000000000015"];
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
  await assert.rejects(checkSafe(args(fakeProvider(),[A[0],A[0],A[2],A[3],A[4]])),/Duplicate expected owner/);
});
test("preflight requires exactly five owners", async()=>{
  await assert.rejects(checkSafe(args(fakeProvider(),A.slice(0,4))),/Exactly five/);
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
