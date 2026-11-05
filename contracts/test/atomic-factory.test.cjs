const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA CREATE2 atomic factory draft (local only)", function () {
  async function setup() {
    const [owner, recipient, outsider] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRAAllocationController");
    const controller = await Controller.deploy();
    const Factory = await ethers.getContractFactory("NVRAAtomicFactoryDraft");
    const factory = await Factory.deploy(await controller.getAddress());
    return { owner, recipient, outsider, controller, factory };
  }

  it("creates five predicted vaults, mints and binds in one transaction", async function () {
    const { factory, controller, recipient } = await setup();
    const predicted = [];
    for (let i = 0; i < 5; i++) predicted.push(await factory.predictVault(i));
    await factory.initialize();
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const caps = [300000, 250000, 200000, 150000, 100000];
    for (let i = 0; i < 5; i++) {
      const address = await factory.vaults(i);
      expect(address).to.equal(predicted[i]);
      const vault = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", address);
      expect(await vault.token()).to.equal(await token.getAddress());
      expect(await vault.controller()).to.equal(await controller.getAddress());
      expect(await vault.cap()).to.equal(ethers.parseUnits(String(caps[i]), 18));
      expect(await token.balanceOf(address)).to.equal(await vault.cap());
      await expect(vault.bindToken(await token.getAddress())).to.be.revertedWith("NVRA: factory only");
    }
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
    const team = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", await factory.vaults(3));
    await expect(team.release(recipient.address, 1n)).to.be.revertedWith("NVRA: controller only");
    await controller.execute(await team.getAddress(), team.interface.encodeFunctionData("release", [recipient.address, await team.cap()]));
    expect(await token.balanceOf(recipient.address)).to.equal(ethers.parseUnits("150000", 18));
    await expect(controller.execute(await team.getAddress(), team.interface.encodeFunctionData("release", [recipient.address, 1n])))
      .to.be.revertedWith("NVRA: budget exceeded");
  });

  it("blocks front-running initialization, repeated setup and invalid controller", async function () {
    const { factory, outsider } = await setup();
    await expect(factory.connect(outsider).initialize()).to.be.revertedWith("NVRA: initializer only");
    await expect(factory.predictVault(5)).to.be.revertedWith("NVRA: invalid bucket");
    await factory.initialize();
    await expect(factory.initialize()).to.be.revertedWith("NVRA: already initialized");
    const Factory = await ethers.getContractFactory("NVRAAtomicFactoryDraft");
    await expect(Factory.deploy(outsider.address)).to.be.revertedWith("NVRA: invalid controller");
  });
});
