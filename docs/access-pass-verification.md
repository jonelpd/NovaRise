# NVRA Access Pass — verification and first utility contract specification
Updated: 2026-10-29. Status: design and static checks; external RPC/browser tests pending.

## Existing demo
- Spanish: `access-pass.html`; English: `access-pass-en.html`.
- Read-only JS: `assets/access-pass.js`.
- Chain: Polygon Amoy, ID 80002.
- NVRA test contract: `0xCCC748d63333F9aF58f259CDF771d5AB1226e20D`.
- ABI method used: `balanceOf(address)` selector `0x70a08231`, 18 decimal places expected.
- No approvals, transfers, signatures or funds requested by balance checking. Connecting a wallet may ask for account-access permission.
- Third-party RPC receives requests. No balance lookup proves identity or ownership of an address.

## Manual verification checklist
1. Open each language version and confirm mobile layout and keyboard accessibility.
2. Enter malformed addresses and confirm no network lookup.
3. Query an address known to have no test NVRA and verify zero balance.
4. Query the recorded test treasury address and compare the exact raw balance with a block explorer.
5. Disconnect or reject wallet permission and verify graceful fallback to manual address entry.
6. Block the RPC endpoint and confirm the user sees a useful error, not an invented balance.
7. Confirm the deployed contract's source, decimals and chain via independent block explorer data.
8. Check browser console and network tab for CORS errors. If the public RPC blocks browser requests, choose a documented browser-compatible provider without exposing credentials.
9. Confirm the English homepage links to the English demo.
10. Check all tests again after GitHub Pages finishes deployment.

## Next contract candidate: NVRAAccessRegistry (specification only)
**Purpose:** a voluntary testnet registry demonstrating time-limited access to a sandbox feature based on a wallet's NVRA balance, without custody or spending.

### Scope
- Read ERC-20 balance at the moment of eligibility checking; never promise ongoing eligibility based on a past check.
- Define an explicit configurable threshold denominated in smallest token units, only after stakeholder review.
- Optional off-chain service can issue a short-lived session after a signed challenge proving wallet control; signature must include domain, chain ID, nonce, expiration and intended action.
- No deposit, staking, token burn, allowance, payment or transfer in the first iteration.
- No personal data on chain.
- If on-chain state is later justified, specify permissions, emergency policy and upgrade strategy before implementation.

### Threat model
- Wallet address is public information, not authentication.
- Balance can change between reads and access checks.
- RPC responses may be stale, unavailable or malicious; use independent verification for critical operations.
- Signatures may be replayed without a unique nonce, domain and expiry.
- Token-gating can exclude users; basic educational analysis stays free.
- A contract cannot securely infer real-world identity or skill-game outcomes without trusted inputs.

### Acceptance criteria before deploying any new contract
- Independently verify deployed NVRA token bytecode, ABI and decimals.
- Implement deterministic unit and integration tests, including zero balance, balance changes, wrong chain and RPC failures.
- Document access policy, cancellation and privacy.
- Independent security review and testnet rehearsal.
- Explicit approval for any deployment; no mainnet or financial functionality by default.
