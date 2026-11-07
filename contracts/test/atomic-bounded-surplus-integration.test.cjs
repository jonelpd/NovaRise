"use strict";
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA atomic CREATE2 bounded surplus integration", function () {
  it("protects all team tokens, returns only accidental surplus to controller and preserves final entitlement", async () => {
    const [deployer, beneficiary, outsider] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRASurplusController");
    const controller = await Controller.deploy();
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const start = now + 3600, cliff = 86400, linear = 259200;
    const Factory = await ethers.getContractFactory("NVRAAtomicImmutableVestingFactoryDraft");
    const factory = await Factory.deploy(await controller.getAddress(), beneficiary.address, start, cliff, linear);
    await ethers.provider.send("evm_setNextBlockTimestamp", [start]);
    await factory.initialize();

    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const vesting = await ethers.getContractAt("NVRABoundedSurplusVestingDraft", await factory.vesting());
    const allocation = ethers.parseEther("150000");
    const extra = ethers.parseEther("11");
    expect(await vesting.controller()).to.equal(await controller.getAddress());
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(allocation);
    expect(await vesting.recoverableSurplus()).to.equal(0n);
    await expect(controller.recover(await vesting.getAddress(), 1)).to.be.revertedWith("NVRA: exceeds surplus");
    await expect(vesting.connect(outsider).recoverSurplus(1)).to.be.revertedWith("NVRA: controller only");

    const generalVault = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", await factory.vaults(0));
    // Use a locally impersonated contract-controller only to simulate the treasury
    // transfer of accidental excess. This is NOT a production Safe authorization.
    await ethers.provider.send("hardhat_impersonateAccount", [await controller.getAddress()]);
    await ethers.provider.send("hardhat_setBalance", [await controller.getAddress(), ethers.toBeHex(ethers.parseEther("1"))]);
    const asController = await ethers.getSigner(await controller.getAddress());
    await generalVault.connect(asController).release(await vesting.getAddress(), extra);
    await ethers.provider.send("hardhat_stopImpersonatingAccount", [await controller.getAddress()]);
    expect(await vesting.recoverableSurplus()).to.equal(extra);
    await expect(controller.recover(await vesting.getAddress(), extra + 1n)).to.be.revertedWith("NVRA: exceeds surplus");
    await controller.recover(await vesting.getAddress(), extra);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(allocation);
    expect(await token.balanceOf(await controller.getAddress())).to.equal(extra);

    const actualStart = Number(await vesting.start());
    await ethers.provider.send("evm_setNextBlockTimestamp", [actualStart + cliff + linear + 1]);
    await ethers.provider.send("evm_mine", []);
    await vesting.connect(outsider).release();
    expect(await token.balanceOf(beneficiary.address)).to.equal(allocation);
    expect(await vesting.recoverableSurplus()).to.equal(0n);
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000"));
  });
});
