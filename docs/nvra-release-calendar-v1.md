# NovaRise — provisional NVRA allocation release calendar v1

Date: 2026-10-29. **DRAFT FOR APPROVAL — no on-chain implementation or launch authorization.**

## Basis

- Future Polygon PoS ERC-20: fixed one-time mint of **1,000,000 NVRA**, 18 decimals, held initially by a verified production Safe, provisionally 3-of-5.
- Allocation percentages were accepted provisionally by the project owner on 2026-10-29. The release policy below is a **new proposal**, not yet approved.
- **T0** means the independently approved future launch activation date/time in UTC, **not** today's date or necessarily the contract deployment block. No exact UTC timestamps have been chosen.
- Initial circulating supply is **not determined**. A planning default is zero tokens transferred out of the treasury until the separate release approvals. A Safe-held balance is not inherently technically locked: policy-only restrictions are insufficient.

## Proposed caps and release conditions

| Bucket | Allocation | Release policy | Ceiling | Conditions |
| --- | ---: | --- | --- | --- |
| Ecosystem and verified rewards | 300,000 (30%) | 96 monthly budget windows from T0 | Up to 3,125 NVRA per month | Verified activity, anti-abuse rules, published criteria, 3-of-5 Safe approvals and enforceable budget controls |
| Treasury and development | 250,000 (25%) | 20 quarterly windows over 5 years from T0 | Up to 12,500 NVRA per quarter | Approved invoices/milestones, transparent reporting, 3-of-5 approvals, enforceable budget controls |
| Community and adoption | 200,000 (20%) | 16 quarterly windows over 4 years from T0 | Up to 12,500 NVRA per quarter | Approved community program, anti-sybil checks, defined recipients, 3-of-5 approvals |
| Founding team | 150,000 (15%) | 12-month cliff after T0, followed by 36-month linear vesting | 0 until cliff; then ~4,166.67 NVRA per month equivalent | Audited vesting contract, beneficiary and ownership policy approved, UTC timestamps and transferability clarified |
| Future liquidity | 100,000 (10%) | No automatic release | 0 until separate approval | Independent legal/market assessment, custody and execution plan, governance approval |

**Totals:** 300,000 + 250,000 + 200,000 + 150,000 + 100,000 = **1,000,000 NVRA**. Monthly/quarterly caps sum to the respective bucket totals if all periods are used. Rounding is exact at 18 decimal places; do not implement monthly rounding as independent minting.

## Release schedule milestones

- **T0:** 1,000,000 NVRA minted to the verified production Safe. No automatic disbursement. Team vesting contract funding and exact start are subject to independent approval.
- **T0 to month 12:** team allocation has zero vested; ecosystem, treasury and community may only disburse within separately approved period caps, if operational controls are in place; liquidity remains blocked.
- **Month 12:** team cliff reached. The current draft vesting contract releases zero exactly at the cliff timestamp, then begins continuous linear vesting. The team does **not** receive the first 12 months' allocation in a lump sum.
- **Month 48:** team 150,000 NVRA fully vested and community 200,000 NVRA budget window completed, assuming unchanged policy and funding.
- **Month 60:** treasury 250,000 NVRA budget window completed.
- **Month 96:** ecosystem 300,000 NVRA budget window completed.
- **Liquidity:** no scheduled release; requires a separate go/no-go.

## Important engineering distinctions

1. A **budget window is not a vesting contract**. The proposed monthly and quarterly caps do not exist as enforceable on-chain restrictions yet. A Safe with 3 approvals can transfer its full balance unless additional audited contracts or enforceable governance restrictions are deployed.
2. The existing `NVRATeamVesting.sol` implements **continuous linear vesting after a cliff**, not monthly discrete installments. It inherits OpenZeppelin VestingWallet and permits ownership/beneficiary rights to be transferred unless controlled separately. Funding late may make accrued tokens immediately claimable. The exact interpretation of `startTime`, `cliff`, and `linearDuration` must be tested against UTC timestamps and contractual disclosures.
3. Do not treat an unlocked allocation as circulating supply automatically. Circulation depends on actual on-chain transfers, restrictions and custody.
4. Unused period budgets **do not roll over by default**. Carry-forward, cancellation, and reallocation require an explicit governance decision. No implicit minting, inflation, guaranteed returns or price stabilization.
5. This document does not establish public-sale terms, exchange listing, market-making, or investment rights.

## Decisions still required

- Confirm or revise this proposed release calendar, especially the 4-year community horizon and liquidity gate.
- Define exact T0 UTC date, vesting beneficiary, beneficiary transferability, initial circulating supply and allocation wallets/contracts.
- Choose and audit **enforceable** on-chain per-bucket caps and timelocks or explicitly disclose that restrictions are governance-only; specify emergency pause/recovery and role separation.
- Complete external Solidity/custody audit, Amoy full-architecture rehearsal, legal review for Spain/EU (MiCA as applicable), and formal mainnet go/no-go.

**Mainnet remains NO-GO. No token, Safe or vesting contract has been deployed to mainnet by this document.**
