const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("NVRA budget vault (prototype; test-only controller impersonation)", function () {
  it("enforces controller, per-period and lifetime caps without rollover", async function () {
    const [deployer, recipient] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockNVRATreasury");
    const controller = await Mock.deploy();
    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    const token = await Token.deploy(await controller.getAddress());
    const Vault = await ethers.getContractFactory("NVRABudgetVault");
    const start = 2000000000;
    const period = 30 * 86400;
    const limit = ethers.parseUnits("3125", 18);
    const vault = await Vault.deploy(await token.getAddress(), await controller.getAddress(), start, period, 2, limit);
    await controller.sendToken(await token.getAddress(), await vault.getAddress(), 2n * limit);
    await expect(vault.disburse(recipient.address, 1n)).to.be.revertedWith("NVRA: only controller");
    await network.provider.send("hardhat_setBalance", [await controller.getAddress(), "0x3635C9ADC5DEA00000"]);
    await network.provider.send("hardhat_impersonateAccount", [await controller.getAddress()]);
    const signer = await ethers.getSigner(await controller.getAddress());
    try {
      await network.provider.send("evm_setNextBlockTimestamp", [start - 1]);
      await network.provider.send("evm_mine");
      await expect(vault.connect(signer).disburse(recipient.address, 1n)).to.be.revertedWith("NVRA: not started");
      await network.provider.send("evm_setNextBlockTimestamp", [start + 1]);
      await network.provider.send("evm_mine");
      await expect(vault.connect(signer).disburse(ethers.ZeroAddress, 1n)).to.be.revertedWith("NVRA: invalid disbursement");
      await (await vault.connect(signer).disburse(recipient.address, limit - 1n)).wait();
      await expect(vault.connect(signer).disburse(recipient.address, 2n)).to.be.revertedWith("NVRA: period cap");
      await network.provider.send("evm_setNextBlockTimestamp", [start + period + 1]);
      await network.provider.send("evm_mine");
      await (await vault.connect(signer).disburse(recipient.address, limit)).wait();
      await expect(vault.connect(signer).disburse(recipient.address, 1n)).to.be.revertedWith("NVRA: period cap");
      expect(await vault.totalReleased()).to.equal(2n * limit - 1n);
      expect(await token.balanceOf(recipient.address)).to.equal(2n * limit - 1n);
      expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
      await network.provider.send("evm_setNextBlockTimestamp", [start + 2 * period]);
      await network.provider.send("evm_mine");
      await expect(vault.connect(signer).disburse(recipient.address, 1n)).to.be.revertedWith("NVRA: schedule ended");
    } finally {
      await network.provider.send("hardhat_stopImpersonatingAccount", [await controller.getAddress()]);
    }
  });
});
