# NVRA Access Pass — automated verification (2026-10-29)

## Local result
- JavaScript syntax check: passed (Node.js v22).
- Eight simulated RPC checks: passed after fixing the test expectation for ABI address padding.
- Checks: successful balance read and ABI selector, invalid address (no RPC), zero balance, wrong chain, missing contract code, unexpected token decimals, RPC failure, and English messages.
- No production code changes were required by these tests.
- **Limitations:** the mock checks do not prove a real RPC connection, CORS support, blockchain bytecode identity, token balance, wallet provider behavior, or visual browser compatibility.

## External connectivity attempt
From the execution environment, DNS resolution failed for both `jonelpd.github.io` and `rpc-amoy.polygon.technology` (curl error 6). This is an environment limitation, not evidence that the live site or RPC is down.

## Release gate
Do not describe Access Pass as verified on-chain until:
1. Browser loads both language versions and the JS bundle.
2. A real Amoy RPC returns chain ID 80002 and nonempty code for the recorded token address.
3. Contract bytecode/source and 18-decimal ERC-20 behavior are verified independently.
4. Known wallet balance agrees with a block explorer.
5. CORS, wallet connection, mobile layout and error states pass real-browser tests.

No new utility contract has been deployed.
