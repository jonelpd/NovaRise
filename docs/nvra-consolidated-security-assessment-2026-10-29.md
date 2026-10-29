# NovaRise — consolidated preliminary smart contract security assessment

**Date:** 2026-10-29  
**Classification:** Internal static review and automated test evidence; **not an independent audit or certification**.  
**Mainnet decision:** **NO-GO** until all critical launch gates are closed.

## Reviewed scope

- `contracts/src/NVRAMainnetCandidate.sol` — fixed-supply 1,000,000 NVRA candidate (not deployed).
- `contracts/src/NVRATeamVesting.sol` — beneficiary-controlled OpenZeppelin VestingWallet with custom cliff schedule.
- `contracts/src/MockNVRATreasury.sol` — deliberately insecure, local-test-only fixture.
- `contracts/src/SafeLocalImports.sol`, `contracts/test/safe-multisig.test.cjs` — pinned official Safe 1.4.1-2 singleton/proxy local simulation.
- Hardhat config, npm package manifests, GitHub Actions workflow and published project readiness docs.

**Evidence:** repository owner supplied GitHub Actions screenshots showing Success for run #17 (commit `f362c05`), run #18 (commit `4cb7a36`), and run #19 (commit `aac3976`). The screenshots confirm green compile-and-test jobs; they do not substitute for independent bytecode verification or formal review.

## Findings register

Severity indicates **risk to a future production launch if left unresolved**, not an assertion that an exploit has occurred.

| ID | Severity | Finding | Risk / impact | Required mitigation | Status |
|---|---|---|---|---|---|
| NVRA-01 | **Critical launch blocker** | Production custody has no deployed, independently verified Safe and no approved real signers. | Wrong or compromised treasury destination could lose the entire supply. | Agree owners, threshold, independent signer custody, Safe version, modules, recovery and address review; rehearse before minting. | Open |
| NVRA-02 | **High** | `MockNVRATreasury.sendToken` is callable by anyone. | If deployed and funded, anyone could move its ERC-20 balance. | Exclude mock from production artifacts/deployment scripts and audit scope; never fund it. | Open (test-only by design) |
| NVRA-03 | **High** | `NVRAMainnetCandidate` only checks `treasury.code.length != 0`. | Any deployed contract, even a malicious or insecure one, passes. | Independently verify intended Safe proxy, implementation, owner list and threshold before deployment; consider a documented deployment allowlist/process. | Open |
| NVRA-04 | **High** | `NVRATeamVesting` beneficiary is the transferable owner of `VestingWallet`. | Vesting claim rights may be transferred to an unapproved address. | Approve transferability policy and beneficiary governance; redesign/review if non-transferability is required. | Open |
| NVRA-05 | **High** | Deposits after vesting has started can make previously vested portions immediately claimable. | Unexpected circulating supply or early team release if funding is late. | Fund before the approved schedule begins; independently check exact dates, allocation and recipient. | Open |
| NVRA-06 | **High** | No on-chain caps/segregation for the proposed ecosystem, community, liquidity and development buckets. | A correctly authorized Safe transaction can still spend outside approved budget. | Approve budgets, distribution schedules, segregated custody or audited spending modules, reporting and sign-off. | Open |
| NVRA-07 | **Medium** | Cliff schedule releases zero through `timestamp <= cliffEnd`, then starts linear release one second later. | Off-by-one expectations at boundary; mismatch with policy/communications. | Approve precise UTC timestamps and inclusive/exclusive cliff semantics; boundary tests. | Open pending policy |
| NVRA-08 | **Medium** | Vesting is non-revocable under current implementation. | Unvested allocation cannot be recovered under a termination policy. | Confirm legal and governance requirements; do not add revocation without explicit design and audit. | Open pending policy |
| NVRA-09 | **Medium** | `contracts/package.json` uses caret ranges for major tooling; CI runs `npm install` without a committed lockfile guarantee. | Non-reproducible dependency resolutions may alter build/test results. | Commit and enforce npm lockfiles for root and isolated Safe dependencies; use `npm ci`, pinned versions and checksums. | Open |
| NVRA-10 | **Medium** | Safe contracts are copied from isolated `safe-deps/node_modules` into Hardhat `node_modules` during CI. | Dependency/source drift or mistaken import provenance. | Pin package, verify package contents and compiled bytecode; use reproducible lockfiles and explicit version attestations. | Open |
| NVRA-11 | **Medium** | No independent audit, property-based fuzzing, formal invariant verification or production-chain rehearsal. | Uncovered edge cases or integration flaws may remain. | Add fuzz/invariant and adversarial test suites, testnet rehearsal, independent audit and remediation evidence. | Open |
| NVRA-12 | **High launch blocker** | Legal entity, MiCA applicability, final allocation and disclosures remain unapproved. | Regulatory and operational exposure on token issuance or distribution. | Obtain qualified Spain/EU legal review, approve utility and distribution design, formal go/no-go decision. | Open |

## Confirmed controls from existing local test suite

- ERC-20 candidate mints exactly 1,000,000 NVRA once, rejects zero and EOA treasury addresses, and supplies no externally callable mint function.
- A real Safe proxy is instantiated in local tests with five owners and threshold three; 1 or 2 signatures cannot execute tested transfers, while three approved owners can.
- Tested rejection of non-owner and duplicate signatures, altered recipient/amount, and replay attempts.
- Tested Safe-authorized threshold change and owner replacement; former owner's approval is rejected.
- Tested Safe-authorized funding of 150,000 NVRA into vesting and no release at cliff, followed by full release at the end.
- Deterministic multiple-transfer tests preserve total supply and account balances.

These are **specific passing test cases**, not proof of safety against every attack, all Safe modules/guards, every signature type or arbitrary sequences of transactions.

## Prioritized remediation

### P0 — Before any public-chain deployment or token distribution
1. Keep production deployment disabled; never use the mock treasury.
2. Decide actual utility, allocations, vesting beneficiary rights, UTC timestamps and custody governance.
3. Choose and independently verify Safe owners, threshold, recovery process and deployed contract addresses.
4. Obtain Spain/EU legal review, independent smart contract audit, fixes and written sign-off.

### P1 — Engineering hardening before external audit
1. Pin and lock dependency trees; migrate CI from `npm install` to `npm ci` with explicit lockfile verification.
2. Expand signature tests (malformed, ECDSA, wrong chain/hash/nonce), Safe modules and guards, owner rotation and failed inner transactions.
3. Add reproducible fuzz/property-based tests and invariants for total supply, Safe accounting and vesting release.
4. Rehearse full end-to-end deployment on a test network, with verified source and independently reviewed arguments.

### P2 — Operations and transparency
1. Define treasury transaction review checklist, recipient allowlists/caps where appropriate and public reporting.
2. Document signer incident response, compromised device rotation, key backup and change management.
3. Publish risk disclosures and project governance before any release.

## Limitations

This report is based on repository source inspection and the owner's CI screenshots. No live mainnet contract, real Safe account, real signer keys, independent penetration test or external audit was inspected. Safe 3-of-5 limits unilateral spending but **does not prevent collusion or compromise of three signers**. The existing 100,000,000 NVRA Amoy prototype is a separate testnet token, not the proposed 1,000,000 NVRA mainnet candidate.

**Conclusion: good local CI progress, but production readiness remains NO-GO.**
