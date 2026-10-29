const { expect } = require("chai");
const { ethers } = require("hardhat");

// Uses official Safe 1.4.1 contracts, not a mocked signature counter.
// Ephemeral local Hardhat accounts only; never use production signer keys.
describe("NovaRise official Safe 3-of-5 (local simulation only)", function () {
  let safe, token, owners, outsider, recipient;

  async function signatures(signers) {
    return ethers.hexlify(ethers.concat(
      [...signers].sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()))
        .map(s => ethers.concat([
          ethers.zeroPadValue(s.address, 32),
          ethers.ZeroHash,
          "0x01" // approved-hash signature: owner must call approveHash first
        ]))
    ));
  }

  async function transferPayload(to, amount) {
    const data = token.interface.encodeFunctionData("transfer", [to, amount]);
    const nonce = await safe.nonce();
    const args = [await token.getAddress(), 0n, data, 0, 0n, 0n, 0n, ethers.ZeroAddress, ethers.ZeroAddress];
    const hash = await safe.getTransactionHash(...args, nonce);
    return { args, hash };
  }

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    owners = signers.slice(0, 5);
    outsider = signers[5];
    recipient = signers[6];

    const Singleton = await ethers.getContractFactory("Safe");
    const singleton = await Singleton.deploy();
    const Factory = await ethers.getContractFactory("SafeProxyFactory");
    const factory = await Factory.deploy();
    const initializer = singleton.interface.encodeFunctionData("setup", [
      owners.map(s => s.address), 3, ethers.ZeroAddress, "0x",
      ethers.ZeroAddress, ethers.ZeroAddress, 0, ethers.ZeroAddress
    ]);
    const receipt = await (await factory.createProxyWithNonce(
      await singleton.getAddress(), initializer, 42
    )).wait();
    const event = receipt.logs.map(log => {
      try { return factory.interface.parseLog(log); } catch { return null; }
    }).find(log => log && log.name === "ProxyCreation");
    expect(event, "official Safe proxy creation event").to.not.equal(undefined);
    safe = Singleton.attach(event.args.proxy);

    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    token = await Token.deploy(await safe.getAddress());
  });

  it("creates a genuine Safe proxy with 5 owners, threshold 3 and fixed NVRA supply", async function () {
    expect(await safe.getThreshold()).to.equal(3n);
    const actual = (await safe.getOwners()).map(x => x.toLowerCase()).sort();
    expect(actual).to.deep.equal(owners.map(x => x.address.toLowerCase()).sort());
    const supply = ethers.parseUnits("1000000", 18);
    expect(await token.totalSupply()).to.equal(supply);
    expect(await token.balanceOf(await safe.getAddress())).to.equal(supply);
  });

  it("rejects 1 or 2 approvals; 3 distinct owner approvals execute once and replay fails", async function () {
    const amount = ethers.parseUnits("250", 18);
    const { args, hash } = await transferPayload(recipient.address, amount);
    await expect(safe.connect(outsider).approveHash(hash)).to.be.reverted;
    for (const signer of owners.slice(0, 3)) {
      await safe.connect(signer).approveHash(hash);
    }
    for (const count of [1, 2]) {
      await expect(safe.connect(outsider).execTransaction(
        ...args, await signatures(owners.slice(0, count))
      )).to.be.reverted;
    }
    const sigs = await signatures(owners.slice(0, 3));
    await safe.connect(outsider).execTransaction(...args, sigs);
    expect(await token.balanceOf(recipient.address)).to.equal(amount);
    expect(await token.balanceOf(await safe.getAddress())).to.equal(
      ethers.parseUnits("999750", 18)
    );
    expect(await safe.nonce()).to.equal(1n);
    await expect(safe.connect(outsider).execTransaction(...args, sigs)).to.be.reverted;
    expect(await token.balanceOf(recipient.address)).to.equal(amount);
  });

  it("cannot execute a token transfer with a non-owner signature", async function () {
    const { args, hash } = await transferPayload(recipient.address, 1n);
    for (const signer of owners.slice(0, 2)) await safe.connect(signer).approveHash(hash);
    await expect(safe.connect(outsider).execTransaction(
      ...args, await signatures([owners[0], owners[1], outsider])
    )).to.be.reverted;
    expect(await token.balanceOf(recipient.address)).to.equal(0n);
  });
});
