# NVRA treasury and vesting — Base Mainnet security design v0.2

**Status: design only. No production Safe, token, vesting contract, allocations or funds have been deployed. No launch or transfers are authorized.**

## Current agreed scope (2026-11-05)

- Target network: **Base Mainnet (chain ID 8453)**. The historical Polygon Amoy test prototype (100,000,000 test NVRA) is separate and must not be confused with production.
- Candidate ERC-20: `src/NVRAMainnetCandidate.sol`, **1,000,000 NVRA**, 18 decimals, fixed supply, minted once to a constructor-supplied contract address. The candidate only checks that the recipient has code; it **does not verify Safe implementation, owners, threshold or governance**.
- Proposed custody: **Safe 3-of-5**, subject to independent signer, implementation, module, guard and transaction-policy verification. The earlier 2-of-3 design is superseded.
- No signer addresses, beneficiary addresses, initial circulation, release dates or final unlock policy have been approved.

## Custody safeguards — required before any launch

1. Five genuinely independent, verified signers, with hardware-backed key custody and documented identity/authority. No shared seed phrase, single custodian or keys in code, CI, analytics or the website.
2. Verify the actual deployed Safe proxy, singleton/master-copy, owner set, threshold **3**, chain ID **8453**, enabled modules, guards, fallback handler and upgrade/change pathways. Interface checks alone are insufficient.
3. Independently review signing policy, spending limits, transaction simulation, recipient verification, rotation/recovery, emergency response and the risk of malicious approvals.
4. Never deploy the token with `MockNVRATreasury.sol`: that contract lets **any caller transfer its balance**. It is for isolated local tests only.
5. Prefer separated, independently reviewed allocation-control and vesting contracts. Minting the entire supply into Safe custody does **not** imply circulation or enforce release limits.
6. Obtain explicit go/no-go authorization only after legal review (including applicable EU/MiCA requirements), independent security audit and operational verification. No private keys or signing accounts in the repository.

## Provisional token allocations — NOT funded or released

| Purpose | Share | NVRA |
| --- | ---: | ---: |
| Ecosystem and verified rewards | 30% | 300,000 |
| Treasury and development | 25% | 250,000 |
| Community and adoption | 20% | 200,000 |
| Team | 15% | 150,000 |
| Future liquidity | 10% | 100,000 |
| **Total** | **100%** | **1,000,000** |

These are planning amounts, **not** token balances, guaranteed rewards, commitments or an approved distribution. Program-level budgets, eligibility, abuse prevention, beneficiaries, dates and unlock enforcement remain pending.

## Team vesting caveats

- The undeployed `src/NVRATeamVesting.sol` draft implements a cliff plus linear release. Proposed schedule: 12-month cliff and 36-month linear release, but **calendar months and fixed-day durations are not interchangeable**; exact UTC timestamps must be approved.
- OpenZeppelin `VestingWallet` beneficiary ownership is transferable; transferring ownership may transfer economic rights.
- Funding after vesting time has elapsed can make tokens immediately releasable. Review funding deadlines, cap enforcement and allocation isolation.
- Define beneficiary eligibility, revocation policy, departures, recovery and emergency handling before any real funding.

## Experimental allocation vault (NOT approved for deployment)

`src/NVRAAllocationVaultDraft.sol` is a local-only prototype enforcing five independent, immutable cumulative release ceilings (300k / 250k / 200k / 150k / 100k NVRA). A controller contract authorizes transfers **only of tokens held in the vault**. The draft requires full, separately approved funding and has no timelocks, per-beneficiary restrictions, emergency recovery, cancellation or role rotation. It does not enforce a real Safe threshold: the controller address must be independently verified.

**Critical limitation:** tokens sent directly from the original treasury, or directly to a vesting wallet, bypass these ceilings entirely. Likewise, tokens transferred into the vault after a cap is exhausted may become stuck. A production design must decide whether all allocations are held exclusively in independently reviewed vaults, how funding is restricted, how vesting is funded, and whether emergency recovery is permitted. The `MockNVRAAllocationController.sol` test helper lets anyone invoke calls and **must never be deployed or funded in production**.

See also [treasury funding and release policy](../docs/nvra-treasury-funding-policy-v1.md) for the cross-bucket bypass threat model, two competing custody architectures and the unapproved launch gates.

## Verification and launch gates

- [ ] Confirm the responsible legal entity and complete independent legal/regulatory assessment.
- [ ] Approve 3-of-5 signer identities, independence, hardware custody and emergency plan.
- [ ] Verify Safe implementation, proxy, modules/guards, threshold, owners and Base chain ID independently.
- [ ] Finalize allocations, initial circulating supply, exact vesting timestamps, beneficiaries and enforceable release controls.
- [ ] Expand negative/invariant tests and independent security audit; remediate findings.
- [ ] Demonstrate real utility and operational safeguards, including reward anti-abuse controls.
- [ ] Obtain explicit separate approval for any production deployment, funding or token distribution.

## Read-only verification

`npm run base:readiness` (from `contracts/`) performs read-only Base chain ID checks when `BASE_MAINNET_RPC_URL` is provided, and optional Safe interface checks with `BASE_SAFE_ADDRESS`. It does **not** authenticate the Safe implementation or sign transactions. Keep RPC credentials out of logs.

**This document does not authorize any deployment, signing, transaction, token sale or investment offer.**
