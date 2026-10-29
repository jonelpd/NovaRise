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

  async function executeSafeTransaction(target, data, signers = owners.slice(0, 3)) {
    const args = [target, 0n, data, 0, 0n, 0n, 0n, ethers.ZeroAddress, ethers.ZeroAddress];
    const hash = await safe.getTransactionHash(...args, await safe.nonce());
    for (const signer of signers) await safe.connect(signer).approveHash(hash);
    const receipt = await (await safe.connect(outsider).execTransaction(...args, await signatures(signers))).wait();
    const failed = receipt.logs.some(log => {
      try { return safe.interface.parseLog(log)?.name === "ExecutionFailure"; } catch { return false; }
    });
    expect(failed, "Safe transaction must not fail internally").to.equal(false);
    return receipt;
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
  it("prevents outsiders from changing threshold directly; 3 owners can authorize a threshold change", async function () {
    await expect(safe.connect(outsider).changeThreshold(2)).to.be.reverted;
    await expect(safe.connect(owners[0]).changeThreshold(2)).to.be.reverted;
    expect(await safe.getThreshold()).to.equal(3n);
    const data = safe.interface.encodeFunctionData("changeThreshold", [4]);
    await executeSafeTransaction(await safe.getAddress(), data);
    expect(await safe.getThreshold()).to.equal(4n);
    const { args, hash } = await transferPayload(recipient.address, 1n);
    for (const signer of owners.slice(0, 3)) await safe.connect(signer).approveHash(hash);
    await expect(safe.connect(outsider).execTransaction(
      ...args, await signatures(owners.slice(0, 3))
    )).to.be.reverted;
    expect(await token.balanceOf(recipient.address)).to.equal(0n);
  });

  it("requires Safe approval to rotate an owner and revokes the former owner's authority", async function () {
    const previous = owners[0];
    const replacement = recipient;
    await expect(safe.connect(outsider).swapOwner(
      "0x0000000000000000000000000000000000000001", previous.address, replacement.address
    )).to.be.reverted;
    const data = safe.interface.encodeFunctionData("swapOwner", [
      "0x0000000000000000000000000000000000000001", previous.address, replacement.address
    ]);
    await executeSafeTransaction(await safe.getAddress(), data);
    expect(await safe.isOwner(previous.address)).to.equal(false);
    expect(await safe.isOwner(replacement.address)).to.equal(true);
    const { args, hash } = await transferPayload(outsider.address, 1n);
    for (const signer of owners.slice(1, 3)) await safe.connect(signer).approveHash(hash);
    await expect(safe.connect(previous).approveHash(hash)).to.be.reverted;
    await safe.connect(replacement).approveHash(hash);
    await expect(safe.connect(outsider).execTransaction(
      ...args, await signatures([previous, owners[1], owners[2]])
    )).to.be.reverted;
    await executeSafeTransaction(await token.getAddress(),
      token.interface.encodeFunctionData("transfer", [outsider.address, 1n]),
      [replacement, owners[1], owners[2]]);
    expect(await token.balanceOf(outsider.address)).to.equal(1n);
  });

  it("funds team vesting through 3 Safe approvals and prevents premature release", async function () {
    const latest = await ethers.provider.getBlock("latest");
    const start = BigInt(latest.timestamp) + 100n;
    const cliff = 200n;
    const linear = 400n;
    const Vesting = await ethers.getContractFactory("NVRATeamVesting");
    const vest = await Vesting.deploy(recipient.address, start, cliff, linear);
    const amount = ethers.parseUnits("150000", 18);
    const data = token.interface.encodeFunctionData("transfer", [await vest.getAddress(), amount]);
    await executeSafeTransaction(await token.getAddress(), data);
    expect(await token.balanceOf(await vest.getAddress())).to.equal(amount);
    expect(await token.balanceOf(await safe.getAddress())).to.equal(ethers.parseUnits("850000", 18));
    await ethers.provider.send("evm_setNextBlockTimestamp", [Number(start + cliff)]);
    await ethers.provider.send("evm_mine", []);
    expect(await vest["releasable(address)"](await token.getAddress())).to.equal(0n);
    await ethers.provider.send("evm_setNextBlockTimestamp", [Number(start + cliff + linear + 1n)]);
    await ethers.provider.send("evm_mine", []);
    await vest.connect(recipient)["release(address)"](await token.getAddress());
    expect(await token.balanceOf(recipient.address)).to.equal(amount);
    expect(await token.totalSupply()).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("rejects duplicate owner signatures even when three slots are supplied", async function () {
    const { args, hash } = await transferPayload(recipient.address, 10n);
    for (const owner of owners.slice(0, 2)) await safe.connect(owner).approveHash(hash);
    const duplicate = ethers.hexlify(ethers.concat([
      await signatures([owners[0]]),
      await signatures([owners[0]]),
      await signatures([owners[1]])
    ]));
    await expect(safe.connect(outsider).execTransaction(...args, duplicate)).to.be.reverted;
    expect(await safe.nonce()).to.equal(0n);
    expect(await token.balanceOf(recipient.address)).to.equal(0n);
  });

  it("rejects altered recipient and amount when approvals bind a different transaction hash", async function () {
    const original = await transferPayload(recipient.address, 10n);
    for (const owner of owners.slice(0, 3)) await safe.connect(owner).approveHash(original.hash);
    const malicious = token.interface.encodeFunctionData("transfer", [outsider.address, 999n]);
    const alteredArgs = [...original.args];
    alteredArgs[2] = malicious;
    await expect(safe.connect(outsider).execTransaction(
      ...alteredArgs, await signatures(owners.slice(0, 3))
    )).to.be.reverted;
    expect(await safe.nonce()).to.equal(0n);
    expect(await token.balanceOf(outsider.address)).to.equal(0n);
    expect(await token.balanceOf(await safe.getAddress())).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("preserves the fixed total supply across several authorized Safe transfers", async function () {
    const supply = ethers.parseUnits("1000000", 18);
    let sent = 0n;
    for (const amount of [1n, 25n, 1000n, ethers.parseUnits("100", 18)]) {
      const data = token.interface.encodeFunctionData("transfer", [recipient.address, amount]);
      await executeSafeTransaction(await token.getAddress(), data);
      sent += amount;
      expect(await token.totalSupply()).to.equal(supply);
      expect(await token.balanceOf(await safe.getAddress())).to.equal(supply - sent);
      expect(await token.balanceOf(recipient.address)).to.equal(sent);
    }
    expect(await safe.nonce()).to.equal(4n);
  });

});
