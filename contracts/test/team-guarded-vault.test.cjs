const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA guarded team vault checks vesting at every release (local only)", function () {
  async function setup() {
    const [beneficiary, replacement, outsider] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRAAllocationController");
    const controller = await Controller.deploy();
    const block = await ethers.provider.getBlock("latest");
    const start = block.timestamp + 3600;
    const cliff = 86400;
    const linear = 3 * 86400;
    const Vesting = await ethers.getContractFactory("NVRATeamVesting");
    const vesting = await Vesting.deploy(beneficiary.address, start, cliff, linear);
    const codehash = ethers.keccak256(await ethers.provider.getCode(await vesting.getAddress()));
    const Guard = await ethers.getContractFactory("NVRAVestingIdentityGuardDraft");
    const guard = await Guard.deploy(await vesting.getAddress(), beneficiary.address,
      codehash, start, cliff + linear, cliff);
    const Vault = await ethers.getContractFactory("NVRATeamGuardedVaultDraft");
    const vault = await Vault.deploy(await controller.getAddress(), await guard.getAddress());
    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    const token = await Token.deploy(await vault.getAddress());
    await vault.bindToken(await token.getAddress());
    const execute = amount => controller.execute(vault.target,
      vault.interface.encodeFunctionData("releaseToVesting", [amount]));
    return { beneficiary, replacement, outsider, controller, vesting, guard, vault, token, execute };
  }

  it("revalidates before each payout and respects team budget", async function () {
    const { beneficiary, vesting, vault, token, execute } = await setup();
    const part = ethers.parseUnits("50000", 18);
    await execute(part);
    await execute(part);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(part * 2n);
    expect(await token.balanceOf(beneficiary.address)).to.equal(0n);
    expect(await vault.released()).to.equal(part * 2n);
    await expect(execute(ethers.parseUnits("50001", 18))).to.be.revertedWith("NVRA: budget exceeded");
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("blocks a release after vesting beneficiary ownership changes", async function () {
    const { beneficiary, replacement, vesting, vault, token, execute } = await setup();
    const amount = ethers.parseUnits("1000", 18);
    await execute(amount);
    await vesting.connect(beneficiary).transferOwnership(replacement.address);
    await expect(execute(amount)).to.be.revertedWith("NVRA: beneficiary mismatch");
    expect(await vault.released()).to.equal(amount);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(amount);
  });

  it("rejects outsiders and refuses zero or over-budget payouts", async function () {
    const { outsider, vault, execute } = await setup();
    await expect(vault.connect(outsider).releaseToVesting(1n)).to.be.revertedWith("NVRA: controller only");
    await expect(execute(0n)).to.be.revertedWith("NVRA: budget exceeded");
    await expect(execute((await vault.CAP()) + 1n)).to.be.revertedWith("NVRA: budget exceeded");
    expect(vault.interface.hasFunction("release")).to.equal(false);
  });
});
