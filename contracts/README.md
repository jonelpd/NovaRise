# NVRA — experimental ERC-20 prototype

**Status: source-code prototype only.** No token has been issued, no contract has been deployed, no public sale exists, and no official contract address is available. The proposed 100 million supply remains subject to validation.

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

No testnet or mainnet configuration or deployment script is included. Do not connect a wallet or add private keys to this repository.

## Before any testnet deployment

1. Validate utility and tokenomics; determine whether a token is actually needed.
2. Specify multisig treasury, role separation, distribution and vesting contracts.
3. Perform threat modelling, independent security review and full test coverage.
4. Review applicable legal requirements, including MiCA where relevant, and determine responsible entity.
5. Only then prepare a separate, reviewed testnet deployment procedure and record the contract address publicly with clear TESTNET labeling.

This prototype is **not audited**, is not financial advice, and is not ready for real funds.
