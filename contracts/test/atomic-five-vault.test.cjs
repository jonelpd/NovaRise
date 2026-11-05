const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA atomic five-vault candidate (local research only)", function () {
  async function fiveContracts() {
    const Factory = await ethers.getContractFactory("MockNVRATreasury");
    const vaults = [];
    for (let i = 0; i < 5; i++) vaults.push(await Factory.deploy());
    return vaults;
  }

  it("atomically mints the fixed million supply into five separate vault addresses", async function () {
    const vaults = await fiveContracts();
    const addresses = await Promise.all(vaults.map(v => v.getAddress()));
    const Token = await ethers.getContractFactory("NVRAAtomicAllocationCandidate");
    const token = await Token.deploy(addresses);
    const budgets = [300000, 250000, 200000, 150000, 100000];
    let sum = 0n;
    for (let i = 0; i < 5; i++) {
      const amount = ethers.parseUnits(String(budgets[i]), 18);
      expect(await token.balanceOf(addresses[i])).to.equal(amount);
      sum += amount;
    }
    expect(sum).to.equal(await token.totalSupply());
    expect(await token.MAX_SUPPLY()).to.equal(sum);
    expect(await token.decimals()).to.equal(18);
  });

  it("rejects EOAs, zero addresses and duplicate vaults before any deployment succeeds", async function () {
    const [, outsider] = await ethers.getSigners();
    const vaults = await fiveContracts();
    const addresses = await Promise.all(vaults.map(v => v.getAddress()));
    const Token = await ethers.getContractFactory("NVRAAtomicAllocationCandidate");
    await expect(Token.deploy([outsider.address, ...addresses.slice(1)])).to.be.revertedWith("NVRA: invalid vault");
    await expect(Token.deploy([ethers.ZeroAddress, ...addresses.slice(1)])).to.be.revertedWith("NVRA: invalid vault");
    await expect(Token.deploy([addresses[0], addresses[0], ...addresses.slice(2)])).to.be.revertedWith("NVRA: duplicate vault");
  });

  it("does not mistake contract-code checks for verified vault security", async function () {
    const vaults = await fiveContracts();
    const addresses = await Promise.all(vaults.map(v => v.getAddress()));
    const Token = await ethers.getContractFactory("NVRAAtomicAllocationCandidate");
    const token = await Token.deploy(addresses);
    const [, outsider] = await ethers.getSigners();
    // Intentionally insecure mocks: anyone can drain their balance.
    const amount = ethers.parseUnits("1", 18);
    await vaults[0].connect(outsider).sendToken(await token.getAddress(), outsider.address, amount);
    expect(await token.balanceOf(outsider.address)).to.equal(amount);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
    // Thus this candidate must NOT be deployed with these mocks.
  });
});
