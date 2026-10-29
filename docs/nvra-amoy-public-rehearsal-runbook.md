# NovaRise — public Polygon Amoy full-architecture rehearsal

Status: **PREPARATION ONLY — NO TRANSACTIONS SENT**. Date: 2026-10-29.

## Network and scope
- Polygon Amoy, chain ID **80002**, gas token **test POL**, explorer https://amoy.polygonscan.com/.
- Existing testnet token `0xCCC748d63333F9aF58f259CDF771d5AB1226e20D` has **100 million test NVRA**. Do **not** reuse it for the **new, distinct 1-million-NVRA** architecture.
- Local CI run #33 confirmed an integrated simulation of a 3-of-5 Safe, 1-million-NVRA token, three funded budget vaults and team vesting. This is **not** a public Amoy deployment.
- Do not use `MockNVRATreasury` in the public deployment.

## Public preflight (read-only; safe to run without secrets)

From `contracts/` after `npm ci`:

```bash
AMOY_RPC_URL="https://polygon-amoy.drpc.org" npm run amoy:public-preflight
```

Optional public-only variables: `AMOY_TEST_DEPLOYER` (one test wallet address) and `AMOY_SAFE_OWNERS` (five comma-separated distinct test wallet addresses). The script checks RPC chain ID **before any balance queries**, reads block height and optionally checks test-POL balance. It never signs, broadcasts, funds or deploys.

The public RPC is replaceable: verify its chain ID on every run. No production wallets, recovery phrases, private keys or credentials should ever be placed in repository files, screenshots or chat.

## Requirements before an actual testnet transaction

1. Confirm five independently controlled, distinct **test-only** owner addresses and an actual Safe 3-of-5 creation procedure; select a separate test deployer address.
2. Fund the test deployer with faucet test POL. Official faucet: https://faucet.polygon.technology/.
3. Select exact UTC `T0`, beneficiary and deployment-time schedule parameters. Decide whether periods are **30/90 days** (current prototype) or **calendar months/quarters** (approved planning language); they are not equivalent.
4. Decide and document the **liquidity bucket control**: 100,000 NVRA left in Safe are **not technically locked**. Choose audited timelock or other enforceable restriction before claiming this bucket is locked.
5. Review the deployment scripts and constructor arguments, RPC identity, Safe owner threshold, funding and bytecode verification with a second reviewer. The repo does **not** yet include an authorized transaction-sending deployment flow.
6. When explicitly authorized in a separate step, deploy verified official Safe singleton/factory/proxy as appropriate, then the new 1m NVRA token minted to Safe, three budget vaults and team vesting. Execute all allocations using 3-of-5 Safe approvals, and record transaction hashes and source verification.
7. Verify on explorer: total supply = 1m; balances vaults 300k/250k/200k; team vesting 150k; liquidity bucket 100k with its chosen technical restrictions; Safe owner set and threshold; all addresses and exact schedule timestamps. Exercise authorized and rejected test transactions and publish a separate manifest **without modifying** the historical 100m Amoy manifest.

## Deployment hold
**No testnet transaction should be sent until steps 1–5 are completed and explicit authorization is given.** Mainnet remains **NO-GO**, subject to independent audit, legal review and production custody approval.
