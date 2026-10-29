# NovaRise Safe 3-of-5 simulation acceptance plan

Status: approved **for simulation only** on 2026-10-29. Official Safe 1.4.1-2 local test code committed; **CI result not yet confirmed**. No production Safe, keys, or mainnet transactions.

## Environment

- Use the official, version-pinned Safe contracts or Safe deployment tooling on a local Hardhat fork/test network, after confirming compatibility with the current Hardhat 2 stack.
- Five separate ephemeral local signers: A, B, C, D, E. No private keys committed.
- A verified Safe proxy configured with threshold 3, owner count 5. Never replace this with the insecure `MockNVRATreasury`.
- Mint the separate 1,000,000 NVRA candidate only to the deployed local Safe after checking the destination contract address.

## Required passing cases

1. Safe reports exactly five unique owners and threshold three.
2. A single signature cannot execute a transfer; two valid signatures cannot execute it.
3. Three distinct valid owner signatures can execute one approved transfer, with correct amount and recipient.
4. Duplicate signatures, non-owner signatures, wrong transaction hash, wrong nonce and expired/invalid transaction assumptions do not bypass the threshold.
5. A previously executed Safe transaction cannot be replayed.
6. Changing owners or threshold requires a Safe-authorized transaction; no external signer can unilaterally modify either.
7. Candidate NVRA fixed supply remains exactly 1,000,000 and only the authorized amount leaves the Safe.
8. A transfer into team vesting respects the cliff and linear schedule; release goes to the approved beneficiary.
9. Simulate a compromised/lost signer and document the safe rotation procedure.
10. Report contract versions, source commit, transaction receipts, owner list (test-only), and test logs.

## Release criteria

- CI green for the exact code commit; tests must actually deploy a Safe proxy, not a substitute that merely counts approvals.
- No external funds, real signer addresses, or production keys used.
- Manual review of Safe module/guard configuration, signers, threshold and upgrade/proxy risks.
- Independent security and legal review before any mainnet go/no-go decision.

## Out of scope

This plan does not authorize deployment, custody, token sales or token transfers on a public chain.

## Implementation progress — 2026-10-29
- `contracts/package.json` pins `@safe-global/safe-contracts@1.4.1-2`.
- `contracts/src/SafeLocalImports.sol` compiles official Safe singleton and SafeProxyFactory with Solidity 0.7.6.
- `contracts/test/safe-multisig.test.cjs` deploys an actual Safe proxy locally, initializes five Hardhat signers with threshold three, mints the separate NVRA candidate into it, and tests 1/2/3 approved-hash signatures, non-owner rejection and replay prevention.
- **Pending:** verify new GitHub Actions run is green; extend tests to owner rotation, guards/modules, vesting integration, and fuzzing. Do not treat the test implementation as a successful test execution until CI confirms it.
