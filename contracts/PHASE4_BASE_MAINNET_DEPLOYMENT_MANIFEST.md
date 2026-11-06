# NVRA — Base Mainnet deployment manifest (template, NOT authorization)

**Status:** INCOMPLETE / NO-GO. Fill and independently verify all required fields before deployment. Never commit private keys, seed phrases, RPC credentials or signatures.

## Immutable target parameters
| Field | Required value |
| --- | --- |
| Network | Base Mainnet |
| Chain ID | 8453 |
| Token name | NovaRise Utility Token |
| Symbol | NVRA |
| Decimals | 18 |
| Maximum and initial supply | 1,000,000 NVRA (1,000,000 × 10^18 units) |
| Bucket 0 | 300,000 NVRA |
| Bucket 1 | 250,000 NVRA |
| Bucket 2 | 200,000 NVRA |
| Bucket 3 / team vesting | 150,000 NVRA |
| Bucket 4 | 100,000 NVRA |
| Safe governance | 3 independently secured owner keys, threshold 2 |
| Solidity | 0.8.24; optimizer enabled, runs 200 |
| Other compiler | 0.7.6 for legacy Safe sources, optimizer disabled |

## Required verified inputs — NOT YET PROVIDED
| Input | Value | Verification evidence |
| --- | --- | --- |
| Frozen source commit SHA | TBD | Independent source review |
| Factory deployer EOA/multisig address | TBD | Custody approval |
| Factory controller Safe proxy address | TBD | On-chain read and owner approvals |
| Five distinct Safe owner addresses | TBD | Independently confirmed by owners |
| Safe singleton address and codehash | TBD | Trusted Safe release and Base RPC |
| Safe proxy runtime codehash | TBD | Trusted deployment provenance |
| Safe fallback handler address and codehash | TBD | Trusted Safe release |
| Safe modules and guard | None / zero | Read-only preflight |
| Team beneficiary address | TBD | Beneficiary confirmation |
| Vesting start (Unix seconds) | TBD | Approved future timestamp |
| Vesting cliff (seconds) | TBD | Approved duration |
| Vesting linear period (seconds) | TBD | Approved duration |
| Factory deployed address | TBD | Verified receipt and code |
| Five predicted CREATE2 vault addresses | TBD | `predictVault(0..4)` after factory deployment |
| Predicted/actual token and vesting addresses | TBD | Deployment trace and postflight |
| Exact factory creation bytecode hash | TBD | Frozen build artifact |
| Token/vesting/vault/escrow runtime codehashes | TBD | Frozen build and Base verification |
| Deployment gas estimate and funded payer | TBD | Dry run and independent estimate |
| Security review and accepted surplus policy | TBD | Signed evidence |
| Legal/compliance clearance | TBD | Qualified review |
| Deployment approval | TBD | Explicit authorization of this exact manifest |

## Deterministic execution order
1. Confirm chain ID 8453, Safe identity and on-chain configuration with independently verified allowlists. No signing.
2. Freeze code and compiler settings; record bytecode hashes, constructor arguments and deployer identity.
3. Deploy `NVRAAtomicImmutableVestingFactoryDraft` with the approved Safe controller, beneficiary, future start, cliff and linear duration. This step does **not** mint NVRA.
4. Read `predictVault(0..4)` and independently recalculate CREATE2 addresses using factory address, per-bucket salt and init-code hashes.
5. Call `initialize()` from the original factory initializer **before vesting start**. One transaction creates five vaults, mints 1,000,000 NVRA to the vaults, creates vesting and forwards the team's 150,000 NVRA atomically.
6. Verify transaction success, factory state, five vaults, token/vesting bytecode, total supply, each bucket balance, team escrow zero, vesting 150,000 NVRA, beneficiary and schedule.
7. Publish verified contract addresses and reviewed deployment evidence only after successful postflight.

**Important:** token and vesting addresses are created using ordinary `CREATE` inside `initialize()`; they must not be represented as CREATE2 predictions. The five vaults alone use CREATE2. Actual factory address, salts and compiler bytecode are required to reproduce those predictions.

## Stop / rollback
- Before transactions: abort on any missing input, mismatch, insufficient gas, incomplete independent audit or legal clearance.
- After factory deployment but before initialization: do not initialize until predictions and configuration pass. A deployed factory cannot be silently reconfigured; redeploy a corrected factory if needed.
- After initialization: on-chain operations are irreversible; any failure inside `initialize()` reverts that initialization transaction, but not the earlier factory deployment. Never assume rollback of a successful transaction.

## Scope
No deployment, signature, fund transfer, contract merge or mainnet call is authorized by this template. The final populated manifest must be approved separately.

## Governance change — 2026-11-05
The project owner approved a Safe **2-of-3**, with all three independently secured signing keys controlled by one person. This is key-level redundancy, **not** multi-person governance. Do not reuse a single seed phrase across the three signers. The current `check-safe-3of5.cjs` preflight still enforces 3-of-5 and **must be replaced or adapted and retested before deployment**. No Safe has been created or verified. No on-chain deployment authorized.

## Safe evidence from operator screenshots (2026-11-06)
- Safe proxy: `0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd` on Base Mainnet.
- Owners shown by BaseScan and Safe setup UI: `0x89316a3553Da9315a720e25915d731AfD11d0B16`, `0xe697351daE40E770769B35852C1e05737015b6B7`, `0x5927b6f05c4CdD16Cce6Cc429650c0b767137245`.
- Safe UI shows **2 out of 3** required confirmations; BaseScan identifies address as a Safe smart contract. Evidence is screenshots, **not** an independent read-only RPC attestation.
- **Still pending:** singleton/fallback codehashes, guard, modules, independent RPC preflight, owner key isolation, deployment approval. Do not fund or deploy based solely on screenshots.

## Safe 2-of-3 preflight validation (2026-11-06)
- Commit `921d2e7` corrected the read-only Safe preflight to enforce threshold 2, owner count 3; three CI workflows completed successfully for that commit.
- Expected Safe address and three owners are recorded in `base-mainnet-manifest.template.json` from operator-provided public information.
- **Still not independently attested via Base RPC:** actual owner list/threshold, Safe singleton bytecode and allowlisted hash, fallback handler, zero guard, empty enabled modules and proxy runtime hash. The CLI requires independently sourced singleton and fallback handler addresses. Do not substitute guesses or silently mark these checks complete.
- Safe UI check: Settings → Modules should show no unexpected enabled modules; Settings → Security should show no unexpected guard or spending-limit/delegate permissions. Screenshots are supplemental evidence, not a substitute for on-chain checks.

## Safe UI modules screen evidence (2026-11-06)
Operator screenshot of Safe Settings > Modules for NovaRise Treasury shows **No modules enabled**, **No transaction guard set**, and a displayed **Safe: CompatibilityFallbackHandler 1.5.0**. Exact handler address intentionally not transcribed from screenshot; must be copied and verified independently via Base RPC before adding it to the manifest. This is UI evidence only, not an independent RPC security attestation. No Safe settings changed.
