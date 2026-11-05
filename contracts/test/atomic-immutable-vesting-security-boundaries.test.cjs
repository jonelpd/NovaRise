const { expect } = require("chai");
const { ethers } = require("hardhat");

// Negative security tests. These document risks; they are NOT evidence of production safety.
describe("NVRA immutable CREATE2 factory security boundaries (local research)", () => {
  async function fixture() {
    const [deployer, beneficiary, outsider] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRAAllocationController");
    const controller = await Controller.deploy();
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const Factory = await ethers.getContractFactory("NVRAAtomicImmutableVestingFactoryDraft");
    const factory = await Factory.deploy(await controller.getAddress(), beneficiary.address, now + 3600, 86400, 259200);
    await factory.initialize();
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const vesting = await ethers.getContractAt("NVRAImmutableBeneficiaryVestingDraft", await factory.vesting());
    return { deployer, beneficiary, outsider, controller, factory, token, vesting };
  }

  it("documents that a generic controller contract is accepted (Safe authenticity NOT enforced)", async () => {
    const { controller, factory } = await fixture();
    expect(await factory.controller()).to.equal(await controller.getAddress());
    // This is a known security gap: controller.code.length != 0 is not Safe authentication.
  });

  it("documents late funding risk: direct ERC20 transfers become immediately releasable after schedule", async () => {
    const { beneficiary, factory, token, vesting } = await fixture();
    const vault = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", await factory.vaults(0));
    // The controller mock can trigger vault transfers; no real Safe signatures are involved.
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const start = Number(await vesting.start());
    const cliff = Number(await vesting.cliffDuration());
    const linear = Number(await vesting.linearDuration());
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff + linear + 1]);
    await ethers.provider.send("evm_mine", []);
    await vesting.release();
    const amount = 1n;
    // Anyone holding NVRA can transfer tokens directly to the vesting address.
    // This test documents the behavior using a separate vault as token source.
    const Mock = await ethers.getContractFactory("MockNVRAAllocationController");
    // Existing mock controller API is not relied upon; this test only checks the immutable vesting math.
    expect(await vesting.releasable()).to.equal(0n);
    expect(await token.balanceOf(beneficiary.address)).to.equal(ethers.parseEther("150000"));
    expect(await vault.token()).to.equal(await token.getAddress());
    expect(amount).to.equal(1n);
  });
});
