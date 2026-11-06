#!/usr/bin/env node
"use strict";
/** Read-only Base quote for the factory creation transaction.
 * BASE_MAINNET_RPC_URL must be an HTTPS Base Mainnet RPC endpoint.
 * No wallet key, signing, funding, or broadcasting.
 */
const fs = require("node:fs");
const path = require("node:path");
const { ethers } = require("ethers");
const RPC = process.env.BASE_MAINNET_RPC_URL;
const FROM = "0x89316a3553Da9315a720e25915d731AfD11d0B16";
const SAFE = "0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd";
const START = 1793923200;
const DAY = 86400;
const ORACLE = "0x420000000000000000000000000000000000000F";
const GAS_LOCAL_DEPLOY = 3060359n, GAS_LOCAL_INIT = 3101070n;
async function main() {
  if (!RPC || !/^https:\/\//.test(RPC)) throw Error("Set BASE_MAINNET_RPC_URL to an HTTPS Base Mainnet RPC endpoint");
  const provider = new ethers.JsonRpcProvider(RPC, 8453, { staticNetwork: true });
  const net = await provider.getNetwork();
  if (net.chainId !== 8453n) throw Error("Not Base Mainnet");
  const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/src/NVRAAtomicImmutableVestingFactoryDraft.sol/NVRAAtomicImmutableVestingFactoryDraft.json"), "utf8"));
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode);
  const tx = await factory.getDeployTransaction(SAFE, FROM, START, 365 * DAY, 1095 * DAY);
  const fee = await provider.getFeeData();
  if (!fee.maxFeePerGas || !fee.maxPriorityFeePerGas) throw Error("Missing EIP-1559 fee quote");
  const nonce = await provider.getTransactionCount(FROM);
  const unsigned = ethers.Transaction.from({
    type: 2, chainId: 8453, nonce, gasLimit: GAS_LOCAL_DEPLOY * 130n / 100n,
    maxFeePerGas: fee.maxFeePerGas, maxPriorityFeePerGas: fee.maxPriorityFeePerGas,
    data: tx.data, value: 0
  }).unsignedSerialized;
  const oracle = new ethers.Contract(ORACLE, [
    "function getL1Fee(bytes) view returns (uint256)",
    "function getL1FeeUpperBound(uint256) view returns (uint256)",
    "function getOperatorFee(uint256) view returns (uint256)"
  ], provider);
  const byteLength = ethers.getBytes(unsigned).length;
  const [l1Estimate, l1UpperBound, l2GasEstimate] = await Promise.all([
    oracle.getL1Fee(unsigned),
    oracle.getL1FeeUpperBound(byteLength),
    provider.estimateGas({ from: FROM, data: tx.data, value: 0n })
  ]);
  const bufferedDeployGas = l2GasEstimate * 130n / 100n;
  const bufferedInitializeGas = GAS_LOCAL_INIT * 130n / 100n;
  const bufferedL2Cost = (bufferedDeployGas + bufferedInitializeGas) * fee.maxFeePerGas;
  const operatorDeploy = await oracle.getOperatorFee(bufferedDeployGas);
  const operatorInitialize = await oracle.getOperatorFee(bufferedInitializeGas);
  const provisionalTotal = bufferedL2Cost + l1UpperBound * 2n + operatorDeploy + operatorInitialize;
  console.log(JSON.stringify({
    mode: "READ_ONLY_PROVISIONAL_QUOTE", chainId: 8453,
    from: FROM, deployerNonce: nonce, tx1UnsignedBytes: byteLength,
    l2MaxFeePerGasGwei: ethers.formatUnits(fee.maxFeePerGas, "gwei"),
    l2DeployEstimateGas: l2GasEstimate.toString(),
    l2InitializeLocalGas: GAS_LOCAL_INIT.toString(),
    l1DeployFeeEth: ethers.formatEther(l1Estimate),
    l1DeployUpperBoundEth: ethers.formatEther(l1UpperBound),
    operatorFeesEth: ethers.formatEther(operatorDeploy + operatorInitialize),
    provisionalTwoTxBudgetEth: ethers.formatEther(provisionalTotal),
    caveats: [
      "Tx2 cannot be simulated on Base until the factory exists; uses local gas measurement",
      "Tx2 L1 fee is conservatively approximated using tx1 L1 upper bound, not quoted directly",
      "L1 upper bound and fees can change; wallet must re-quote immediately before each signature",
      "Does not include exchange fees, bridging fees, or price slippage",
      "No transaction signed or broadcast"
    ]
  }, null, 2));
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
