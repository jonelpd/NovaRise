#!/usr/bin/env node
"use strict";
// Read-only discovery only. Never signs, sends transactions, or deploys.
const { ethers } = require("ethers");
const SAFE = "0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd";
const EXPECTED = [
  "0x89316a3553Da9315a720e25915d731AfD11d0B16",
  "0xe697351daE40E770769B35852C1e05737015b6B7",
  "0x5927b6f05c4CdD16Cce6Cc429650c0b767137245"
];
const EXPECTED_FALLBACK = "0x3EfCBb83A4A7AfcB4F68D501E2c2203a38be77f4";
const SENTINEL = "0x0000000000000000000000000000000000000001";
const hash = (code) => code === "0x" ? null : ethers.keccak256(code);
const fromWord = (word) => ethers.getAddress("0x" + word.slice(-40));
async function main() {
  const url = process.env.BASE_MAINNET_RPC_URL;
  if (!url || !url.startsWith("https://")) throw Error("BASE_MAINNET_RPC_URL must be HTTPS");
  const provider = new ethers.JsonRpcProvider(url);
  try {
    const network = await provider.getNetwork();
    if (network.chainId !== 8453n) throw Error("Wrong chain: expected Base 8453");
    const block = await provider.getBlockNumber();
    const code = await provider.getCode(SAFE, block);
    if (code === "0x") throw Error("No Safe proxy code");
    const safe = new ethers.Contract(SAFE, [
      "function VERSION() view returns (string)",
      "function getThreshold() view returns (uint256)",
      "function getOwners() view returns (address[])",
      "function getModulesPaginated(address,uint256) view returns (address[],address)"
    ], provider);
    const [version, threshold, owners, moduleData, singletonWord, guardWord, fallbackWord] = await Promise.all([
      safe.VERSION({blockTag:block}),safe.getThreshold({blockTag:block}),safe.getOwners({blockTag:block}),
      safe.getModulesPaginated(SENTINEL,100,{blockTag:block}),
      provider.getStorage(SAFE,0n,block),
      provider.getStorage(SAFE,ethers.keccak256(ethers.toUtf8Bytes("guard_manager.guard.address")),block),
      provider.getStorage(SAFE,ethers.keccak256(ethers.toUtf8Bytes("fallback_manager.handler.address")),block)
    ]);
    const singleton=fromWord(singletonWord),guard=fromWord(guardWord),fallback=fromWord(fallbackWord);
    const [singletonCode,fallbackCode] = await Promise.all([
      provider.getCode(singleton,block),provider.getCode(fallback,block)
    ]);
    const result={
      mode:"READ_ONLY_DISCOVERY_NOT_ATTESTATION",chainId:Number(network.chainId),block,
      safe:SAFE,version,threshold:Number(threshold),owners,modules:moduleData[0],
      modulesNext:moduleData[1],singleton,guard,fallback,
      codehashes:{proxy:hash(code),singleton:hash(singletonCode),fallback:hash(fallbackCode)}
    };
    console.log(JSON.stringify(result,null,2));
    const actual=owners.map(x=>x.toLowerCase()).sort().join(",");
    const expected=EXPECTED.map(x=>x.toLowerCase()).sort().join(",");
    if (threshold!==2n || actual!==expected) throw Error("Safe threshold/owners mismatch");
    if (moduleData[0].length || moduleData[1].toLowerCase()!==SENTINEL.toLowerCase()) throw Error("Unexpected modules");
    if (guard!==ethers.ZeroAddress) throw Error("Unexpected guard");
    if (fallback.toLowerCase()!==EXPECTED_FALLBACK.toLowerCase()) throw Error("Unexpected fallback");
    if (!/^1\\.(4|5)\\./.test(version)) throw Error("Unexpected version");
    if (!hash(singletonCode) || !hash(fallbackCode)) throw Error("Missing singleton/fallback code");
    console.log("DISCOVERY_CHECKS_PASSED; independent bytecode reference comparison still required.");
  } finally { provider.destroy(); }
}
main().catch(e=>{console.error("SAFE_DISCOVERY_FAILED:",e.message);process.exitCode=1;});
