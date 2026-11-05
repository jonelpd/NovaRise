const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA atomic factory adversarial cases (local only)", function () {
  async function fixture() {
    const [owner, outsider, recipient] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRAAllocationController");
    const controller = await Controller.deploy();
    const Factory = await ethers.getContractFactory("NVRAAtomicFactoryDraft");
    const factory = await Factory.deploy(await controller.getAddress());
    return { owner, outsider, recipient, controller, factory };
  }

  it("does not expose vaults or token when outsider front-runs initialize", async function () {
    const { outsider, factory } = await fixture();
    const predicted = await factory.predictVault(0);
    await expect(factory.connect(outsider).initialize()).to.be.revertedWith("NVRA: initializer only");
    expect(await factory.initialized()).to.equal(false);
    expect(await factory.token()).to.equal(ethers.ZeroAddress);
    expect(await ethers.provider.getCode(predicted)).to.equal("0x");
    for (let i = 0; i < 5; i++) expect(await factory.vaults(i)).to.equal(ethers.ZeroAddress);
    await factory.initialize();
    expect(await factory.initialized()).to.equal(true);
    expect(await ethers.provider.getCode(predicted)).to.not.equal("0x");
  });

  it("does not allow outsider to change token binding or call a vault release", async function () {
    const { outsider, recipient, factory } = await fixture();
    await factory.initialize();
    const token = await factory.token();
    for (let i = 0; i < 5; i++) {
      const vault = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", await factory.vaults(i));
      await expect(vault.connect(outsider).bindToken(token)).to.be.revertedWith("NVRA: factory only");
      await expect(vault.connect(outsider).release(recipient.address, 1n)).to.be.revertedWith("NVRA: controller only");
      expect(await vault.token()).to.equal(token);
      expect(await vault.released()).to.equal(0n);
    }
  });

  it("rejects zero, invalid recipient and oversized transfers without changing accounting", async function () {
    const { controller, recipient, factory } = await fixture();
    await factory.initialize();
    const vault = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", await factory.vaults(0));
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const execute = (to, amount) =>
      controller.execute(vault.target, vault.interface.encodeFunctionData("release", [to, amount]));
    const cap = await vault.cap();
    await expect(execute(recipient.address, 0n)).to.be.revertedWith("NVRA: budget exceeded");
    await expect(execute(ethers.ZeroAddress, 1n)).to.be.revertedWith("NVRA: invalid recipient");
    await expect(execute(vault.target, 1n)).to.be.revertedWith("NVRA: invalid recipient");
    await expect(execute(recipient.address, cap + 1n)).to.be.revertedWith("NVRA: budget exceeded");
    expect(await vault.released()).to.equal(0n);
    expect(await token.balanceOf(vault.target)).to.equal(cap);
    await execute(recipient.address, cap);
    expect(await vault.released()).to.equal(cap);
    await expect(execute(recipient.address, 1n)).to.be.revertedWith("NVRA: budget exceeded");
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("shows the critical danger of the mock controller: an outsider can release funds through it", async function () {
    const { outsider, recipient, controller, factory } = await fixture();
    await factory.initialize();
    const vault = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", await factory.vaults(2));
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const amount = ethers.parseUnits("5", 18);
    await controller.connect(outsider).execute(vault.target, vault.interface.encodeFunctionData("release", [recipient.address, amount]));
    expect(await token.balanceOf(recipient.address)).to.equal(amount);
    // This test is a deliberate demonstration of an unsafe mock, not a successful security guarantee.
  });

  it("preserves global supply and independent caps after payouts from all five vaults", async function () {
    const { recipient, controller, factory } = await fixture();
    await factory.initialize();
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    let released = 0n;
    for (let i = 0; i < 5; i++) {
      const vault = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", await factory.vaults(i));
      const amount = (await vault.cap()) / 2n;
      await controller.execute(vault.target, vault.interface.encodeFunctionData("release", [recipient.address, amount]));
      expect(await vault.released()).to.equal(amount);
      expect(await token.balanceOf(vault.target)).to.equal((await vault.cap()) - amount);
      released += amount;
    }
    expect(await token.balanceOf(recipient.address)).to.equal(released);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
  });
});
