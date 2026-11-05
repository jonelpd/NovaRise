const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA atomic immutable vesting factory (local only)", function () {
  async function setup() {
    const [owner, beneficiary, outsider] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRAAllocationController");
    const controller = await Controller.deploy();
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const start = now + 3600;
    const Factory = await ethers.getContractFactory("NVRAAtomicImmutableVestingFactoryDraft");
    const factory = await Factory.deploy(await controller.getAddress(), beneficiary.address, start, 86400, 259200);
    return { owner, beneficiary, outsider, controller, factory, start };
  }

  it("predicts CREATE2 vaults, mints one million, and funds the immutable vesting atomically", async () => {
    const { factory, beneficiary } = await setup();
    const predicted = await Promise.all([0,1,2,3,4].map(i => factory.predictVault(i)));
    await factory.initialize();
    for (let i=0;i<5;i++) expect(await factory.vaults(i)).to.equal(predicted[i]);
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const vesting = await ethers.getContractAt("NVRAImmutableBeneficiaryVestingDraft", await factory.vesting());
    expect(await vesting.beneficiary()).to.equal(beneficiary.address);
    expect(await vesting.token()).to.equal(await token.getAddress());
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000"));
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(ethers.parseEther("150000"));
    expect(await token.balanceOf(predicted[3])).to.equal(0n);
    expect(await vesting.releasable()).to.equal(0n);
    await expect(factory.initialize()).to.be.reverted;
  });

  it("rejects outsider initialization and initialization after vesting start", async () => {
    const { factory, outsider, start } = await setup();
    await expect(factory.connect(outsider).initialize()).to.be.reverted;
    await ethers.provider.send("evm_setNextBlockTimestamp", [start]);
    await ethers.provider.send("evm_mine", []);
    await expect(factory.initialize()).to.be.revertedWith("NVRA: funding too late");
    expect(await factory.initialized()).to.equal(false);
  });

  it("prevents anyone from using the escrow to redirect team tokens", async () => {
    const { factory, outsider } = await setup();
    await factory.initialize();
    const escrow = await ethers.getContractAt("NVRATeamPrefundEscrowDraft", await factory.vaults(3));
    await expect(escrow.connect(outsider).fund(await factory.token(), outsider.address)).to.be.reverted;
    expect(await escrow.funded()).to.equal(true);
  });
});
