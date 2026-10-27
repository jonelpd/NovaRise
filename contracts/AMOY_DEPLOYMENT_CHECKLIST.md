# NVRA — Polygon Amoy deployment checklist (draft v0.1)

**No deployment has taken place. No official NVRA contract address exists.**

## A. Local rehearsal — safe to execute now

The project includes a simulation that deploys the existing NVRA contract **only to an ephemeral Hardhat local network** and checks the treasury balance, fixed supply and a small transfer.

From `contracts/`:

```sh
npm install
npm run compile
npm run simulate:local
```

The script explicitly refuses any network other than Hardhat's local chain ID 31337. All addresses it prints are ephemeral; never send assets to them. The command uses no real wallet, private key or remote RPC.

## B. Decisions required before a real Amoy test transaction

- [ ] Obtain separate authorization for the actual **Amoy testnet** deployment.
- [ ] Agree on a dedicated **testnet treasury public address**; verify it independently. Never share its seed phrase or private key.
- [ ] Confirm the responsible signer and how they will approve the transaction **outside the repository and chat**.
- [ ] Confirm network is Polygon Amoy (chain ID **80002**) and use only testnet gas tokens. Verify RPC, explorer and faucet using current official Polygon documentation.
- [ ] Record the exact reviewed commit, compiler version, optimizer settings, token name, symbol, supply and constructor treasury address.
- [ ] Review the source and compiled bytecode; check that no admin mint, freeze or upgrade function exists.
- [ ] Ensure no private keys, mnemonic phrases, passwords, RPC API tokens or wallet exports are committed or pasted into logs.
- [ ] Obtain legal/product approval for the intended use. Testnet tokens have no promised value.

## C. After a separately approved Amoy deployment

- [ ] Capture the chain ID, contract address, deployment transaction hash, block number and treasury address.
- [ ] Verify source code and constructor arguments on a recognized Amoy explorer.
- [ ] Compare `totalSupply()` and `MAX_SUPPLY()` with 100,000,000 × 10^18 base units.
- [ ] Confirm all tokens initially belong to the testnet treasury, not the deployer.
- [ ] Test a transfer, an allowance and a transferFrom using **test-only** addresses and tiny amounts.
- [ ] Confirm supply remains constant and events match expectations.
- [ ] Publish a report clearly marked **TESTNET — NOT A REAL TOKEN OFFERING**.

## Explicit limits

This repository does **not** include a script capable of deploying to Amoy, any RPC URL or signer credentials. The local rehearsal must not be mistaken for a public-chain deployment. Do not use the experimental token or vesting model for real funds without independent security and legal review.
