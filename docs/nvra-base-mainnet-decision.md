# NovaRise NVRA — Base Mainnet production decision

Decision date: 2026-10-29. **Selected network: Base Mainnet (chain ID 8453). Fixed supply: 1,000,000 NVRA, 18 decimals.** This supersedes Polygon PoS chain 137 as the *target* in earlier provisional mainnet plans. The existing 100m NVRA token on Polygon Amoy remains an unrelated historical experiment. **No Base deployment or token issuance has occurred.**

## Production design

- Token source currently: `contracts/src/NVRAMainnetCandidate.sol`. It mints exactly 1,000,000 NVRA once to a predeployed contract treasury; no owner mint, taxes or upgrade hooks.
- Production treasury target: independently verified Safe 3-of-5, five distinct real signers, secure custody and recovery. Constructor's contract-code check does NOT authenticate Safe.
- Provisional distribution: ecosystem 300k, development 250k, community 200k, team 150k, future liquidity 100k.
- Team: 12-month cliff then 36-month linear vesting, subject to finalized UTC T0 and beneficiary terms.
- Budget vault prototype uses fixed 30/90-day periods, not calendar months/quarters. Must reconcile and audit before funding.
- Liquidity retained in Safe is NOT on-chain locked. Requires enforceable controls or accurate disclosure and separate approval.
- Base gas is paid in ETH, not NVRA. ERC-20 decimals allow small denominations; 1m supply is not a cap on number of app transactions.
- First practical token utility: access to a working NovaRise digital service. Subsequent roadmap includes games, applications, analytics, community features, and integrations; do not advertise unfinished services as live.

## Implementation status

- Hardhat config supports optional read-only `BASE_MAINNET_RPC_URL` with network name `base`, chain ID 8453, and **no deployment accounts**.
- Run `BASE_MAINNET_RPC_URL=https://your-trusted-base-rpc npm run base:readiness` in `contracts/`. Optional `BASE_SAFE_ADDRESS` checks deployed contract interface, threshold and owner count. These are preliminary checks, not Safe code verification.
- Do not place seed phrases, private keys or sensitive credentials in GitHub, CI logs or chat.
- No Base deployment transaction script or automatic deployment workflow is authorized.

## Mainnet release blockers

1. Define and implement first functioning utility product, including wallet authentication and abuse controls.
2. Name legally responsible entity; obtain qualified EU/Spain MiCA and marketing/distribution review.
3. Appoint and verify five Safe signers, recovery and governance policy; independently verify production Safe deployment.
4. Finalize on-chain allocation enforcement, liquidity lock, vesting parameters, initial circulation and UTC T0.
5. Independent smart contract and deployment security audit; remediate findings, verify code hashes.
6. Explicit transaction-specific go/no-go approval, gas funding, constructor args and independent review before any deployment.
7. After authorized deployment: verify contract on BaseScan, publish verified addresses, supply and transaction hashes.

**Mainnet work begins now; no further Amoy test cycles are planned. This does not waive security or legal requirements.**
