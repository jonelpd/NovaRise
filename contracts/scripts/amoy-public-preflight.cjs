#!/usr/bin/env node
"use strict";
/**
 * READ-ONLY Polygon Amoy preflight. Never signs, sends or deploys transactions.
 * Usage: AMOY_RPC_URL=https://... node scripts/amoy-public-preflight.cjs
 * Optional: AMOY_TEST_DEPLOYER=0x... AMOY_SAFE_OWNERS=0x...,0x...,0x...,0x...,0x...
 */
const { ethers } = require("ethers");
const assert = require("node:assert/strict");

async function main() {
  const url = process.env.AMOY_RPC_URL;
  assert.ok(url && /^https:\/\//.test(url), "AMOY_RPC_URL must be an HTTPS RPC endpoint");
  const provider = new ethers.JsonRpcProvider(url, 80002, { staticNetwork: false });
  try {
    const network = await provider.getNetwork();
    assert.equal(network.chainId, 80002n, "Refusing non-Amoy chain");
    const height = await provider.getBlockNumber();
    const result = { mode: "READ_ONLY", network: "polygon-amoy", chainId: Number(network.chainId), blockNumber: height, explorer: "https://amoy.polygonscan.com", readiness: "RPC_CONNECTED_ONLY" };
    const deployer = process.env.AMOY_TEST_DEPLOYER;
    if (deployer) {
      assert.ok(ethers.isAddress(deployer), "Invalid test deployer address");
      result.testDeployer = ethers.getAddress(deployer);
      result.testPolBalance = ethers.formatEther(await provider.getBalance(deployer));
    }
    const owners = process.env.AMOY_SAFE_OWNERS;
    if (owners) {
      const list = owners.split(",").map(x => x.trim());
      assert.equal(list.length, 5, "Exactly five test Safe owners required");
      assert.ok(list.every(ethers.isAddress), "Invalid Safe owner address");
      assert.equal(new Set(list.map(x => x.toLowerCase())).size, 5, "Safe owners must be distinct");
      result.safeOwners = list.map(ethers.getAddress);
      result.safeThreshold = 3;
    }
    console.log(JSON.stringify(result, null, 2));
  } finally {
    provider.destroy();
  }
}
main().catch(err => { console.error("Amoy read-only preflight failed:", err.message); process.exitCode = 1; });
