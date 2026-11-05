# NovaRise NVRA — initial custody architecture decision record (draft ADR-001)

**Status: recommendation for further engineering, NOT approval to deploy, fund, sign, distribute or market NVRA.** Target: Base Mainnet (8453), fixed 1,000,000 NVRA.

## Alternatives

**A. Mint directly to a reviewed distribution controller.** The ERC-20 constructor receives a contract address, so this is technically compatible with the candidate token. This eliminates a *temporary* unrestricted Safe custody interval if the controller enforces allocations from inception. However, it concentrates the entire supply in a custom contract: a coding flaw, wrong controller configuration, immutable governance or failed recovery can permanently compromise or lock the whole supply. The existing `NVRAAllocationVaultDraft.sol` is **not** that audited production controller.

**B. Mint to a verified 3-of-5 Safe, then fund audited vaults.** This gives operational recovery and familiar custody controls, but signers can transfer any tokens still held by the Safe outside the proposed budgets. A 3-of-5 threshold approves transactions; it does not enforce tokenomics. This path therefore requires explicit controls on initial funding, approvals, leftover funds and ongoing treasury spending.

**C. Reviewed purpose-specific allocation vaults from genesis.** A potential refinement of A: a reviewed factory/controller distributes fixed allocations atomically to five dedicated vaults with independently reviewed release policies, without unrestricted post-mint custody. It introduces a more complex deployment and initialization surface and may require changes to the candidate ERC-20 constructor or an audited receiving/controller contract. Not implemented.

## Qualitative comparison

| Criterion | A: controller at mint | B: Safe then fund vaults | C: atomic purpose-specific allocation |
| --- | --- | --- | --- |
| Unrestricted initial custody window | Low if controller is correct | **High until funding completes** | Low if atomic initialization is correct |
| Implementation/contract risk | **High: custom full-supply controller** | Medium: Safe plus vault integrations | **High: more contracts and atomic setup** |
| Operational recovery | Depends on audited recovery design | Stronger operational flexibility, also bypass risk | Depends on each vault's recovery design |
| Enforceable purpose budgets | Possible only with complete controller design | Not guaranteed while Safe holds unrestricted funds | Possible if vaults and initialization are fully enforced |
| Single point of failure | Controller can affect entire supply | Safe signer collusion / configuration can affect funds | Factory/init path and each vault |
| Audit complexity | High | Medium-high | High |
| Status | Prototype vault exists, controller unbuilt | Safe not configured, funding policy unbuilt | Concept only |

These are **qualitative risk assessments, not audit results**. No architecture is proven secure by passing local tests.

## Provisional engineering recommendation

**Investigate option C first**, using a deliberately small, audited initialization surface and purpose-specific vaults. The security goal is to make the initial distribution **atomic and budget-bound** instead of relying on an operational promise to move funds later. This is a direction for design review, **not a decision to deploy C**. If atomic initialization adds excessive complexity or unmanageable recovery risks, compare a hardened A and a constrained B before selection.

The design must explicitly answer:

1. How can the token's 1,000,000-unit mint be allocated atomically without a window where a party can divert funds? What happens on partial initialization or failed recipient verification?
2. Who can upgrade, pause, rescue, rotate owners, change recipients or invoke arbitrary calls? Can any of these bypass immutable allocation ceilings?
3. How are Safe 3-of-5 signers verified independently on Base, including proxy implementation, modules, guards, fallback handler and chain ID?
4. How is the 150,000 NVRA team budget enforced through vesting, with fixed UTC cliff and linear schedule, beneficiary transfer rules and late-funding protections?
5. How are the other four budgets released, who is eligible, and how are abuse, treasury spending and liquidity risks controlled?
6. How are lost keys, contract bugs, malicious token transfers, unexpected deposits and frozen funds handled without silently weakening limits?
7. What are the initial circulating supply, exact beneficiaries, legal issuer, EU/MiCA classification and disclosure obligations?

## Mandatory next gates

- Written threat model and complete on-chain state/flow diagrams.
- Local adversarial tests: unauthorized calls, reentrancy, duplicate funding, partial initialization, unexpected direct transfers, cross-bucket rerouting, vesting late funding, controller compromise, signer changes, locked funds and invariant conservation.
- Independent audit of the **final** contracts and actual production configuration, not just this draft.
- Independent legal/regulatory review, governance approval, and explicit user authorization before any real mainnet action.

**Current project status:** no approved production Safe, no real NVRA contract, no mainnet token supply, no distribution, no token sale.
