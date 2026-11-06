const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA bounded surplus vesting draft", () => {
  async function fixture() {
    const [beneficiary, outsider] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRASurplusController");
    const controller = await Controller.deploy();
    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    const token = await Token.deploy(await controller.getAddress());
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const start = now + 3600, cliff = 86400, linear = 259200;
    const Vesting = await ethers.getContractFactory("NVRABoundedSurplusVestingDraft");
    const vesting = await Vesting.deploy(await token.getAddress(), beneficiary.address, await controller.getAddress(), start, cliff, linear);
    const allocation = ethers.parseEther("150000");
    await controller.sendToken(await token.getAddress(), await vesting.getAddress(), allocation);
    return { beneficiary, outsider, controller, token, vesting, start, cliff, linear, allocation };
  }

  it("reserves the entire unpaid team allocation before and during cliff", async () => {
    const { vesting, outsider, allocation } = await fixture();
    expect(await vesting.recoverableSurplus()).to.equal(0n);
    expect(await vesting.TEAM_ALLOCATION()).to.equal(allocation);
    await expect(vesting.connect(outsider).recoverSurplus(1)).to.be.revertedWith("NVRA: controller only");
  });

  it("does not allow the beneficiary or outsiders to withdraw surplus", async () => {
    const { vesting, beneficiary, outsider } = await fixture();
    await expect(vesting.connect(beneficiary).recoverSurplus(1)).to.be.revertedWith("NVRA: controller only");
    await expect(vesting.connect(outsider).recoverSurplus(1)).to.be.revertedWith("NVRA: controller only");
  });

  it("keeps the fixed entitlement and schedule regardless of surplus", async () => {
    const { vesting, token, controller, beneficiary, start, cliff, linear, allocation } = await fixture();
    const extra = ethers.parseEther("7");
    await controller.sendToken(await token.getAddress(), await vesting.getAddress(), extra);
    expect(await vesting.recoverableSurplus()).to.equal(extra);
    expect(await vesting.vestedAmount(start + cliff)).to.equal(0n);
    expect(await vesting.vestedAmount(start + cliff + linear)).to.equal(allocation);
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff + linear + 1]);
    await ethers.provider.send("evm_mine", []);
    await vesting.release();
    expect(await token.balanceOf(beneficiary.address)).to.equal(allocation);
    expect(await vesting.recoverableSurplus()).to.equal(extra);
  });

  it("allows the controller to recover only genuine surplus back to itself", async () => {
    const { vesting, controller, token, allocation } = await fixture();
    const extra = ethers.parseEther("9");
    await controller.sendToken(await token.getAddress(), await vesting.getAddress(), extra);
    await expect(controller.recover(await vesting.getAddress(), extra + 1n)).to.be.revertedWith("NVRA: exceeds surplus");
    await controller.recover(await vesting.getAddress(), extra);
    expect(await vesting.recoverableSurplus()).to.equal(0n);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(allocation);
    await expect(controller.recover(await vesting.getAddress(), 1)).to.be.revertedWith("NVRA: exceeds surplus");
  });

  it("rejects recovering more than the surplus", async () => {
    const { vesting, outsider } = await fixture();
    await expect(vesting.connect(outsider).recoverSurplus(ethers.parseEther("1"))).to.be.revertedWith("NVRA: controller only");
    expect(await vesting.recoverableSurplus()).to.equal(0n);
  });
});
