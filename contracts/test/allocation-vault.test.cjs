const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA allocation vault draft (local only)", function () {
  async function fixture() {
    const [, recipient, outsider] = await ethers.getSigners();
    const Treasury = await ethers.getContractFactory("MockNVRATreasury");
    const treasury = await Treasury.deploy();
    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    const token = await Token.deploy(await treasury.getAddress());
    const Controller = await ethers.getContractFactory("MockNVRAAllocationController");
    const controller = await Controller.deploy();
    const Vault = await ethers.getContractFactory("NVRAAllocationVaultDraft");
    const vault = await Vault.deploy(await token.getAddress(), await controller.getAddress());
    await treasury.sendToken(await token.getAddress(), await vault.getAddress(), ethers.parseUnits("1000000", 18));
    const execute = async (bucket, to, amount) =>
      controller.execute(await vault.getAddress(), vault.interface.encodeFunctionData("release", [bucket, to, amount]));
    return { token, treasury, controller, vault, recipient, outsider, execute };
  }

  it("matches five proposed budgets and total fixed supply", async function () {
    const { token, vault } = await fixture();
    const amounts = [300000, 250000, 200000, 150000, 100000];
    for (let i = 0; i < amounts.length; i++) {
      expect(await vault.budget(i)).to.equal(ethers.parseUnits(String(amounts[i]), 18));
      expect(await vault.remaining(i)).to.equal(await vault.budget(i));
    }
    expect(await vault.TOTAL_BUDGET()).to.equal(await token.totalSupply());
    await expect(vault.budget(5)).to.be.revertedWith("NVRA: invalid bucket");
  });

  it("blocks unauthorized releases and over-budget amounts", async function () {
    const { token, vault, recipient, execute } = await fixture();
    const cap = ethers.parseUnits("150000", 18);
    await expect(vault.release(3, recipient.address, 1n)).to.be.revertedWith("NVRA: controller only");
    await expect(execute(3, recipient.address, cap + 1n)).to.be.revertedWith("NVRA: allocation exceeded");
    await execute(3, recipient.address, cap);
    expect(await vault.remaining(3)).to.equal(0n);
    expect(await token.balanceOf(recipient.address)).to.equal(cap);
    await expect(execute(3, recipient.address, 1n)).to.be.revertedWith("NVRA: allocation exceeded");
    expect(await vault.totalReleased()).to.equal(cap);
  });

  it("releases all five allocations without creating or losing tokens", async function () {
    const { token, vault, recipient, execute } = await fixture();
    for (let i = 0; i < 5; i++) {
      await execute(i, recipient.address, await vault.budget(i));
      expect(await vault.remaining(i)).to.equal(0n);
    }
    expect(await vault.totalReleased()).to.equal(ethers.parseUnits("1000000", 18));
    expect(await token.balanceOf(recipient.address)).to.equal(await token.totalSupply());
    expect(await token.balanceOf(await vault.getAddress())).to.equal(0n);
  });

  it("rejects invalid recipients, zero amounts and non-contract controller", async function () {
    const { token, vault, recipient, outsider, execute } = await fixture();
    const Vault = await ethers.getContractFactory("NVRAAllocationVaultDraft");
    await expect(Vault.deploy(await token.getAddress(), outsider.address)).to.be.revertedWith("NVRA: invalid controller");
    await expect(execute(0, ethers.ZeroAddress, 1n)).to.be.revertedWith("NVRA: invalid recipient");
    await expect(execute(0, await vault.getAddress(), 1n)).to.be.revertedWith("NVRA: invalid recipient");
    await expect(execute(0, recipient.address, 0n)).to.be.revertedWith("NVRA: zero amount");
    expect(await vault.totalReleased()).to.equal(0n);
  });
});
