#!/usr/bin/env node
"use strict";
/**
 * Base mainnet read-only preflight. No signing, deployment or transactions.
 * Usage: BASE_MAINNET_RPC_URL=https://... npm run base:readiness
 * Optional: BASE_SAFE_ADDRESS=0x... to verify existing deployed Safe.
 */
const assert = require("node:assert/strict");
const { ethers } = require("ethers");
const SAFE_ABI = [
  "function getThreshold() view returns (uint256)",
  "function getOwners() view returns (address[])"
];
async function main() {
  const url = process.env.BASE_MAINNET_RPC_URL;
  assert.ok(url && /^https:\/\//.test(url), "Provide BASE_MAINNET_RPC_URL as HTTPS");
  const provider = new ethers.JsonRpcProvider(url, undefined, { staticNetwork: false });
  try {
    const chain = await provider.getNetwork();
    assert.equal(chain.chainId, 8453n, "Wrong network: Base mainnet chain ID must be 8453");
    const result = {
      mode: "READ_ONLY_NO_DEPLOYMENT",
      network: "base-mainnet",
      chainId: 8453,
      block: await provider.getBlockNumber(),
      tokenTargetSupply: "1000000",
      tokenStatus: "NOT_DEPLOYED_BY_THIS_SCRIPT",
      explorer: "https://basescan.org"
    };
    if (process.env.BASE_SAFE_ADDRESS) {
      const address = process.env.BASE_SAFE_ADDRESS;
      assert.ok(ethers.isAddress(address), "Invalid Safe address");
      assert.notEqual(await provider.getCode(address), "0x", "No contract at Safe address");
      const safe = new ethers.Contract(address, SAFE_ABI, provider);
      const [threshold, owners] = await Promise.all([safe.getThreshold(), safe.getOwners()]);
      assert.equal(threshold, 3n, "Safe threshold must be 3");
      assert.equal(owners.length, 5, "Safe must have 5 owners");
      assert.equal(new Set(owners.map(x => x.toLowerCase())).size, 5, "Duplicate Safe owners");
      result.safe = { address: ethers.getAddress(address), threshold: 3, owners };
      result.safeNote = "Interface checks only; verify Safe proxy and singleton implementation independently";
    }
    console.log(JSON.stringify(result, null, 2));
  } finally {
    provider.destroy();
  }
}
main().catch(err => { console.error("Base mainnet readiness failed:", err.message); process.exitCode = 1; });
