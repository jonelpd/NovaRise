# NovaRise Safe 3-of-5 simulation acceptance plan

Status: approved **for simulation only** on 2026-10-29. Official Safe 1.4.1-2 local test code committed; **GitHub Actions run #17 succeeded** for commit `f362c05`, as confirmed by the repository owner's screenshot (2026-10-29). No production Safe, keys, or mainnet transactions.

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
- **Verified:** GitHub Actions run #17 reports Success, with the compile-and-test job green for commit `f362c05`. **Pending:** extend tests to owner rotation, guards/modules, vesting integration, and fuzzing. Do not treat the test implementation as a successful test execution until CI confirms it.

## Phase 2 — additional automated cases (2026-10-29)
- Commit `4cb7a36` adds local tests for Safe-only threshold changes, rejection of direct outsider changes, approved owner rotation and former-owner rejection, and Safe-authorized funding of 150,000 NVRA into team vesting with cliff and full release checks.
- **CI confirmed:** GitHub Actions run #18 shows Success for commit `4cb7a36` (screenshot supplied by repository owner, 2026-10-29). The new tests passed as part of the green compile-and-test job.
- Remaining scope includes guards/modules, gas griefing, malformed signatures, invariant/fuzz testing, owner rotation edge cases, and an independent security review.

## Confirmed CI milestone — run #18
- Screenshot of GitHub Actions workflow run #18 shows green overall Success and compile-and-test for commit `4cb7a36`, total duration 31 seconds.
- Covers the additional test cases introduced in that commit. Not a substitute for independent security audit or production Safe review.

## Phase 3 — adversarial tests (2026-10-29)
- Commit `aac3976` adds duplicate approved-hash signatures, altered transfer payload without reapproval, and multi-transfer fixed-supply accounting tests against the official Safe proxy.
- **Awaiting CI verification** for these new cases. A previous green run does not validate newly added tests.
- The repeated-transfer test is a deterministic accounting check, **not** property-based fuzzing or a formal invariant proof.
- Remaining: fuzz/property-based coverage, guard/module risks, signature edge cases, gas/griefing and independent audit.
