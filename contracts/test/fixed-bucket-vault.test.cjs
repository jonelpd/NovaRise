const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NVRA immutable bucket vault binding (local research only)", function () {
  async function setup() {
    const [deployer, recipient, outsider] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRAAllocationController");
    const controller = await Controller.deploy();
    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    // Five vault deployments, then the token deployment by the same signer.
    // A changed nonce or deployer invalidates this prediction.
    const expectedToken = ethers.getCreateAddress({ from: deployer.address, nonce: nonce + 5 });
    const Vault = await ethers.getContractFactory("NVRAFixedBucketVaultDraft");
    const vaults = [];
    for (let i = 0; i < 5; i++) {
      vaults.push(await Vault.deploy(expectedToken, await controller.getAddress(), i));
    }
    const Token = await ethers.getContractFactory("NVRAAtomicAllocationCandidate");
    const token = await Token.deploy(await Promise.all(vaults.map(v => v.getAddress())));
    const execute = async (bucket, to, amount) =>
      controller.execute(await vaults[bucket].getAddress(),
        vaults[bucket].interface.encodeFunctionData("release", [to, amount]));
    return { deployer, recipient, outsider, controller, vaults, token, expectedToken, execute };
  }

  it("binds all five purpose-specific vaults to the exact future NVRA address", async function () {
    const { token, vaults, expectedToken } = await setup();
    expect(await token.getAddress()).to.equal(expectedToken);
    const amounts = [300000, 250000, 200000, 150000, 100000];
    for (let i = 0; i < 5; i++) {
      expect(await vaults[i].token()).to.equal(expectedToken);
      expect(await vaults[i].bucket()).to.equal(BigInt(i));
      expect(await vaults[i].cap()).to.equal(ethers.parseUnits(String(amounts[i]), 18));
      expect(await token.balanceOf(await vaults[i].getAddress())).to.equal(await vaults[i].cap());
    }
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("rejects unauthorized withdrawals and cannot release above a bucket ceiling", async function () {
    const { token, vaults, recipient, outsider, execute } = await setup();
    await expect(vaults[3].connect(outsider).release(recipient.address, 1n))
      .to.be.revertedWith("NVRA: controller only");
    const amount = await vaults[3].cap();
    await expect(execute(3, recipient.address, amount + 1n)).to.be.revertedWith("NVRA: budget exceeded");
    await execute(3, recipient.address, amount);
    expect(await token.balanceOf(recipient.address)).to.equal(amount);
    expect(await vaults[3].remaining()).to.equal(0n);
    await expect(execute(3, recipient.address, 1n)).to.be.revertedWith("NVRA: budget exceeded");
    await expect(execute(0, ethers.ZeroAddress, 1n)).to.be.revertedWith("NVRA: invalid recipient");
  });

  it("demonstrates that a wrong token prediction strands the intended allocation", async function () {
    const [deployer, recipient] = await ethers.getSigners();
    const Controller = await ethers.getContractFactory("MockNVRAAllocationController");
    const controller = await Controller.deploy();
    const Vault = await ethers.getContractFactory("NVRAFixedBucketVaultDraft");
    const wrongToken = ethers.getCreateAddress({ from: deployer.address, nonce: 999999 });
    const vault = await Vault.deploy(wrongToken, await controller.getAddress(), 3);
    await expect(controller.execute(await vault.getAddress(),
      vault.interface.encodeFunctionData("release", [recipient.address, 1n])))
      .to.be.revertedWith("NVRA: token not deployed");
    expect(await vault.token()).to.equal(wrongToken);
    // No rebinding exists; production deployment must validate deterministic addresses.
  });
});
