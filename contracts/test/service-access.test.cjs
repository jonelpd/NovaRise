const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA service access primitive", function () {
  it("checks token balances without transferring or locking NVRA", async function () {
    const [deployer, user, other] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockNVRATreasury");
    const treasury = await Mock.deploy();
    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    const token = await Token.deploy(await treasury.getAddress());
    const Access = await ethers.getContractFactory("NVRAServiceAccess");
    const threshold = ethers.parseUnits("5", 18);
    const access = await Access.deploy(await token.getAddress(), threshold);
    expect(await access.hasAccess(user.address)).to.equal(false);
    expect(await access.hasAccess(ethers.ZeroAddress)).to.equal(false);
    await treasury.sendToken(await token.getAddress(), user.address, threshold);
    expect(await access.hasAccess(user.address)).to.equal(true);
    expect(await access.balanceAndEligibility(user.address)).to.deep.equal([threshold, true]);
    await (await token.connect(user).transfer(other.address, threshold)).wait();
    expect(await access.hasAccess(user.address)).to.equal(false);
    expect(await access.hasAccess(other.address)).to.equal(true);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("rejects zero thresholds and non-contract tokens", async function () {
    const [deployer] = await ethers.getSigners();
    const Access = await ethers.getContractFactory("NVRAServiceAccess");
    await expect(Access.deploy(deployer.address, 1n)).to.be.revertedWith("NVRA: invalid token");
    const Mock = await ethers.getContractFactory("MockNVRATreasury");
    const treasury = await Mock.deploy();
    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    const token = await Token.deploy(await treasury.getAddress());
    await expect(Access.deploy(await token.getAddress(), 0n)).to.be.revertedWith("NVRA: invalid minimum");
  });
});
