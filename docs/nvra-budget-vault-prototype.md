# NVRA budget vault prototype — implementation note

Date: 2026-10-29. Status: **experimental contract and tests committed; CI confirmation pending; NOT production-approved**.

- `contracts/src/NVRABudgetVault.sol` provides a pre-funded ERC-20 vault with immutable contract controller (intended to be a verified Safe), start time, period length, number of periods and per-period cap.
- Controller-only disbursement; no minting; no owner override; no rollover of unused per-period allowances; lifetime cap; checks-effects-interactions with SafeERC20.
- Prototype budget settings (exact calendar semantics still to decide):
  - Ecosystem: 96 periods, 3,125 NVRA each, 30-day periods.
  - Treasury: 20 periods, 12,500 NVRA each, 90-day periods.
  - Community: 16 periods, 12,500 NVRA each, 90-day periods.
  - Team: use separately audited vesting with 12-month cliff plus 36-month linear release; **not** this budget vault.
  - Liquidity: no release contract or release authorization until separate approval.
- **Important:** fixed 30/90-day periods are NOT calendar months/quarters. 96 x 30 days is 2,880 days, not exactly eight calendar years; 20 x 90 days is 1,800 days, not exactly five calendar years. Before production, implement exact calendar boundaries or obtain explicit approval of fixed-day semantics and disclose them.
- The constructor only checks that controller has bytecode; it does not establish that the address is a real 3-of-5 Safe. That must be independently verified.
- Vault funds must actually be transferred to the vault for restrictions to be enforced. A Safe holding the remaining NVRA can transfer those remaining tokens outside this contract. All bucket allocations therefore need dedicated custody, controlled funding and auditable reconciliation.
- Existing tests use a deliberately insecure mock treasury and Hardhat account impersonation **only in a local simulated chain**. No production use.
- Audit open questions: reentrancy assumptions for token implementation, emergency recovery of accidental deposits, epoch edge cases, controller rotation, gas and operational custody, funding shortfalls, governance and legal review.
- Final on-chain implementation, external audit, Amoy full-stack rehearsal and explicit mainnet go/no-go are still required.
