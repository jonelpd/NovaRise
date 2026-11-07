const { expect } = require("chai");
const { ethers } = require("hardhat");

// Official Safe 1.4.1 contracts, ephemeral local signers; NO mainnet transactions.
describe("NVRA CREATE2 immutable vesting with official Safe 3-of-5", function () {
  async function setup() {
    const signers = await ethers.getSigners();
    const owners = signers.slice(0, 5);
    const outsider = signers[5], beneficiary = signers[6];
    const Singleton = await ethers.getContractFactory("Safe");
    const singleton = await Singleton.deploy();
    const ProxyFactory = await ethers.getContractFactory("SafeProxyFactory");
    const proxies = await ProxyFactory.deploy();
    const initializer = singleton.interface.encodeFunctionData("setup", [
      owners.map(s => s.address), 3, ethers.ZeroAddress, "0x",
      ethers.ZeroAddress, ethers.ZeroAddress, 0, ethers.ZeroAddress
    ]);
    const receipt = await (await proxies.createProxyWithNonce(await singleton.getAddress(), initializer, 904)).wait();
    const event = receipt.logs.map(log => {
      try { return proxies.interface.parseLog(log); } catch { return null; }
    }).find(log => log?.name === "ProxyCreation");
    expect(event).to.not.equal(undefined);
    const safe = singleton.attach(event.args.proxy);
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const Factory = await ethers.getContractFactory("NVRAAtomicImmutableVestingFactoryDraft");
    const factory = await Factory.deploy(await safe.getAddress(), beneficiary.address, now + 3600, 86400, 259200);
    await ethers.provider.send("evm_setNextBlockTimestamp", [now + 3600]);
    await factory.initialize();
    const token = await ethers.getContractAt("NVRAAtomicAllocationCandidate", await factory.token());
    const vesting = await ethers.getContractAt("NVRAImmutableBeneficiaryVestingDraft", await factory.vesting());
    const vault = await ethers.getContractAt("NVRAFactoryBoundVaultDraft", await factory.vaults(0));
    const args = [await vault.getAddress(), 0n, vault.interface.encodeFunctionData("release", [outsider.address, 10n]), 0, 0n, 0n, 0n, ethers.ZeroAddress, ethers.ZeroAddress];
    const hash = await safe.getTransactionHash(...args, await safe.nonce());
    const sigs = signers => ethers.hexlify(ethers.concat(
      [...signers].sort((a,b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()))
        .map(s => ethers.concat([ethers.zeroPadValue(s.address,32), ethers.ZeroHash, "0x01"]))
    ));
    return { owners, outsider, beneficiary, safe, factory, token, vesting, vault, args, hash, sigs };
  }

  it("binds four general vaults to genuine Safe, prefunds immutable vesting", async () => {
    const { safe, factory, token, vesting, beneficiary, vault } = await setup();
    expect(await safe.getThreshold()).to.equal(3n);
    expect((await safe.getOwners()).length).to.equal(5);
    expect(await vault.controller()).to.equal(await safe.getAddress());
    expect(await vesting.beneficiary()).to.equal(beneficiary.address);
    expect(await vesting.token()).to.equal(await token.getAddress());
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(ethers.parseEther("150000"));
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000"));
    expect(await token.balanceOf(await factory.vaults(3))).to.equal(0n);
  });

  it("rejects direct unauthorized vault calls and fewer than three Safe approvals", async () => {
    const { owners, outsider, safe, token, vault, args, hash, sigs } = await setup();
    await expect(vault.connect(outsider).release(outsider.address, 10n)).to.be.revertedWith("NVRA: controller only");
    for (const s of owners.slice(0,2)) await safe.connect(s).approveHash(hash);
    await expect(safe.connect(outsider).execTransaction(...args, sigs(owners.slice(0,2)))).to.be.reverted;
    expect(await token.balanceOf(outsider.address)).to.equal(0n);
  });

  it("three distinct owners can authorize once; replay and altered calldata fail", async () => {
    const { owners, outsider, safe, token, vault, args, hash, sigs } = await setup();
    for (const s of owners.slice(0,3)) await safe.connect(s).approveHash(hash);
    const altered = [...args];
    altered[2] = vault.interface.encodeFunctionData("release", [outsider.address, 100n]);
    await expect(safe.connect(outsider).execTransaction(...altered, sigs(owners.slice(0,3)))).to.be.reverted;
    await (await safe.connect(outsider).execTransaction(...args, sigs(owners.slice(0,3)))).wait();
    expect(await token.balanceOf(outsider.address)).to.equal(10n);
    expect(await safe.nonce()).to.equal(1n);
    await expect(safe.connect(outsider).execTransaction(...args, sigs(owners.slice(0,3)))).to.be.reverted;
  });

  it("rejects duplicate and non-owner approvals", async () => {
    const { owners, outsider, safe, args, hash, sigs } = await setup();
    for (const s of owners.slice(0,2)) await safe.connect(s).approveHash(hash);
    await expect(safe.connect(outsider).approveHash(hash)).to.be.reverted;
    const duplicate = ethers.hexlify(ethers.concat([sigs([owners[0]]), sigs([owners[0]]), sigs([owners[1]])]));
    await expect(safe.connect(outsider).execTransaction(...args, duplicate)).to.be.reverted;
    await expect(safe.connect(outsider).execTransaction(...args, sigs([owners[0], owners[1], outsider]))).to.be.reverted;
    expect(await safe.nonce()).to.equal(0n);
  });
});
