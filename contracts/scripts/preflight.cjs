#!/usr/bin/env node
"use strict";
// Dependency-free structural checks. NOT a Solidity compiler or security audit.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const token = read("NVRAToken.sol");
const imports = read("src/PrototypeImports.sol");
const config = read("hardhat.config.cjs");
const packageJson = JSON.parse(read("package.json"));
const ci = read("../.github/workflows/nvra-contract.yml");
const tokenTests = read("test/NVRAToken.test.cjs");
const vestingTests = read("test/TreasuryVesting.test.cjs");

assert.match(token, /contract\s+NVRAToken\s+is\s+ERC20/);
assert.match(token, /MAX_SUPPLY\s*=\s*100_000_000\s*\*\s*10\s*\*\*\s*18/);
assert.match(token, /require\(treasury\s*!=\s*address\(0\)/);
assert.match(token, /_mint\(treasury,\s*MAX_SUPPLY\)/);
assert.doesNotMatch(token, /function\s+(?:mint|upgradeTo|pause|blacklist)\s*\(/);
assert.match(imports, /import\s+\{NVRAToken\}\s+from\s+"\.\.\/NVRAToken\.sol"/);
assert.match(imports, /import\s+\{VestingWallet\}/);
assert.match(config, /sources:\s*"\.\/src"/);
assert.match(config, /chainId:\s*31337/);
assert.match(config, /chainId:\s*8453/);
assert.match(config, /accounts:\s*\[\]/);
assert.doesNotMatch(config, /(?:privateKey|mnemonic|process\\.env\\.[A-Z_]*PRIVATE_KEY)/i);
assert.equal(packageJson.scripts.test, "hardhat test");
assert.equal(packageJson.scripts.compile, "hardhat compile");
assert.match(ci, /npm run compile/);
assert.match(ci, /npm test/);
assert.match(tokenTests, /rejects the zero treasury address/);
assert.match(vestingTests, /releases them gradually/);
console.log("NVRA structural preflight: PASS (not compilation, execution or audit)");
