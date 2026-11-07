"use strict";
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

describe("NVRA unsigned Base launch payload regression", function () {
  it("encodes the confirmed MetaMask EOA, Safe and immutable vesting schedule", async function () {
    const deployer = "0x89316a3553Da9315a720e25915d731AfD11d0B16";
    const safe = "0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd";
    const start = 1793923200;
    const stdout = execFileSync(process.execPath, [
      path.resolve(__dirname, "../scripts/prepare-base-unsigned-launch.cjs"),
      deployer
    ], { encoding: "utf8" });
    const p = JSON.parse(stdout);
    expect(p.mode).to.equal("UNSIGNED_PREPARATION_ONLY");
    expect(p.chainId).to.equal(8453);
    expect(p.from).to.equal(ethers.getAddress(deployer));
    expect(p.controllerSafe).to.equal(ethers.getAddress(safe));
    expect(p.beneficiary).to.equal(ethers.getAddress(deployer));
    expect(p.tx1.from).to.equal(p.tx2.from);
    expect(p.tx1.to).to.equal(null);
    expect(p.tx2.to).to.equal("FACTORY_ADDRESS_FROM_MINED_TX1_RECEIPT");
    expect(p.tx1.valueWei).to.equal("0");
    expect(p.tx2.valueWei).to.equal("0");
    const Factory = await ethers.getContractFactory("NVRAAtomicImmutableVestingFactoryDraft");
    const parsed = ethers.AbiCoder.defaultAbiCoder().decode(["address", "address", "uint64", "uint64", "uint64"], "0x" + p.tx1.data.slice(Factory.bytecode.length));
    expect(parsed[0]).to.equal(ethers.getAddress(safe));
    expect(parsed[1]).to.equal(ethers.getAddress(deployer));
    expect(parsed[2]).to.equal(BigInt(start));
    expect(parsed[3]).to.equal(365n * 86400n);
    expect(parsed[4]).to.equal(1095n * 86400n);
    expect(Factory.interface.parseTransaction({ data: p.tx2.data }).name).to.equal("initialize");
  });
});
