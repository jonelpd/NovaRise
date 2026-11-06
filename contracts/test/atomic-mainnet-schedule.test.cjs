"use strict";
const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("NVRA atomic mainnet schedule regression", function () {
  const SUPPLY = ethers.parseEther("1000000");
  const amounts = ["300000", "250000", "200000", "150000", "100000"];
  const cliff = 365 * 24 * 60 * 60;
  const linear = 3 * cliff;

  async function fixture() {
    const [deployer, beneficiary, outsider] = await ethers.getSigners();
    const controller = "0x000000000000000000000000000000000000dEaD";
    await network.provider.send("hardhat_setCode", [controller, "0x60006000f3"]);
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const target = now + 120;
    const Factory = await ethers.getContractFactory("NVRAAtomicImmutableVestingFactoryDraft");
    const factory = await Factory.deploy(controller, beneficiary.address, target, cliff, linear);
    await factory.waitForDeployment();
    return { factory, beneficiary, outsider, target };
  }

  it("rejects initialization before target date and by outsiders", async function () {
    const { factory, outsider, target } = await fixture();
    await expect(factory.connect(outsider).initialize()).to.be.revertedWith("NVRA: unauthorized / initialized");
    await expect(factory.initialize()).to.be.revertedWith("NVRA: before launch date");
    await network.provider.send("evm_setNextBlockTimestamp", [target]);
    await network.provider.send("evm_mine");
    await expect(factory.connect(outsider).initialize()).to.be.revertedWith("NVRA: unauthorized / initialized");
  });

  it("mints exactly 1M, prefunds vesting, and starts cliff on actual atomic funding", async function () {
    const { factory, beneficiary, target } = await fixture();
    const actual = target + 7 * 24 * 60 * 60;
    await network.provider.send("evm_setNextBlockTimestamp", [actual]);
    const tx = await factory.initialize();
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const vesting = await ethers.getContractAt("NVRAImmutableBeneficiaryVestingDraft", await factory.vesting());
    expect(await token.totalSupply()).to.equal(SUPPLY);
    expect(await vesting.beneficiary()).to.equal(beneficiary.address);
    expect(await vesting.start()).to.equal(BigInt(block.timestamp));
    expect(await factory.actualVestingStart()).to.equal(BigInt(block.timestamp));
    expect(await vesting.cliffDuration()).to.equal(BigInt(cliff));
    expect(await vesting.linearDuration()).to.equal(BigInt(linear));
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(ethers.parseEther("150000"));
    for (let i = 0; i < 5; i++) {
      const vault = await factory.vaults(i);
      expect(vault).to.equal(await factory.predictVault(i));
      expect(await token.balanceOf(vault)).to.equal(i === 3 ? 0n : ethers.parseEther(amounts[i]));
    }
    expect(await vesting.vestedAmount(BigInt(block.timestamp + cliff))).to.equal(0n);
    expect(await vesting.vestedAmount(BigInt(block.timestamp + cliff + linear))).to.equal(ethers.parseEther("150000"));
    await expect(factory.initialize()).to.be.revertedWith("NVRA: unauthorized / initialized");
  });
});
