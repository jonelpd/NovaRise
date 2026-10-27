#!/usr/bin/env node
"use strict";
/**
 * Local-only deployment rehearsal. No RPC URLs, wallets, keys or testnet transactions.
 * Run with: npx hardhat run scripts/simulate-deployment.cjs --network hardhat
 */
const assert = require("node:assert/strict");
const { ethers, network } = require("hardhat");

async function main() {
  const chain = await ethers.provider.getNetwork();
  assert.equal(chain.chainId, 31337n, "Local Hardhat chain only");
  assert.equal(network.name, "hardhat", "Refusing to run outside local Hardhat network");
  const [deployer, treasury, recipient] = await ethers.getSigners();
  assert.notEqual(deployer.address, treasury.address, "Treasury must differ from deployer");
  const token = await ethers.deployContract("NVRAToken", [treasury.address]);
  await token.waitForDeployment();
  const supply = ethers.parseUnits("100000000", 18);
  assert.equal(await token.totalSupply(), supply);
  assert.equal(await token.MAX_SUPPLY(), supply);
  assert.equal(await token.balanceOf(treasury.address), supply);
  assert.equal(await token.balanceOf(deployer.address), 0n);
  assert.equal(await token.symbol(), "NVRA");
  const transferAmount = ethers.parseUnits("1", 18);
  await (await token.connect(treasury).transfer(recipient.address, transferAmount)).wait();
  assert.equal(await token.balanceOf(recipient.address), transferAmount);
  assert.equal(await token.totalSupply(), supply);
  console.log(JSON.stringify({
    mode: "LOCAL_SIMULATION_ONLY",
    chainId: Number(chain.chainId),
    tokenAddress: await token.getAddress(),
    treasuryAddress: treasury.address,
    recipientAddress: recipient.address,
    maxSupply: supply.toString(),
    transferTest: "PASS",
    warning: "Ephemeral Hardhat addresses. NOT a Polygon Amoy deployment or official NVRA contract."
  }, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
