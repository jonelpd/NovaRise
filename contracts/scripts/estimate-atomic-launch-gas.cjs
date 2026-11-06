#!/usr/bin/env node
"use strict";
/**
 * Local gas measurement for the two NVRA factory transactions.
 * No wallet keys, Base RPC, testnet, or mainnet transactions.
 * Usage: npx hardhat run scripts/estimate-atomic-launch-gas.cjs --network hardhat
 */
const { ethers, network } = require("hardhat");
const assert = require("node:assert/strict");
const DAY = 24 * 60 * 60;
async function main() {
  assert.equal(network.name, "hardhat", "Local Hardhat only");
  assert.equal((await ethers.provider.getNetwork()).chainId, 31337n);
  const [deployer] = await ethers.getSigners();
  const safe = "0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd";
  const beneficiary = "0x89316a3553Da9315a720e25915d731AfD11d0B16";
  // The real Safe is already deployed on Base. Supply inert code only in this local simulation
  // to satisfy the factory's constructor code.length check. This does not simulate Safe behavior.
  await network.provider.send("hardhat_setCode", [safe, "0x60006000f3"]);
  const now = (await ethers.provider.getBlock("latest")).timestamp;
  const start = now + 120;
  const Factory = await ethers.getContractFactory("NVRAAtomicImmutableVestingFactoryDraft", deployer);
  const deployment = await Factory.deploy(safe, beneficiary, start, 365 * DAY, 1095 * DAY);
  const deployReceipt = await deployment.deploymentTransaction().wait();
  const factory = await deployment.getAddress();
  await network.provider.send("evm_setNextBlockTimestamp", [start]);
  const initialize = await deployment.initialize();
  const initializeReceipt = await initialize.wait();
  const token = await deployment.token();
  const vesting = await deployment.vesting();
  const tokenContract = await ethers.getContractAt("NVRAAtomicAllocationCandidate", token);
  assert.equal(await tokenContract.totalSupply(), ethers.parseEther("1000000"));
  assert.equal(await tokenContract.balanceOf(vesting), ethers.parseEther("150000"));
  const first = deployReceipt.gasUsed, second = initializeReceipt.gasUsed;
  const total = first + second;
  const buffer = total * 130n / 100n;
  console.log(JSON.stringify({
    mode: "LOCAL_GAS_MEASUREMENT_NOT_BASE_FEE_QUOTE",
    chainId: 31337, factory, token, vesting,
    deploymentGasUsed: first.toString(), initializationGasUsed: second.toString(),
    totalExecutionGasUsed: total.toString(), executionGasWith30PercentBuffer: buffer.toString(),
    exampleExecutionCostEthAt001Gwei: ethers.formatEther(buffer * ethers.parseUnits("0.01", "gwei")),
    caveats: [
      "Hardhat gas usage is indicative; mainnet conditions and L1 data fees may differ",
      "Does not include Base L1 data fees, wallet purchase fees, or exchange withdrawal fees",
      "The controller has inert local placeholder code, not the real Safe runtime",
      "No live deployment or signing took place"
    ]
  }, null, 2));
}
main().catch(e => { console.error(e); process.exitCode = 1; });
