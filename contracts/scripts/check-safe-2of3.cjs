"use strict";

// Read-only Base Mainnet preflight; never deploys, signs, or sends a transaction.
// Usage: BASE_RPC_URL=https://... SAFE_ADDRESS=0x... SAFE_OWNERS=0x...,0x...,0x... node contracts/scripts/check-safe-2of3.cjs
const { ethers } = require("ethers");

async function checkSafe({ provider, safeAddress, expectedOwners, expectedSingleton, expectedFallbackHandler }) {
  if (!ethers.isAddress(safeAddress)) throw new Error("Invalid SAFE_ADDRESS");
  if (expectedOwners.length !== 3 || expectedOwners.some(a => !ethers.isAddress(a))) {
    throw new Error("Exactly three valid SAFE_OWNERS required");
  }
  const normalized = expectedOwners.map(a => ethers.getAddress(a));
  if (new Set(normalized).size !== 3) throw new Error("Duplicate expected owner");
  if (!ethers.isAddress(expectedSingleton) || !ethers.isAddress(expectedFallbackHandler)) throw new Error("Expected singleton and fallback handler required");
  const network = await provider.getNetwork();
  if (network.chainId !== 8453n) throw new Error("Wrong chain: Base Mainnet (8453) required");
  if (await provider.getCode(safeAddress) === "0x") throw new Error("Safe address has no code");
  const safe = new ethers.Contract(safeAddress, [
    "function getThreshold() view returns (uint256)",
    "function getOwners() view returns (address[])",
    "function getModulesPaginated(address,uint256) view returns (address[],address)",
    "function getGuard() view returns (address)",
    "function getFallbackHandler() view returns (address)",
    "function VERSION() view returns (string)"
  ], provider);
  const [threshold, owners, version] = await Promise.all([
    safe.getThreshold(), safe.getOwners(), safe.VERSION()
  ]);
  if (threshold !== 2n || owners.length !== 3) throw new Error("Safe threshold/owner count mismatch");
  const actual = owners.map(a => ethers.getAddress(a)).sort();
  if (actual.join(",") !== [...normalized].sort().join(",")) throw new Error("Safe owner identities mismatch");
  // Safe 1.4.x exposes getStorageAt through compatibility handler in some deployments.
  // Modules can be checked with the official paginated API, and must be empty for this policy.
  const SENTINEL = "0x0000000000000000000000000000000000000001";
  const [modules, next] = await safe.getModulesPaginated(SENTINEL, 100);
  if (modules.length || ethers.getAddress(next) !== ethers.getAddress(SENTINEL)) {
    throw new Error("Unexpected enabled Safe module(s)");
  }
  if (!(version.startsWith("1.4.") || version.startsWith("1.5."))) throw new Error("Unexpected Safe version: " + version);
  const singletonWord = await provider.getStorage(safeAddress, 0n);
  const singleton = ethers.getAddress("0x" + singletonWord.slice(-40));
  if (singleton !== ethers.getAddress(expectedSingleton)) throw new Error("Safe singleton mismatch");
  if (await provider.getCode(singleton) === "0x") throw new Error("Singleton missing code");
  const guardSlot = ethers.keccak256(ethers.toUtf8Bytes("guard_manager.guard.address"));
  const fallbackSlot = ethers.keccak256(ethers.toUtf8Bytes("fallback_manager.handler.address"));
  const guard = ethers.getAddress("0x" + (await provider.getStorage(safeAddress, guardSlot)).slice(-40));
  const fallbackHandler = ethers.getAddress("0x" + (await provider.getStorage(safeAddress, fallbackSlot)).slice(-40));
  if (guard !== ethers.ZeroAddress) throw new Error("Unexpected Safe guard");
  if (fallbackHandler !== ethers.getAddress(expectedFallbackHandler)) throw new Error("Fallback handler mismatch");
  return { chainId: Number(network.chainId), safe: ethers.getAddress(safeAddress), version,
    threshold: Number(threshold), owners: actual, modules: [], singleton, guard, fallbackHandler };
}

async function main() {
  const { BASE_RPC_URL, SAFE_ADDRESS, SAFE_OWNERS, SAFE_SINGLETON, SAFE_FALLBACK_HANDLER } = process.env;
  if (!BASE_RPC_URL || !SAFE_ADDRESS || !SAFE_OWNERS || !SAFE_SINGLETON || !SAFE_FALLBACK_HANDLER) {
    throw new Error("Provide BASE_RPC_URL, SAFE_ADDRESS, SAFE_OWNERS, SAFE_SINGLETON, SAFE_FALLBACK_HANDLER");
  }
  const result = await checkSafe({
    provider: new ethers.JsonRpcProvider(BASE_RPC_URL),
    safeAddress: SAFE_ADDRESS,
    expectedOwners: SAFE_OWNERS.split(",").map(x => x.trim()),
    expectedSingleton: SAFE_SINGLETON,
    expectedFallbackHandler: SAFE_FALLBACK_HANDLER
  });
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.stdout.write("Read-only preflight passed; NOT an audit or deployment authorization.\n");
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exitCode = 1; });
module.exports = { checkSafe };
