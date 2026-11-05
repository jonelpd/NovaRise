const { expect } = require("chai");
const { ethers } = require("hardhat");

// Official Safe 1.4.1 implementation and proxy; ephemeral Hardhat signers.
// The Safe is the controller, NOT the holder of the initial NVRA supply.
describe("NVRA atomic vaults with official Safe 3-of-5 (local only)", function () {
  async function setup() {
    const signers = await ethers.getSigners();
    const owners = signers.slice(0, 5);
    const outsider = signers[5];
    const recipient = signers[6];

    const Singleton = await ethers.getContractFactory("Safe");
    const singleton = await Singleton.deploy();
    const ProxyFactory = await ethers.getContractFactory("SafeProxyFactory");
    const proxyFactory = await ProxyFactory.deploy();
    const initializer = singleton.interface.encodeFunctionData("setup", [
      owners.map(x => x.address), 3, ethers.ZeroAddress, "0x",
      ethers.ZeroAddress, ethers.ZeroAddress, 0, ethers.ZeroAddress
    ]);
    const receipt = await (await proxyFactory.createProxyWithNonce(
      await singleton.getAddress(), initializer, 500
    )).wait();
    const event = receipt.logs.map(log => {
      try { return proxyFactory.interface.parseLog(log); } catch { return null; }
    }).find(log => log?.name === "ProxyCreation");
    expect(event).to.not.equal(undefined);
    const safe = singleton.attach(event.args.proxy);
    const Factory = await ethers.getContractFactory("NVRAAtomicFactoryDraft");
    const factory = await Factory.deploy(await safe.getAddress());
    await factory.initialize();
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());

    async function signatures(signers) {
      return ethers.hexlify(ethers.concat(
        [...signers].sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()))
          .map(s => ethers.concat([ethers.zeroPadValue(s.address, 32), ethers.ZeroHash, "0x01"]))
      ));
    }
    async function executeVault(bucket, to, amount, approvedOwners = owners.slice(0, 3)) {
      const vault = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", await factory.vaults(bucket));
      const data = vault.interface.encodeFunctionData("release", [to, amount]);
      const args = [await vault.getAddress(), 0n, data, 0, 0n, 0n, 0n, ethers.ZeroAddress, ethers.ZeroAddress];
      const hash = await safe.getTransactionHash(...args, await safe.nonce());
      for (const signer of approvedOwners) await safe.connect(signer).approveHash(hash);
      return safe.connect(outsider).execTransaction(...args, await signatures(approvedOwners));
    }
    return { owners, outsider, recipient, safe, factory, token, executeVault };
  }

  it("mints fixed supply only to the five vaults, not to the Safe", async function () {
    const { safe, factory, token } = await setup();
    expect(await safe.getThreshold()).to.equal(3n);
    expect((await safe.getOwners()).length).to.equal(5);
    expect(await token.balanceOf(await safe.getAddress())).to.equal(0n);
    let sum = 0n;
    for (let i = 0; i < 5; i++) sum += await token.balanceOf(await factory.vaults(i));
    expect(sum).to.equal(ethers.parseUnits("1000000", 18));
    expect(await token.totalSupply()).to.equal(sum);
  });

  it("rejects outsider direct vault releases and Safe transactions with fewer than three approvals", async function () {
    const { owners, outsider, recipient, safe, factory, token } = await setup();
    const vault = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", await factory.vaults(0));
    await expect(vault.connect(outsider).release(recipient.address, 1n)).to.be.revertedWith("NVRA: controller only");
    const data = vault.interface.encodeFunctionData("release", [recipient.address, 1n]);
    const args = [vault.target, 0n, data, 0, 0n, 0n, 0n, ethers.ZeroAddress, ethers.ZeroAddress];
    const hash = await safe.getTransactionHash(...args, await safe.nonce());
    for (const signer of owners.slice(0, 2)) await safe.connect(signer).approveHash(hash);
    const sigs = ethers.hexlify(ethers.concat(
      owners.slice(0, 2).sort((a,b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()))
        .map(s => ethers.concat([ethers.zeroPadValue(s.address, 32), ethers.ZeroHash, "0x01"]))
    ));
    await expect(safe.connect(outsider).execTransaction(...args, sigs)).to.be.reverted;
    expect(await token.balanceOf(recipient.address)).to.equal(0n);
    expect(await vault.released()).to.equal(0n);
  });

  it("requires three distinct Safe owners for team payout and respects team cap", async function () {
    const { recipient, safe, factory, token, executeVault } = await setup();
    const team = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", await factory.vaults(3));
    const amount = await team.cap();
    const receipt = await (await executeVault(3, recipient.address, amount)).wait();
    const failures = receipt.logs.filter(log => {
      try { return safe.interface.parseLog(log)?.name === "ExecutionFailure"; } catch { return false; }
    });
    expect(failures.length).to.equal(0);
    expect(await token.balanceOf(recipient.address)).to.equal(amount);
    expect(await team.released()).to.equal(amount);
    expect(await token.balanceOf(await safe.getAddress())).to.equal(0n);
    await executeVault(3, recipient.address, 1n);
    expect(await team.released()).to.equal(amount);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
  });
});
