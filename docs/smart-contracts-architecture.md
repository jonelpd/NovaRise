# NovaRise Smart Contracts — Technical Architecture v0.1
Updated: 2026-10-29 · Status: design only; not deployed.

## 1. Objective
Create an auditable, modular laboratory for NVRA utility on an existing EVM test network. The long-term possibility of a NovaRise blockchain is conditional on demonstrated usage, security and funding. This document does not announce a new blockchain, sale, token value or mainnet deployment.

## 2. Current baseline
- Existing public educational analyzer and community participation website.
- Experimental NVRA ERC-20 on Polygon Amoy (chain ID 80002): `0xCCC748d63333F9aF58f259CDF771d5AB1226e20D`.
- The testnet token has no monetary value. Do not accept or hold real user funds.
- The ERC-20 token is not Polygon's gas token; transaction gas is paid in the network's native asset.

## 3. Proposed modules (not yet built)
| Module | Purpose | First milestone |
|---|---|---|
| NVRA Access Pass | Demonstrate optional token-gated access to a sandbox feature | Read-only token balance verification; no transfers |
| NVRA Service Credits | Prototype a clearly disclosed, capped testnet payment for a demo service | Specify fees, refunds and failure handling before writing code |
| NVRA Gaming Adapter | Let a free skill-based demo game read eligibility or testnet achievements | Off-chain game with wallet connection optional |
| NVRA Community Participation | Explore verifiable proposals and nonbinding votes | Testnet-only demonstration; no binding treasury powers |
| Developer SDK | Document chain IDs, ABI, contract addresses and errors | Versioned integration examples |

## 4. Reference architecture
Browser (ES/EN) → explicit wallet connection → read-only EVM RPC → deployed NVRA testnet contract.
For optional write operations later: user confirmation → testnet transaction → confirmation monitoring → clear UI state.
Application backend may validate signed messages with nonce, expiration and domain binding; never trust a wallet address merely supplied as text.

## 5. Security rules
1. Keep the existing analyzer accessible without wallet or token.
2. Never request seed phrases, private keys, unlimited allowances or blind signatures.
3. No owner-only confiscation, hidden fees, yield promises, wagering or token-price claims.
4. Use established, pinned OpenZeppelin components, automated tests, static analysis and independent review before any production use.
5. Prevent reentrancy, unsafe external calls, replay, front-running, stale signatures and access-control errors as applicable.
6. Minimize permissions; prefer read-only prototypes first. Keep all secrets out of GitHub Pages and client JavaScript.
7. Label every testnet contract and balance as experimental and without monetary value.
8. No production deployment or real-value transfers without legal review, incident plan and independently reviewed treasury custody.

## 6. First prototype: read-only NVRA Access Pass
**Input:** wallet address and testnet chain ID 80002.
**Operation:** query ERC-20 `balanceOf(address)` on the official testnet contract.
**Output:** show balance and optional demo eligibility, explicitly marked nonbinding.
**No transactions, approvals, payments, transfers or custody.**
**Acceptance tests:** correct network; zero-balance wallet; positive-balance wallet; invalid address; disconnected wallet; RPC failure; chain switch; inaccessible RPC; Spanish/English labels; mobile wallet behavior.

## 7. Gate for further work
- Verify current deployed contract bytecode and source against repository artifacts.
- Correct stale repository statements about deployment.
- Confirm ABI, RPC and chain metadata using authoritative sources.
- Implement and test the read-only demo separately from the production analyzer.
- Publish security limitations and seek community feedback.
- Only after that consider a testnet service contract or gaming adapter.

## 8. Future NovaRise chain: decision criteria
Compare EVM L1 vs L2 based on actual transaction demand, decentralization/security assumptions, operating costs, validator/sequencer model, gas asset, bridging and migration, governance and regulatory feasibility. No chain choice or migration is approved.
