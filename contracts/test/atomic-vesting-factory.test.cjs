const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA atomic factory with mandatory team vesting (local only)", function () {
  async function setup() {
    const [deployer, beneficiary, outsider] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRAAllocationController");
    const controller = await Controller.deploy();
    const block = await ethers.provider.getBlock("latest");
    const start = block.timestamp + 3600;
    const cliff = 86400;
    const linear = 3 * 86400;
    const Vesting = await ethers.getContractFactory("NVRATeamVesting");
    const vesting = await Vesting.deploy(beneficiary.address, start, cliff, linear);
    const Factory = await ethers.getContractFactory("NVRAAtomicVestingFactoryDraft");
    const factory = await Factory.deploy(await controller.getAddress(), await vesting.getAddress());
    return { deployer, beneficiary, outsider, controller, vesting, factory, start, cliff, linear };
  }

  it("atomically distributes 1m NVRA across four vaults and one restricted team vault", async function () {
    const { beneficiary, outsider, vesting, factory } = await setup();
    const predictions = [];
    for (let i = 0; i < 5; i++) predictions.push(await factory.predictVault(i));
    await expect(factory.connect(outsider).initialize()).to.be.revertedWith("NVRA: initializer only");
    await factory.initialize();
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const amounts = [300000, 250000, 200000, 150000, 100000];
    for (let i = 0; i < 5; i++) {
      expect(await factory.vaults(i)).to.equal(predictions[i]);
      expect(await token.balanceOf(predictions[i])).to.equal(ethers.parseUnits(String(amounts[i]), 18));
      if (i !== 3) {
        const vault = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", predictions[i]);
        expect(await vault.token()).to.equal(await token.getAddress());
      }
    }
    const team = await ethers.getContractAt("NVRATeamRestrictedVaultDraft", predictions[3]);
    expect(await team.token()).to.equal(await token.getAddress());
    expect(await team.vesting()).to.equal(await vesting.getAddress());
    expect(team.interface.hasFunction("release")).to.equal(false);
    expect(await token.balanceOf(beneficiary.address)).to.equal(0n);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
    await expect(factory.initialize()).to.be.revertedWith("NVRA: already initialized");
  });

  it("forces even an authorized controller to fund vesting, not the beneficiary directly", async function () {
    const { beneficiary, controller, vesting, factory, start, cliff, linear } = await setup();
    await factory.initialize();
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const team = await ethers.getContractAt("NVRATeamRestrictedVaultDraft", await factory.vaults(3));
    const amount = await team.CAP();
    await controller.execute(await team.getAddress(),
      team.interface.encodeFunctionData("releaseToVesting", [amount]));
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(amount);
    expect(await token.balanceOf(beneficiary.address)).to.equal(0n);
    expect(await team.released()).to.equal(amount);
    await expect(controller.execute(await team.getAddress(),
      team.interface.encodeFunctionData("releaseToVesting", [1n])))
      .to.be.revertedWith("NVRA: budget exceeded");
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff]);
    await ethers.provider.send("evm_mine", []);
    expect(await vesting["releasable(address)"](await token.getAddress())).to.equal(0n);
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff + linear + 1]);
    await ethers.provider.send("evm_mine", []);
    await vesting["release(address)"](await token.getAddress());
    expect(await token.balanceOf(beneficiary.address)).to.equal(amount);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("rejects invalid controller or vesting and unbound third-party calls", async function () {
    const { outsider, controller, vesting, factory } = await setup();
    const Factory = await ethers.getContractFactory("NVRAAtomicVestingFactoryDraft");
    await expect(Factory.deploy(outsider.address, await vesting.getAddress()))
      .to.be.revertedWith("NVRA: invalid controller");
    await expect(Factory.deploy(await controller.getAddress(), outsider.address))
      .to.be.revertedWith("NVRA: invalid vesting");
    await expect(factory.predictVault(5)).to.be.revertedWith("NVRA: invalid bucket");
  });
});
