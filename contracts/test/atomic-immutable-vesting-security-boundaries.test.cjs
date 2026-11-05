const { expect } = require("chai");
const { ethers } = require("hardhat");

// Adversarial local-only tests: demonstrating an actual risk is not a production approval.
describe("NVRA immutable CREATE2 factory security boundaries", () => {
  async function fixture() {
    const [, beneficiary, outsider] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRAAllocationController");
    const controller = await Controller.deploy();
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const Factory = await ethers.getContractFactory("NVRAAtomicImmutableVestingFactoryDraft");
    const factory = await Factory.deploy(await controller.getAddress(), beneficiary.address, now + 3600, 86400, 259200);
    await factory.initialize();
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const vesting = await ethers.getContractAt("NVRAImmutableBeneficiaryVestingDraft", await factory.vesting());
    return { beneficiary, outsider, controller, factory, token, vesting };
  }

  it("documents arbitrary controller acceptance: deployed code is not Safe authentication", async () => {
    const { controller, factory } = await fixture();
    expect(await factory.controller()).to.equal(await controller.getAddress());
    // This mock has no Safe 3-of-5 approvals: the production identity check remains a P0 blocker.
  });

  it("does not release unsolicited tokens after the fixed allocation has vested", async () => {
    const { beneficiary, outsider, token, vesting } = await fixture();
    const end = Number(await vesting.start()) + Number(await vesting.cliffDuration()) +
      Number(await vesting.linearDuration()) + 1;
    await ethers.provider.send("evm_setNextBlockTimestamp", [end]);
    await ethers.provider.send("evm_mine", []);
    await vesting.connect(outsider).release();
    const initial = ethers.parseEther("150000");
    expect(await token.balanceOf(beneficiary.address)).to.equal(initial);
    expect(await vesting.releasable()).to.equal(0n);

    // Ordinary ERC20 transfers can still arrive; excess is intentionally NOT releasable.
    const unexpected = ethers.parseEther("7");
    await token.connect(beneficiary).transfer(await vesting.getAddress(), unexpected);
    expect(await vesting.releasable()).to.equal(0n);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(unexpected);
    await expect(vesting.connect(outsider).release()).to.be.revertedWith("NVRA: nothing releasable");
    expect(await token.balanceOf(beneficiary.address)).to.equal(initial - unexpected);
    expect(await vesting.releasable()).to.equal(0n);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(unexpected);
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000"));
  });

  it("keeps the original team allocation fixed even if surplus arrives before cliff", async () => {
    const { beneficiary, token, vesting } = await fixture();
    expect(await vesting.TEAM_ALLOCATION()).to.equal(ethers.parseEther("150000"));
    await token.connect(beneficiary).transfer(await vesting.getAddress(), 0n);
    expect(await vesting.vestedAmount(0)).to.equal(0n);
    expect(await vesting.releasable()).to.equal(0n);
  });

  it("rejects second initialization and unauthorized factory initialization", async () => {
    const { factory, outsider } = await fixture();
    await expect(factory.connect(outsider).initialize()).to.be.reverted;
    await expect(factory.initialize()).to.be.reverted;
  });
});
