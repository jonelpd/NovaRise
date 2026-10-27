# Polygon Amoy — NVRA experimental deployment plan v0.1

**State: PREPARATION ONLY. No deployment has been authorized or performed.**

## Network and scope

- Polygon PoS **Amoy testnet**, chain ID **80002**, native test gas token **POL**.
- The repository's Hardhat configuration intentionally remains **local-only** (chain ID 31337); no testnet RPC endpoint, account, private key or deployment script is configured.
- The file `amoy.manifest.json` records the intended network and expected token parameters. Its null addresses and transaction hash mean **nothing has been deployed**.
- The proposed ERC-20 supply is **100,000,000 NVRA** with 18 decimals. This is a conceptual test parameter, not a circulating supply or promise to issue tokens.

## Release gates — all required before a testnet transaction

1. **Current CI:** confirm the latest GitHub Actions run passes structural checks, Solidity compilation and Hardhat tests after any toolchain upgrade.
2. **Treasury decision:** approve a dedicated testnet-only treasury address controlled by authorized signers. Do not use a personal wallet as an assumed final production treasury.
3. **Security review:** inspect bytecode, constructor arguments, allowances, transfers, vesting semantics and signer separation; record known limitations. A testnet deployment does not replace an independent audit.
4. **Operational setup:** select and independently verify an Amoy RPC endpoint, a block explorer, a gas funding faucet, and a safe wallet-signing process. Do not store secrets in source files, logs, chat or GitHub.
5. **Explicit approval:** obtain a separate decision to perform an actual testnet deployment, including the destination treasury address and responsible signer.
6. **Legal and product review:** no public distribution, presale, promise of returns or claims that the token is live.

## Planned testnet verification (after separate approval)

- Record the transaction hash, contract address, network ID, deployer and constructor treasury address.
- Verify source code and constructor arguments on a trusted Amoy explorer.
- Read `name()`, `symbol()`, `decimals()`, `MAX_SUPPLY()`, `totalSupply()` and `balanceOf(treasury)`; compare with expected values.
- Execute small testnet transfers and allowances between **test-only** addresses; check events and unchanged total supply.
- Separately test the funding and release of a vesting wallet with **testnet-only** tokens.
- Publish a report that explicitly labels the addresses and token as **TESTNET / NO MONETARY VALUE**.

## Local checks available now

From `contracts/`:

```sh
npm run preflight
npm run amoy:readiness
npm run compile
npm test
```

The first two commands do not require installing Hardhat dependencies, provided Node.js is installed. The latter two require npm packages and Solidity compiler downloads. None of these commands submits transactions.

## Important caveats

A successful CI run establishes that the configured checks passed, **not** that the contract has been audited or is safe for real assets. The project still lacks finalized tokenomics, real vesting/cliff specifications, legal review and approved production custody.
