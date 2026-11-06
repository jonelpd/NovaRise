# NVRA Base Mainnet — mobile MetaMask signing runbook (PREPARATION ONLY)

## Fixed deployment parameters
- Chain: Base Mainnet, chain ID **8453**.
- Factory contract: `NVRAAtomicImmutableVestingFactoryDraft` (not legacy `NVRAToken`).
- Deployer AND initializer EOA: `0x89316a3553Da9315a720e25915d731AfD11d0B16`.
- Safe controller: `0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd`.
- Vesting beneficiary: same EOA as deployer.
- Earliest permitted initialization: **1793923200**, 2026-11-06 00:00 UTC (already elapsed). Actual vesting start is the block timestamp of successful initialization.
- Cliff 31,536,000 seconds; linear release 94,608,000 seconds.
- Fixed supply: 1,000,000 NVRA, 18 decimals; vesting: 150,000 NVRA.

## Preparation (no signatures)
1. Obtain a trusted compiled factory artifact from the reviewed branch, with matching Solidity compiler and optimizer; never use the legacy Polygon/100m script.
2. Run `cd contracts && npm ci && npx hardhat compile`.
3. Run `node scripts/prepare-base-unsigned-launch.cjs 0x89316a3553Da9315a720e25915d731AfD11d0B16`. This prints **unsigned** deployment transaction data and the `initialize()` calldata.
4. Independently verify the constructor arguments and compiled bytecode against the reviewed source and the CI regression test. Save the output privately for the signing session.
5. Get fresh Base fee data for **both** transactions, including L2 execution and L1 data fees. The Hardhat gas report of 3,060,359 and 3,101,070 units (8,009,857 with buffer) is NOT a final Base quote. Include funding / bridge / exchange fees.
6. Confirm that the wallet can sign a contract-creation transaction (to=null, long bytecode) **and** call a deployed contract method, from the **same EOA**. Mobile MetaMask's network selection alone is not sufficient; no verified mobile signing interface has been selected.

## Signing sequence — requires a separate explicit user approval
1. Review network 8453, wallet address, factory constructor arguments, deployment bytecode, gas quote and sufficient ETH **before** signing.
2. Sign **only transaction 1** to deploy factory. Record transaction hash and successful receipt. Confirm factory `initializer()` equals EOA, `controller()` equals Safe, `beneficiary()` equals EOA, and `start()` equals 1793923200.
3. Construct transaction 2 **only** with the verified factory address from transaction 1 receipt. Call `initialize()` using the **same EOA**; no ETH value.
4. Re-estimate gas and L1 fees, confirm block time >= `start`, then request user approval for transaction 2.
5. After receipt, independently verify token address, 1M supply, all 5 allocations, vesting address, 150k funding, actual start and controller. Publish contract address only after verification.

## Safety
- Never request or store recovery phrase, private key, signing credentials, or MetaMask passwords.
- Never paste a private key into a web page, repository, CI, or chat.
- Avoid unverified third-party deployment sites and blind signing. A wallet confirmation is not evidence that arbitrary bytecode is safe.
- The current factory and dependencies are **Draft/Candidate**, not independently audited. The user chose to prioritize deployment but this risk remains.
- No ETH purchase or broadcast is authorized by this runbook. No real NVRA deployment has occurred.
