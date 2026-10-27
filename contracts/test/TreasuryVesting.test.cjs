const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Integration exercise using OpenZeppelin's VestingWallet.
 * This does not create a production treasury or determine final allocations.
 */
describe("NVRA illustrative vesting integration (local)", function () {
  it("keeps tokens in treasury until a separate vesting wallet is funded and releases them gradually", async function () {
    const [deployer, treasury, beneficiary] = await ethers.getSigners();
    const token = await ethers.deployContract("NVRAToken", [treasury.address]);
    await token.waitForDeployment();

    const start = (await time.latest()) + 120;
    const duration = 365 * 24 * 60 * 60;
    const vesting = await ethers.deployContract("VestingWallet", [
      beneficiary.address, start, duration
    ]);
    await vesting.waitForDeployment();

    const allocation = ethers.parseUnits("15000000", 18); // illustrative 15% team allocation
    await token.connect(treasury).transfer(await vesting.getAddress(), allocation);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(allocation);
    expect(await vesting["releasable(address)"](await token.getAddress())).to.equal(0n);

    await time.increaseTo(start + Math.floor(duration / 2));
    const vestedHalf = await vesting["releasable(address)"](await token.getAddress());
    expect(vestedHalf).to.be.greaterThan(0n);
    expect(vestedHalf).to.be.lessThan(allocation);
    await vesting.connect(beneficiary)["release(address)"](await token.getAddress());
    const releasedAtHalf = await token.balanceOf(beneficiary.address);
    // Mining the release transaction advances the block timestamp slightly.
    expect(releasedAtHalf).to.be.greaterThanOrEqual(vestedHalf);
    expect(releasedAtHalf).to.be.lessThan(allocation);

    await time.increaseTo(start + duration);
    await vesting.connect(beneficiary)["release(address)"](await token.getAddress());
    expect(await token.balanceOf(beneficiary.address)).to.equal(allocation);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("100000000", 18));
  });

  it("does not allow treasury holder to seize tokens held by the vesting wallet", async function () {
    const [, treasury, beneficiary] = await ethers.getSigners();
    const token = await ethers.deployContract("NVRAToken", [treasury.address]);
    const vesting = await ethers.deployContract("VestingWallet", [
      beneficiary.address, (await time.latest()) + 100, 365 * 24 * 60 * 60
    ]);
    const amount = ethers.parseUnits("100", 18);
    await token.connect(treasury).transfer(await vesting.getAddress(), amount);
    await expect(token.connect(treasury).transferFrom(
      await vesting.getAddress(), treasury.address, amount
    )).to.be.reverted;
  });
});
