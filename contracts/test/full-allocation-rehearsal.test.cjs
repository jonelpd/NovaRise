const { expect } = require("chai");
const { ethers, network } = require("hardhat");

describe("NVRA full allocation rehearsal (local Amoy-equivalent architecture)", function () {
  it("funds all five buckets, enforces caps, and preserves fixed supply", async function () {
    const signers = await ethers.getSigners();
    const [operator, team, ecosystemRecipient, developmentRecipient, communityRecipient] = signers;
    const Safe = await ethers.getContractFactory("Safe");
    const singleton = await Safe.deploy();
    const Factory = await ethers.getContractFactory("SafeProxyFactory");
    const factory = await Factory.deploy();
    const owners = signers.slice(0, 5);
    const initializer = singleton.interface.encodeFunctionData("setup", [
      owners.map(s => s.address), 3, ethers.ZeroAddress, "0x",
      ethers.ZeroAddress, ethers.ZeroAddress, 0, ethers.ZeroAddress
    ]);
    const receipt = await (await factory.createProxyWithNonce(await singleton.getAddress(), initializer, 20261029)).wait();
    const creation = receipt.logs.map(log => { try { return factory.interface.parseLog(log); } catch { return null; } })
      .find(x => x?.name === "ProxyCreation");
    expect(creation).to.not.equal(undefined);
    const safe = singleton.attach(creation.args.proxy);
    expect(await safe.getThreshold()).to.equal(3n);

    const Token = await ethers.getContractFactory("NVRAMainnetCandidate");
    const token = await Token.deploy(await safe.getAddress());
    const tokenAddress = await token.getAddress();
    const supply = ethers.parseUnits("1000000", 18);
    expect(await token.balanceOf(await safe.getAddress())).to.equal(supply);
    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const start = now + 10000;
    const Vault = await ethers.getContractFactory("NVRABudgetVault");
    const configs = [
      { allocation: 300000, periods: 96, cap: 3125, seconds: 30 * 86400, recipient: ecosystemRecipient },
      { allocation: 250000, periods: 20, cap: 12500, seconds: 90 * 86400, recipient: developmentRecipient },
      { allocation: 200000, periods: 16, cap: 12500, seconds: 90 * 86400, recipient: communityRecipient }
    ];
    const vaults = [];
    for (const c of configs) {
      const vault = await Vault.deploy(tokenAddress, await safe.getAddress(), start, c.seconds, c.periods, ethers.parseUnits(String(c.cap), 18));
      expect(await vault.totalAllocation()).to.equal(ethers.parseUnits(String(c.allocation), 18));
      vaults.push(vault);
    }
    const Vesting = await ethers.getContractFactory("NVRATeamVesting");
    const vesting = await Vesting.deploy(team.address, start, 365 * 86400, 3 * 365 * 86400);

    const signatures = (list) => ethers.hexlify(ethers.concat([...list]
      .sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()))
      .map(s => ethers.concat([ethers.zeroPadValue(s.address, 32), ethers.ZeroHash, "0x01"]))));
    async function safeTransfer(destination, amount) {
      const data = token.interface.encodeFunctionData("transfer", [destination, amount]);
      const args = [tokenAddress, 0n, data, 0, 0n, 0n, 0n, ethers.ZeroAddress, ethers.ZeroAddress];
      const hash = await safe.getTransactionHash(...args, await safe.nonce());
      for (const signer of owners.slice(0, 3)) await (await safe.connect(signer).approveHash(hash)).wait();
      const tx = await (await safe.connect(operator).execTransaction(...args, signatures(owners.slice(0, 3)))).wait();
      const failed = tx.logs.some(log => { try { return safe.interface.parseLog(log)?.name === "ExecutionFailure"; } catch { return false; } });
      expect(failed, "Safe transfer execution failed").to.equal(false);
    }

    for (let i = 0; i < vaults.length; i++) {
      await safeTransfer(await vaults[i].getAddress(), ethers.parseUnits(String(configs[i].allocation), 18));
    }
    await safeTransfer(await vesting.getAddress(), ethers.parseUnits("150000", 18));
    // Liquidity allocation remains in the Safe; it is not technically timelocked.
    expect(await token.balanceOf(await safe.getAddress())).to.equal(ethers.parseUnits("100000", 18));
    expect(await token.balanceOf(await vesting.getAddress())).to.equal(ethers.parseUnits("150000", 18));
    for (let i = 0; i < vaults.length; i++) {
      expect(await token.balanceOf(await vaults[i].getAddress())).to.equal(ethers.parseUnits(String(configs[i].allocation), 18));
    }
    expect(await vesting["vestedAmount(address,uint64)"](tokenAddress, start + 365 * 86400)).to.equal(0n);
    expect(await vesting["vestedAmount(address,uint64)"](tokenAddress, start + 4 * 365 * 86400)).to.equal(ethers.parseUnits("150000", 18));
    await expect(vaults[0].disburse(ecosystemRecipient.address, 1n)).to.be.revertedWith("NVRA: only controller");
    expect(await token.totalSupply()).to.equal(supply);
    expect(await safe.nonce()).to.equal(4n);
  });
});
