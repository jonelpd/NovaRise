#!/usr/bin/env node
"use strict";
/**
 * Read-only Polygon Amoy readiness check.
 * No private keys, wallet connection, transaction submission or deployment.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const token = fs.readFileSync(path.join(root, "NVRAToken.sol"), "utf8");
const config = fs.readFileSync(path.join(root, "hardhat.config.cjs"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "amoy.manifest.json"), "utf8"));

assert.equal(manifest.network, "polygon-amoy");
assert.equal(manifest.chainId, 80002);
assert.equal(manifest.currency, "POL");
assert.equal(manifest.status, "PREPARATION_ONLY");
assert.equal(manifest.contractAddress, null);
assert.equal(manifest.treasuryAddress, null);
assert.equal(manifest.transactionHash, null);
assert.equal(manifest.deployed, false);
assert.equal(manifest.token.symbol, "NVRA");
assert.equal(manifest.token.decimals, 18);
assert.equal(manifest.token.maxSupply, "100000000");
assert.match(token, /_mint\(treasury,\s*MAX_SUPPLY\)/);
assert.match(config, /chainId:\s*31337/);
assert.doesNotMatch(config, /(?:privateKey|accounts:|rpcUrl|url:)/i);
console.log("Polygon Amoy readiness manifest: PASS (preparation only; no deployment)");
