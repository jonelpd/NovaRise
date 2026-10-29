# NovaRise — tokenomics V1 and execution plan
Date: 2026-10-29
Status: design in progress; not a launch, sale, or investment offering.

## Decisions agreed
- Proposed future **Polygon PoS mainnet** ERC-20: **1,000,000 NVRA** maximum supply, 18 decimals, no further minting planned.
- This is a **separate** future deployment from the existing Polygon Amoy prototype, which has an initial 100,000,000 test NVRA.
- No mainnet token or economic value has been established; mainnet deployment remains conditional on legal and security reviews.

## Allocation — provisionally accepted for planning (2026-10-29)
| Bucket | Share | Tokens |
| --- | ---: | ---: |
| Ecosystem and verified rewards | 30% | 300,000 |
| Treasury and development | 25% | 250,000 |
| Community and adoption | 20% | 200,000 |
| Founding team | 15% | 150,000 |
| Future liquidity | 10% | 100,000 |
| **Total** | **100%** | **1,000,000** |

The project owner accepted these percentages as the provisional planning baseline on 2026-10-29. This does not finalize beneficiaries, initial circulation, unlocks, governance or legal review, and does not authorize spending, transfers, sales or mainnet deployment.

## Preliminary release policy — NOT approved
- Ecosystem: controlled release over up to 8 years, with program-specific caps and anti-abuse rules.
- Treasury: quarterly releases over 5 years, subject to approved budget and governance.
- Community: milestone-based programs, published eligibility, finite budgets and anti-sybil safeguards.
- Team: 12-month cliff and 36-month linear vesting after the cliff, subject to precise contract terms.
- Liquidity: locked until a documented, legally reviewed market plan is approved.

A fixed maximum supply is not a value guarantee. Token price depends on demand, liquidity and actual utility. Token vesting does not create operating cash or market demand.

## Contracts — proposed architecture
1. **NVRAToken**: fixed-supply ERC-20 with no owner mint or tax.
2. **Treasury**: multisig custody, role separation and spending approvals. No production custody in a personal wallet.
3. **Vesting / Timelock**: verifiable allocation release, cliff, beneficiary and revocation policy specified in advance.
4. **AccessPass**: read-only ERC-20 balance-based eligibility; users retain their tokens. Clarify snapshot/flash-balance risks and off-chain access controls.
5. **Participation**: controlled recording of verifiable participation; privacy minimization and anti-abuse policy.
6. **Rewards**: capped payouts from pre-funded allocations; no automatic yield, guaranteed returns or unbounded issuance.

## Gates before mainnet
- [ ] Validate actual user utility and whether ERC-20 is needed.
- [ ] Approve allocations, initial circulating supply, unlock schedule and beneficiary definitions.
- [ ] Design governance, multisig signers, emergency procedures and key recovery.
- [ ] Implement isolated Solidity modules and comprehensive tests, including invariants.
- [ ] Independent code review, security audit and remediation.
- [ ] Confirm responsible legal entity and obtain EU/Spain legal assessment (including MiCA as applicable).
- [ ] Publish accurate whitepaper/terms only after review; do not present planning text as a regulated whitepaper.
- [ ] Deploy and validate full stack on testnet; independently verify source and bytecode.
- [ ] Separate approval for any mainnet deployment and public communications.

## Public references
- Spanish: [Tokenómica y próximos pasos](../tokenomics.html)
- English: [Tokenomics and next steps](../tokenomics-en.html)
- Testnet deployment record: [Amoy manifest](../contracts/amoy.manifest.json)

**No deployments, transfers, signatures or mainnet contracts were executed by publishing this document.**
