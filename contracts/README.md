# NVRA — experimental ERC-20 prototype

**Status: experimental source prototype and separately documented Polygon Amoy testnet deployment.** A testnet NVRA contract is recorded at `0xCCC748d63333F9aF58f259CDF771d5AB1226e20D` (chain ID 80002). This repository README does not by itself establish that the deployed bytecode matches the source; that verification remains pending. Testnet tokens have no monetary value. There is no public sale or mainnet launch.

## Design

- Solidity ^0.8.24, OpenZeppelin ERC-20 v5.
- Name: NovaRise Utility Token; symbol: NVRA; decimals: 18.
- Immutable 100,000,000 NVRA supply, minted in full **once at deployment** to the constructor-supplied treasury address.
- No further minting, owner, privileged transfer controls, tax, yield, burn automation, pause or upgrade.
- **Important:** Minting the entire supply to a treasury does *not* imply that tokens are circulating. Treasury custody, vesting and allocation controls must be designed separately. Never use a personal wallet as a production treasury.

## Run locally

From this directory with a compatible Node.js version and npm:

```sh
npm install
npm test
npm run compile
```

This source directory does not include a reproducible deployment script or configuration for the recorded Amoy deployment. Do not connect a wallet or add private keys to this repository.

## Before any further testnet deployment

1. Validate utility and tokenomics; determine whether a token is actually needed.
2. Specify multisig treasury, role separation, distribution and vesting contracts.
3. Perform threat modelling, independent security review and full test coverage.
4. Review applicable legal requirements, including MiCA where relevant, and determine responsible entity.
5. Only then prepare a separate, reviewed testnet deployment procedure and record the contract address publicly with clear TESTNET labeling.

This prototype is **not audited**, is not financial advice, and is not ready for real funds.

## Smart-contract ecosystem roadmap

See [NovaRise Smart Contracts — architecture v0.1](../docs/smart-contracts-architecture.md) for the proposed read-only access-pass laboratory, security gates, gaming integrations and conditional long-term blockchain vision.

## Future 1,000,000 NVRA mainnet candidate — DRAFT, NOT DEPLOYED

The existing `src/NVRAToken.sol` and Polygon Amoy deployment remain the **100,000,000 test-token prototype**. Do not change the historical prototype to represent a future mainnet token.

- `src/NVRAMainnetCandidate.sol`: a **separate, undeployed** 1,000,000 NVRA fixed-supply candidate. Its constructor requires a previously deployed contract as treasury recipient; this does **not** prove that the recipient is a secure multisig.
- `src/NVRATeamVesting.sol`: separate, undeployed cliff-plus-linear vesting draft using OpenZeppelin VestingWallet. Durations are specified in seconds; 12 and 36 calendar months are **not automatically equivalent** to 365 and 1,095 days.
- `src/MockNVRATreasury.sol`: **INSECURE TEST MOCK ONLY**. It allows any caller to transfer its tokens and must NEVER be used or funded in a live environment.
- `test/mainnet-candidate.test.cjs`: local-only supply, treasury validation and cliff boundary tests.

**Security caveats:** VestingWallet beneficiary ownership is transferable, late funding can release an already-vested portion immediately, and allocation purpose/budget controls are not implemented. These drafts are not audited and do not authorize deployment. A reviewed Safe multisig and separate allocation-control contracts are recommended.

See [treasury and vesting architecture](../docs/treasury-vesting-architecture-v1.md) and [tokenomics V1](../docs/tokenomics-v1-mainnet-plan.md).
