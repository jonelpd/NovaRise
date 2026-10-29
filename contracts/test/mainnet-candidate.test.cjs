const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NovaRise 1M mainnet candidate (local only)", function () {
  it("rejects zero or EOA treasury, mints exactly 1m to deployed multisig-like contract", async function () {
    const [deployer, beneficiary] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    await expect(Token.deploy(ethers.ZeroAddress)).to.be.revertedWith("NVRA: zero treasury");
    await expect(Token.deploy(beneficiary.address)).to.be.revertedWith("NVRA: treasury must be a contract");
    const Treasury = await ethers.getContractFactory("MockNVRATreasury");
    const treasury = await Treasury.deploy();
    const token = await Token.deploy(await treasury.getAddress());
    const supply = ethers.parseUnits("1000000", 18);
    expect(await token.totalSupply()).to.equal(supply);
    expect(await token.balanceOf(await treasury.getAddress())).to.equal(supply);
    expect(await token.balanceOf(deployer.address)).to.equal(0n);
    expect(await token.MAX_SUPPLY()).to.equal(supply);
    expect(await token.decimals()).to.equal(18);
  });
});

describe("NovaRise team cliff vesting (local only)", function () {
  it("vests nothing through cliff, then linearly, and fully at end", async function () {
    const [owner, beneficiary] = await ethers.getSigners();
    const Treasury = await ethers.getContractFactory("MockNVRATreasury");
    const treasury = await Treasury.deploy();
    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    const token = await Token.deploy(await treasury.getAddress());
    const Vesting = await ethers.getContractFactory("NVRATeamVesting");
    const start = 2000000000;
    const cliff = 365 * 24 * 60 * 60;
    const linear = 3 * cliff;
    const vest = await Vesting.deploy(beneficiary.address, start, cliff, linear);
    const allocation = ethers.parseUnits("150000", 18);
    await treasury.sendToken(await token.getAddress(), await vest.getAddress(), allocation);
    const addr = await token.getAddress();
    expect(await vest.vestedAmount(addr, start)).to.equal(0n);
    expect(await vest.vestedAmount(addr, start + cliff)).to.equal(0n);
    expect(await vest.vestedAmount(addr, start + cliff + linear / 2)).to.equal(allocation / 2n);
    expect(await vest.vestedAmount(addr, start + cliff + linear)).to.equal(allocation);
    expect(await vest.owner()).to.equal(beneficiary.address);
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff + Math.floor(linear / 2)]);
    await ethers.provider.send("evm_mine", []);
    const releaseTx = await vest.connect(beneficiary)["release(address)"](addr);
    await expect(releaseTx).to.emit(vest, "ERC20Released");
    const releaseReceipt = await releaseTx.wait();
    const releaseBlock = await ethers.provider.getBlock(releaseReceipt.blockNumber);
    const vestedAtRelease = await vest.vestedAmount(addr, releaseBlock.timestamp);
    expect(await token.balanceOf(beneficiary.address)).to.equal(vestedAtRelease);
    expect(await token.balanceOf(await vest.getAddress())).to.equal(allocation - vestedAtRelease);
  });
  it("rejects invalid schedule", async function () {
    const [, beneficiary] = await ethers.getSigners();
    const Vesting = await ethers.getContractFactory("NVRATeamVesting");
    await expect(Vesting.deploy(ethers.ZeroAddress, 2000000000, 1, 1)).to.be.reverted;
    await expect(Vesting.deploy(beneficiary.address, 2000000000, 0, 1)).to.be.revertedWith("NVRA: invalid durations");
  });
});
