const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA team restricted vault and vesting (local only)", function () {
  async function setup() {
    const [owner, beneficiary, outsider] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRAAllocationController");
    const controller = await Controller.deploy();
    const latest = await ethers.provider.getBlock("latest");
    const start = latest.timestamp + 3600;
    const cliff = 86400;
    const linear = 86400 * 3;
    const Vesting = await ethers.getContractFactory("NVRATeamVesting");
    const vesting = await Vesting.deploy(beneficiary.address, start, cliff, linear);
    const Vault = await ethers.getContractFactory("NVRATeamRestrictedVaultDraft");
    const vault = await Vault.deploy(await controller.getAddress(), await vesting.getAddress());
    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    const token = await Token.deploy(await vault.getAddress());
    await vault.bindToken(await token.getAddress());
    const execute = async amount => controller.execute(await vault.getAddress(),
      vault.interface.encodeFunctionData("releaseToVesting", [amount]));
    return { owner, beneficiary, outsider, controller, vault, vesting, token, execute, start, cliff, linear };
  }

  it("sends team tokens only to the fixed vesting address, never to a wallet", async function () {
    const { beneficiary, outsider, vault, vesting, token, execute } = await setup();
    const amount = await vault.CAP();
    expect(await vault.vesting()).to.equal(await vesting.getAddress());
    expect(vault.interface.hasFunction("release")).to.equal(false);
    await expect(vault.connect(outsider).releaseToVesting(1n)).to.be.revertedWith("NVRA: controller only");
    await expect(vault.bindToken(await token.getAddress())).to.be.revertedWith("NVRA: already bound");
    await expect(vault.connect(outsider).bindToken(await token.getAddress())).to.be.revertedWith("NVRA: factory only");
    await expect(execute(amount + 1n)).to.be.revertedWith("NVRA: budget exceeded");
    await execute(amount);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(amount);
    expect(await token.balanceOf(beneficiary.address)).to.equal(0n);
    expect(await vault.released()).to.equal(amount);
    await expect(execute(1n)).to.be.revertedWith("NVRA: budget exceeded");
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("keeps the funded team allocation locked through cliff and releases after vesting", async function () {
    const { beneficiary, vesting, token, execute, vault, start, cliff, linear } = await setup();
    const amount = await vault.CAP();
    await execute(amount);
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff]);
    await ethers.provider.send("evm_mine", []);
    expect(await vesting["releasable(address)"](await token.getAddress())).to.equal(0n);
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff + linear + 1]);
    await ethers.provider.send("evm_mine", []);
    await vesting["release(address)"](await token.getAddress());
    expect(await token.balanceOf(beneficiary.address)).to.equal(amount);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(0n);
  });

  it("rejects invalid vesting destinations", async function () {
    const { controller, outsider } = await setup();
    const Vault = await ethers.getContractFactory("NVRATeamRestrictedVaultDraft");
    await expect(Vault.deploy(await controller.getAddress(), outsider.address))
      .to.be.revertedWith("NVRA: invalid vesting");
    await expect(Vault.deploy(await controller.getAddress(), ethers.ZeroAddress))
      .to.be.revertedWith("NVRA: invalid vesting");
  });
});
