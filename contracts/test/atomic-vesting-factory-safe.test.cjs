const { expect } = require("chai");
const { ethers } = require("hardhat");

// Uses official Safe 1.4.1 singleton + proxy, ephemeral local Hardhat keys only.
describe("NVRA mixed atomic factory + official Safe + team vesting (local only)", function () {
  async function setup() {
    const signers = await ethers.getSigners();
    const owners = signers.slice(0, 5);
    const outsider = signers[5];
    const beneficiary = signers[6];
    const Singleton = await ethers.getContractFactory("Safe");
    const singleton = await Singleton.deploy();
    const ProxyFactory = await ethers.getContractFactory("SafeProxyFactory");
    const proxyFactory = await ProxyFactory.deploy();
    const initializer = singleton.interface.encodeFunctionData("setup", [
      owners.map(x => x.address), 3, ethers.ZeroAddress, "0x",
      ethers.ZeroAddress, ethers.ZeroAddress, 0, ethers.ZeroAddress
    ]);
    const receipt = await (await proxyFactory.createProxyWithNonce(
      await singleton.getAddress(), initializer, 803
    )).wait();
    const event = receipt.logs.map(log => {
      try { return proxyFactory.interface.parseLog(log); } catch { return null; }
    }).find(log => log?.name === "ProxyCreation");
    expect(event).to.not.equal(undefined);
    const safe = singleton.attach(event.args.proxy);

    const block = await ethers.provider.getBlock("latest");
    const start = block.timestamp + 3600;
    const cliff = 86400;
    const linear = 3 * 86400;
    const Vesting = await ethers.getContractFactory("NVRATeamVesting");
    const vesting = await Vesting.deploy(beneficiary.address, start, cliff, linear);
    const Factory = await ethers.getContractFactory("NVRAAtomicVestingFactoryDraft");
    const factory = await Factory.deploy(await safe.getAddress(), await vesting.getAddress());
    await factory.initialize();
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const team = await ethers.getContractAt("NVRATeamRestrictedVaultDraft", await factory.vaults(3));

    async function execSafe(target, data, approvers = owners.slice(0, 3)) {
      const args = [target, 0n, data, 0, 0n, 0n, 0n, ethers.ZeroAddress, ethers.ZeroAddress];
      const hash = await safe.getTransactionHash(...args, await safe.nonce());
      for (const signer of approvers) await safe.connect(signer).approveHash(hash);
      const sigs = ethers.hexlify(ethers.concat(
        [...approvers].sort((a,b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()))
          .map(s => ethers.concat([ethers.zeroPadValue(s.address, 32), ethers.ZeroHash, "0x01"]))
      ));
      return safe.connect(outsider).execTransaction(...args, sigs);
    }
    return { owners, outsider, beneficiary, safe, vesting, factory, token, team, start, cliff, linear, execSafe };
  }

  it("initializes all five allocations under Safe control, with an immutable team vesting destination", async function () {
    const { safe, vesting, factory, token, team, beneficiary } = await setup();
    expect(await safe.getThreshold()).to.equal(3n);
    expect((await safe.getOwners()).length).to.equal(5);
    expect(await factory.controller()).to.equal(await safe.getAddress());
    expect(await team.controller()).to.equal(await safe.getAddress());
    expect(await team.vesting()).to.equal(await vesting.getAddress());
    expect(team.interface.hasFunction("release")).to.equal(false);
    expect(await token.balanceOf(beneficiary.address)).to.equal(0n);
    const allocations = [300000, 250000, 200000, 150000, 100000];
    for (let i = 0; i < 5; i++) {
      expect(await token.balanceOf(await factory.vaults(i))).to.equal(ethers.parseUnits(String(allocations[i]), 18));
    }
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
    expect(await token.balanceOf(await safe.getAddress())).to.equal(0n);
  });

  it("blocks outsider direct team release and fewer-than-three Safe approvals", async function () {
    const { owners, outsider, beneficiary, safe, team, token } = await setup();
    await expect(team.connect(outsider).releaseToVesting(1n)).to.be.revertedWith("NVRA: controller only");
    const data = team.interface.encodeFunctionData("releaseToVesting", [1n]);
    const args = [await team.getAddress(), 0n, data, 0, 0n, 0n, 0n, ethers.ZeroAddress, ethers.ZeroAddress];
    const hash = await safe.getTransactionHash(...args, await safe.nonce());
    for (const signer of owners.slice(0, 2)) await safe.connect(signer).approveHash(hash);
    const sigs = ethers.hexlify(ethers.concat(
      [...owners.slice(0, 2)].sort((a,b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()))
        .map(s => ethers.concat([ethers.zeroPadValue(s.address, 32), ethers.ZeroHash, "0x01"]))
    ));
    await expect(safe.connect(outsider).execTransaction(...args, sigs)).to.be.reverted;
    expect(await token.balanceOf(beneficiary.address)).to.equal(0n);
    expect(await team.released()).to.equal(0n);
  });

  it("three Safe approvals can fund only vesting; cliff locks beneficiary and team cap holds", async function () {
    const { beneficiary, safe, vesting, token, team, start, cliff, linear, execSafe } = await setup();
    const amount = await team.CAP();
    const data = team.interface.encodeFunctionData("releaseToVesting", [amount]);
    const receipt = await (await execSafe(await team.getAddress(), data)).wait();
    const failures = receipt.logs.filter(log => {
      try { return safe.interface.parseLog(log)?.name === "ExecutionFailure"; } catch { return false; }
    });
    expect(failures.length).to.equal(0);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(amount);
    expect(await token.balanceOf(beneficiary.address)).to.equal(0n);
    expect(await team.released()).to.equal(amount);
    await expect(execSafe(await team.getAddress(),
      team.interface.encodeFunctionData("releaseToVesting", [1n]))).to.be.revertedWith("GS013");
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff]);
    await ethers.provider.send("evm_mine", []);
    expect(await vesting["releasable(address)"](await token.getAddress())).to.equal(0n);
    await ethers.provider.send("evm_setNextBlockTimestamp", [start + cliff + linear + 1]);
    await ethers.provider.send("evm_mine", []);
    await vesting["release(address)"](await token.getAddress());
    expect(await token.balanceOf(beneficiary.address)).to.equal(amount);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("records a limitation: Safe approvals cannot redirect the team vault to a different recipient", async function () {
    const { outsider, team, execSafe, token, vesting } = await setup();
    const arbitrary = team.interface.getFunction("release");
    expect(arbitrary).to.equal(null);
    const amount = ethers.parseUnits("100", 18);
    const receipt = await (await execSafe(await team.getAddress(),
      team.interface.encodeFunctionData("releaseToVesting", [amount]))).wait();
    expect(receipt.status).to.equal(1);
    expect(await token.balanceOf(outsider.address)).to.equal(0n);
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(amount);
  });
});
