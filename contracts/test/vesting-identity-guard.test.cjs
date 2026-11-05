const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA vesting identity guard (local research only)", function () {
  async function setup() {
    const [beneficiary, outsider] = await ethers.getSigners();
    const block = await ethers.provider.getBlock("latest");
    const start = block.timestamp + 3600;
    const cliff = 86400;
    const linear = 3 * 86400;
    const duration = cliff + linear;
    const Vesting = await ethers.getContractFactory("NVRATeamVesting");
    const vesting = await Vesting.deploy(beneficiary.address, start, cliff, linear);
    const codehash = ethers.keccak256(await ethers.provider.getCode(await vesting.getAddress()));
    const Guard = await ethers.getContractFactory("NVRAVestingIdentityGuardDraft");
    const args = [await vesting.getAddress(), beneficiary.address, codehash, start, duration, cliff];
    return { beneficiary, outsider, vesting, Guard, args };
  }

  it("verifies the actual vesting runtime codehash, owner, start, duration and cliff", async function () {
    const { Guard, args } = await setup();
    const guard = await Guard.deploy(...args);
    await guard.verify();
    expect(await guard.expectedBeneficiary()).to.equal(args[1]);
    expect(await guard.expectedCodehash()).to.equal(args[2]);
  });

  it("rejects an unapproved runtime hash, wrong beneficiary and mismatched schedule", async function () {
    const { outsider, Guard, args } = await setup();
    await expect(Guard.deploy(...args.map((x, i) => i === 2 ? ethers.ZeroHash : x)))
      .to.be.revertedWith("NVRA: zero codehash");
    await expect(Guard.deploy(...args.map((x, i) => i === 2 ? ethers.keccak256("0x1234") : x)))
      .to.be.revertedWith("NVRA: vesting codehash mismatch");
    await expect(Guard.deploy(...args.map((x, i) => i === 1 ? outsider.address : x)))
      .to.be.revertedWith("NVRA: beneficiary mismatch");
    await expect(Guard.deploy(...args.map((x, i) => i === 3 ? x + 1 : x)))
      .to.be.revertedWith("NVRA: start mismatch");
    await expect(Guard.deploy(...args.map((x, i) => i === 4 ? x + 1 : x)))
      .to.be.revertedWith("NVRA: duration mismatch");
    await expect(Guard.deploy(...args.map((x, i) => i === 5 ? x + 1 : x)))
      .to.be.revertedWith("NVRA: cliff mismatch");
  });

  it("detects a beneficiary ownership transfer after initial verification", async function () {
    const { beneficiary, outsider, vesting, Guard, args } = await setup();
    const guard = await Guard.deploy(...args);
    await vesting.connect(beneficiary).transferOwnership(outsider.address);
    await expect(guard.verify()).to.be.revertedWith("NVRA: beneficiary mismatch");
  });

  it("rejects an EOA masquerading as a vesting contract", async function () {
    const { outsider, Guard, args } = await setup();
    await expect(Guard.deploy(...args.map((x, i) => i === 0 ? outsider.address : x)))
      .to.be.revertedWith("NVRA: vesting not contract");
  });
});
