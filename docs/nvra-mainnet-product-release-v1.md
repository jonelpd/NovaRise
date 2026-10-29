# NovaRise NVRA — Mainnet product and release specification (draft v1)

Date: 2026-10-29. **Development focus: Polygon PoS mainnet, chain 137. No further Amoy work is planned.** This is a technical/product specification, not a token offering, legal opinion, or authorization to deploy.

## First actual utility: access to NovaRise services

The first release must provide a demonstrable digital service accessible to a user holding NVRA. Define and ship a specific feature with a usable free path and clearly disclosed access criteria, rather than implying a token price or investment return. The service itself, entitlement thresholds, wallet authentication, revocation, privacy policy, and customer support remain to be selected and implemented. Do not market a balance check alone as a finished service.

**Preferred v1 architecture:** fixed-supply ERC-20 + an independently reviewed access gateway using wallet signature authentication (domain/chain/nonce/expiry), on-chain balance or purpose-built entitlement checks, replay resistance, rate limiting and privacy minimization. A simple live balance threshold can be gamed through temporary transfers and does not prove ongoing subscription or contribution; do not promise resistance to this without a defined entitlement mechanism.

## Token contract already developed

- Source: `contracts/src/NVRAMainnetCandidate.sol` (candidate; not audited or deployed).
- Name: NovaRise Utility Token; symbol: NVRA; 18 decimals.
- Chain target: Polygon PoS, chain ID 137.
- Exactly 1,000,000 NVRA minted once in constructor to an already deployed **verified production contract treasury**. No owner mint, tax, blacklist, upgrade, or price guarantee in the token source.
- Constructor only verifies the treasury is a contract; it does **not** verify Safe identity, owners or threshold. Deployment procedures must independently verify the 3-of-5 Safe.
- Existing 100,000,000 NVRA on Amoy is a separate historical experiment, never the production token.

## Allocation design (provisional, not deployable as-is)

| Allocation | NVRA | Enforcement |
| --- | ---: | --- |
| Ecosystem | 300,000 | Pre-funded vault, 96 capped monthly windows |
| Development | 250,000 | Pre-funded vault, 20 capped quarterly windows |
| Community | 200,000 | Pre-funded vault, 16 capped quarterly windows |
| Team | 150,000 | 12-month cliff, 36-month linear vesting |
| Future liquidity | 100,000 | Must remain blocked pending separate authorization |

The current `NVRABudgetVault.sol` uses **fixed 30/90-day periods**, not calendar months/quarters. The future liquidity amount merely remaining in Safe is **not technically locked**. Both are release blockers: do not call these allocations technically enforced until addressed and independently audited. The current vesting wallet's beneficiary ownership can transfer, and late funding can unlock accrued amounts.

## Mainnet implementation sequence (no additional testnet cycles)

1. **Utility product:** select one concrete NovaRise service and ship a working access implementation with transparent user terms; confirm ERC-20 necessity.
2. **Legal and accountable operator:** identify the issuing/operating entity, obtain qualified Spanish/EU MiCA classification and review of distribution, whitepaper/notification and marketing obligations as applicable. No public sale or promotional investment claims pending sign-off.
3. **Governance:** designate five consenting, independently secured production Safe owners and document custody, recovery, replacement, emergency operations and conflicts; deploy and verify a real 3-of-5 Safe.
4. **Contract finalization:** resolve calendar semantics, liquidity restriction, vesting beneficiary and transferability, exact T0 UTC, release permissions and initial circulation; freeze source and compiler settings for external audit.
5. **Independent audit:** security assessment of token, vaults, vesting, access layer, Safe integration and deployment scripts; remediate all critical/high findings and record exact hashes.
6. **Mainnet go/no-go:** independently check chain ID 137, verified Safe, signers, gas funding, constructor args, release recipients, legal approvals, operational incident plan and authorized transaction list. Obtain explicit owner approval for the **specific** on-chain deployment.
7. **Deploy only after go:** verify source on PolygonScan, publish addresses, transaction hashes, supply and allocation records; launch utility first. Token sale, liquidity and exchange listing each require separate approval.

## Current status

**BUILD / NO DEPLOY.** The ERC-20 candidate exists, but the utility service is not yet implemented, real custody is not established, calendar/liquidity controls are not finalized, and independent audit/legal sign-offs are outstanding. The project owner explicitly requested that work now focus on production mainnet rather than more testnet experiments. That preference does not waive security or legal gates.
