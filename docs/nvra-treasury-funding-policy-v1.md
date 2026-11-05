# NVRA Base Mainnet — treasury funding and release policy (draft v0.1)

**Design proposal only — no deployment, wallet creation, token sale or funding is authorized.** This document is not a security audit.

## Threat model

The local tests in `contracts/test/allocation-vault.test.cjs` show that the allocation vault enforces limits only on transfers it executes. If the original Safe holds spendable NVRA or an allocation recipient can redirect received funds, neither the vault nor its counters can prevent cross-bucket economic transfers. A 3-of-5 Safe protects approval of transactions; **it does not itself enforce purpose-specific token budgets**.

## Recommended production flow (subject to independent review)

1. Verify a production Safe on **Base Mainnet, chain ID 8453**, with five independent owners, a 3-of-5 threshold, approved modules/guards and documented recovery procedures.
2. Deploy an independently audited, immutable or tightly governed distribution architecture with explicit per-bucket caps. The current `NVRAAllocationVaultDraft.sol` is **not production-ready** and its mock controller is intentionally unsafe.
3. At ERC-20 creation, the current token candidate mints **1,000,000 NVRA to the constructor-supplied contract address**. This can be a Safe or a separately reviewed allocation controller, but the choice changes custody, operational recovery and enforcement. **Do not assume minting to Safe then moving tokens later eliminates the interim unrestricted-transfer window.**
4. Before any production token minting, select one architecture and audit the entire initial custody/funding path. Prefer an enforceable, preapproved split into purpose-specific vaults or a reviewed controller with transfer constraints; ensure no privileged bypass or unexpected recovery path.
5. For the team allocation, permit at most **150,000 NVRA** to reach approved vesting destinations through its budget. Fix beneficiary, cliff, linear release timestamps, late-funding rules and transferable-beneficiary risk. The draft vesting contract is not a hard funding cap.
6. Establish distinct recipient allowlists or beneficiary policies, release calendars, anti-abuse eligibility, spending approval rules and on-chain event reconciliation for each purpose. Transfers **after** tokens leave an allocation vault cannot generally be controlled by that vault.
7. Reconcile on-chain balances, vault releases, vesting balances and circulating-supply reporting; publish only independently verified facts.

## Proposed allocation accounting

| Bucket ID | Purpose | Ceiling (NVRA) | Further controls needed |
| --- | --- | ---: | --- |
| 0 | Ecosystem/rewards | 300,000 | Reward eligibility, anti-abuse, release cadence |
| 1 | Treasury/development | 250,000 | Spending policy, verified recipients, approvals |
| 2 | Community/adoption | 200,000 | Eligibility, distribution calendar, fraud controls |
| 3 | Team | 150,000 | Approved vesting destinations, UTC timestamps, funding limits |
| 4 | Future liquidity | 100,000 | Liquidity policy, market-integrity/legal review |
| | **Total** | **1,000,000** | No circulating supply implied |

These amounts are **provisional**, not commitments, approved circulating supply or currently funded balances.

## Security requirements for the next implementation

- No externally owned account or insecure mock may act as an unrestricted controller.
- No emergency withdrawal, rescue, module, upgrade, privileged approval or bypass path may silently override a bucket cap. Explicitly test any intended recovery route.
- Test direct treasury-to-recipient bypass, cross-bucket rerouting, late vesting funding, duplicate payouts, invalid recipients, zero transfers, insufficient vault funding, malicious ERC-20 behavior and reentrancy where applicable.
- Enforce and test that **sum of all cumulative released amounts never exceeds 1,000,000 NVRA** and each budget is respected; distinguish on-chain vault accounting from real economic end-use.
- A Safe 3-of-5 alone is not enough: independently inspect the actual Safe proxy, singleton, modules, guards, owner addresses and threshold, and review transaction policy and signer independence.
- Complete independent Solidity/security review and legal/MiCA assessment, and obtain explicit authorization before any production deployment, funding or distribution.

## Open architecture decision

**Option A — mint to reviewed allocation controller:** minimizes an interim unrestricted Safe custody window but introduces controller availability/recovery risks and must meet the token constructor's contract-address requirement.

**Option B — mint to verified Safe and immediately fund audited allocation vaults:** simpler custody administration but the Safe can move tokens outside the policy until funding completes, and could retain any untransferred balance.

**No option is approved yet.** Choose only after legal, security and governance review. Local tests are not testnet or mainnet transactions.
