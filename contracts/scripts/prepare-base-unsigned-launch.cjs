#!/usr/bin/env node
"use strict";
/**
 * Prepare UNSIGNED Base Mainnet deployment payloads. No RPC calls, wallet or secrets.
 * Usage: node scripts/prepare-base-unsigned-launch.cjs <deployer_eoa_address> [start_unix_seconds]
 * The deployer EOA must sign both transactions. Tx 2 'to' is unknown until tx 1 is mined.
 * DO NOT broadcast automatically or treat the payload as audited.
 */
const fs = require("node:fs");
const path = require("node:path");
const { ethers } = require("ethers");
const SAFE = "0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd";
const BENEFICIARY = "0x89316a3553Da9315a720e25915d731AfD11d0B16";
const DAY = 86400;
const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/src/NVRAAtomicImmutableVestingFactoryDraft.sol/NVRAAtomicImmutableVestingFactoryDraft.json"), "utf8"));
const [deployerArg, startArg = "1793923200"] = process.argv.slice(2);
// Fixed earliest date: 2026-11-06 00:00 UTC, already elapsed. Vesting starts only on successful initialize().
const start = Number(startArg);
if (!Number.isSafeInteger(start) || start <= 0 || !deployerArg || !ethers.isAddress(deployerArg)) {
  console.error("Usage: node scripts/prepare-base-unsigned-launch.cjs <deployer_eoa_address> [start_unix_seconds]");
  process.exit(1);
}
const deployer = ethers.getAddress(deployerArg);
const iface = new ethers.Interface(artifact.abi);
const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode);
const deploy = factory.getDeployTransaction(SAFE, BENEFICIARY, start, 365 * DAY, 1095 * DAY);
Promise.resolve(deploy).then(tx => {
  const initData = iface.encodeFunctionData("initialize", []);
  const report = {
    chainId: 8453, network: "Base Mainnet", mode: "UNSIGNED_PREPARATION_ONLY",
    from: deployer, controllerSafe: SAFE, beneficiary: BENEFICIARY,
    schedule: { earliestInitializationUnix: start, cliffDays: 365, linearDays: 1095 },
    tx1: { from: deployer, to: null, data: tx.data, valueWei: "0" },
    tx2: { from: deployer, to: "FACTORY_ADDRESS_FROM_MINED_TX1_RECEIPT", data: initData, valueWei: "0" },
    warnings: [
      "Both transactions MUST be signed by the same EOA because initializer is msg.sender of factory constructor",
      "Factory address must be read from successful deployment receipt; never guess it",
      "Do not call initialize before earliestInitializationUnix",
      "Actual vesting start is timestamp of successful initialize, not constructor start",
      "Do not send raw bytecode to a generic website; only a trusted, verified wallet flow",
      "Payload has no gas fees; estimate Base execution + L1 data fees at time of signing",
      "No transaction has been signed, sent or funded"
    ]
  };
  console.log(JSON.stringify(report, null, 2));
}).catch(e => { console.error(e); process.exitCode = 1; });
