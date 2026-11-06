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
      assert.equal(threshold, 2n, "Safe threshold must be 2");
      assert.equal(owners.length, 3, "Safe must have 3 owners");
      assert.equal(new Set(owners.map(x => x.toLowerCase())).size, 3, "Duplicate Safe owners");
      const expectedOwners = ["0x89316a3553Da9315a720e25915d731AfD11d0B16", "0xe697351daE40E770769B35852C1e05737015b6B7", "0x5927b6f05c4CdD16Cce6Cc429650c0b767137245"];
      assert.deepEqual(owners.map(x => x.toLowerCase()).sort(), expectedOwners.map(x => x.toLowerCase()).sort(), "Unexpected Safe owners");
      result.safe = { address: ethers.getAddress(address), threshold: 2, owners };
      result.safeNote = "Interface checks only; verify Safe proxy and singleton implementation independently";
    }
    console.log(JSON.stringify(result, null, 2));
  } finally {
    provider.destroy();
  }
}
main().catch(err => { console.error("Base mainnet readiness failed:", err.message); process.exitCode = 1; });
