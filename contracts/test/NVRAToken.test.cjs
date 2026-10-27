const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRAToken (local prototype)", function () {
  async function deploy() {
    const [deployer, treasury, user] = await ethers.getSigners();
    const token = await ethers.deployContract("NVRAToken", [treasury.address]);
    await token.waitForDeployment();
    return { token, deployer, treasury, user };
  }

  it("mints the full fixed supply to the designated treasury only", async function () {
    const { token, deployer, treasury } = await deploy();
    const supply = ethers.parseUnits("100000000", 18);
    expect(await token.name()).to.equal("NovaRise Utility Token");
    expect(await token.symbol()).to.equal("NVRA");
    expect(await token.decimals()).to.equal(18);
    expect(await token.MAX_SUPPLY()).to.equal(supply);
    expect(await token.totalSupply()).to.equal(supply);
    expect(await token.balanceOf(treasury.address)).to.equal(supply);
    expect(await token.balanceOf(deployer.address)).to.equal(0n);
  });

  it("rejects the zero treasury address", async function () {
    await expect(ethers.deployContract("NVRAToken", [ethers.ZeroAddress]))
      .to.be.revertedWith("NVRA: zero treasury");
  });

  it("supports standard transfers and allowances", async function () {
    const { token, treasury, user } = await deploy();
    const amount = ethers.parseUnits("10", 18);
    await expect(token.connect(treasury).transfer(user.address, amount))
      .to.emit(token, "Transfer").withArgs(treasury.address, user.address, amount);
    expect(await token.balanceOf(user.address)).to.equal(amount);
    await token.connect(user).approve(treasury.address, amount);
    expect(await token.allowance(user.address, treasury.address)).to.equal(amount);
    await token.connect(treasury).transferFrom(user.address, treasury.address, amount);
    expect(await token.balanceOf(user.address)).to.equal(0n);
  });

  it("exposes no owner-controlled mint function", async function () {
    const { token } = await deploy();
    expect(token.interface.hasFunction("mint")).to.equal(false);
    expect(token.interface.hasFunction("owner")).to.equal(false);
    expect(token.interface.hasFunction("upgradeTo")).to.equal(false);
  });
});
