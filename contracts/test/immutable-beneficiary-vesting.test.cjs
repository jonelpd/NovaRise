const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA immutable beneficiary vesting (local research only)", function () {
  async function setup() {
    const [beneficiary, outsider] = await ethers.getSigners();
    const Treasury = await ethers.getContractFactory("MockNVRATreasury");
    const treasury = await Treasury.deploy();
    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    const token = await Token.deploy(await treasury.getAddress());
    const block = await ethers.provider.getBlock("latest");
    const start = block.timestamp + 3600;
    const cliff = 86400;
    const linear = 3 * 86400;
    const Vesting = await ethers.getContractFactory("NVRAImmutableBeneficiaryVestingDraft");
    const vesting = await Vesting.deploy(await token.getAddress(), beneficiary.address, start, cliff, linear);
    const amount = ethers.parseUnits("150000", 18);
    await treasury.sendToken(await token.getAddress(), await vesting.getAddress(), amount);
    return { beneficiary, outsider, treasury, token, vesting, amount, start, cliff, linear, Vesting };
  }

  it("has an immutable beneficiary and no ownership, arbitrary transfer or upgrade functions", async function () {
    const { beneficiary, outsider, vesting } = await setup();
    expect(await vesting.beneficiary()).to.equal(beneficiary.address);
    for (const fn of ["transferOwnership", "renounceOwnership", "setBeneficiary", "transfer", "upgradeTo", "delegatecall", "release(address)"]) {
      expect(vesting.interface.hasFunction(fn)).to.equal(false);
    }
    await expect(outsider.sendTransaction({ to: await vesting.getAddress(), data: "0xf2fde38b" })).to.be.reverted;
    expect(await vesting.beneficiary()).to.equal(beneficiary.address);
  });

  it("locks the full team allocation through cliff, releases linearly and fully at end", async function () {
    const { beneficiary, outsider, token, vesting, amount, start, cliff, linear } = await setup();
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff]);
    await ethers.provider.send("evm_mine", []);
    expect(await vesting.releasable()).to.equal(0n);
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff]);
    await expect(vesting.release()).to.be.revertedWith("NVRA: nothing releasable");
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff + Math.floor(linear / 2)]);
    await ethers.provider.send("evm_mine", []);
    const half = await vesting.releasable();
    expect(half).to.equal(amount / 2n);
    await vesting.connect(outsider).release();
    expect(await token.balanceOf(beneficiary.address)).to.be.gte(half);
    expect(await token.balanceOf(outsider.address)).to.equal(0n);
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff + linear + 10]);
    await ethers.provider.send("evm_mine", []);
    await vesting.release();
    expect(await token.balanceOf(beneficiary.address)).to.equal(amount);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(0n);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("rejects invalid parameters and overflow", async function () {
    const { beneficiary, outsider, token, Vesting } = await setup();
    const addr = await token.getAddress();
    await expect(Vesting.deploy(outsider.address, beneficiary.address, 1, 1, 1)).to.be.revertedWith("NVRA: invalid token");
    await expect(Vesting.deploy(addr, ethers.ZeroAddress, 1, 1, 1)).to.be.revertedWith("NVRA: zero beneficiary");
    await expect(Vesting.deploy(addr, beneficiary.address, 1, 0, 1)).to.be.revertedWith("NVRA: invalid schedule");
    await expect(Vesting.deploy(addr, beneficiary.address, 18446744073709551615n, 1, 1))
      .to.be.revertedWith("NVRA: schedule overflow");
  });

  it("shows that late funding can unlock immediately, a remaining policy risk", async function () {
    const { beneficiary, treasury, token, vesting, amount, start, cliff, linear } = await setup();
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff + linear + 1]);
    await ethers.provider.send("evm_mine", []);
    await vesting.release();
    const extra = ethers.parseUnits("1", 18);
    await treasury.sendToken(await token.getAddress(), await vesting.getAddress(), extra);
    expect(await vesting.releasable()).to.equal(extra);
    await vesting.release();
    expect(await token.balanceOf(beneficiary.address)).to.equal(amount + extra);
  });
});
