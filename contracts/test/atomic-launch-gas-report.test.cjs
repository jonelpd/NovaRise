"use strict";
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("NVRA mainnet launch gas measurement (local only)", function () {
  it("measures both transactions and validates 1M supply", async function () {
    const DAY = 86400;
    expect(network.name).to.equal("hardhat");
    expect((await ethers.provider.getNetwork()).chainId).to.equal(31337n);
    const safe = "0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd";
    const beneficiary = "0x89316a3553Da9315a720e25915d731AfD11d0B16";
    await network.provider.send("hardhat_setCode", [safe, "0x60006000f3"]);
    const start = (await ethers.provider.getBlock("latest")).timestamp + 120;
    const Factory = await ethers.getContractFactory("NVRAAtomicImmutableVestingFactoryDraft");
    const factory = await Factory.deploy(safe, beneficiary, start, 365 * DAY, 1095 * DAY);
    const deployReceipt = await factory.deploymentTransaction().wait();
    await network.provider.send("evm_setNextBlockTimestamp", [start]);
    const initReceipt = await (await factory.initialize()).wait();
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const vesting = await factory.vesting();
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000"));
    expect(await token.balanceOf(vesting)).to.equal(ethers.parseEther("150000"));
    const gas = deployReceipt.gasUsed + initReceipt.gasUsed;
    console.log("NVRA_LOCAL_GAS_REPORT " + JSON.stringify({
      deployGas: deployReceipt.gasUsed.toString(),
      initializeGas: initReceipt.gasUsed.toString(),
      totalGas: gas.toString(),
      bufferedGas30pct: (gas * 130n / 100n).toString(),
      note: "Execution gas only; Base L1 data fee, real gas price, and wallet fees excluded"
    }));
  });
});
