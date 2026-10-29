# Access Pass validation status — 2026-10-29

## Verified this session
- Both language pages and shared JavaScript exist in GitHub.
- English page styling and accessible status announcements aligned with Spanish page.
- No transaction-sending or token-approval method exists in the Access Pass client.
- Testnet balance reader checks chain ID, nonempty code, ABI response length and 18 decimals.
- Previous mocked checks are recorded in `docs/access-pass-test-results-2026-10-29.md`.

## NOT verified
- Real RPC connectivity and browser CORS: DNS access to public hosts failed from the execution container.
- GitHub Pages availability and visual browser tests: remote page could not be fetched.
- Contract identity: a reported deployed Amoy address is not proof that its bytecode matches `contracts/NVRAToken.sol`.
- Treasury balances, ERC-20 symbol and contract source verification against an explorer.

## Important documentation discrepancy
`contracts/amoy.manifest.json` and `contracts/scripts/amoy-readiness.cjs` describe a *preparation-only* manifest with `deployed:false` and `contractAddress:null`. The website and Access Pass refer to a separately reported Amoy contract address `0xCCC748d63333F9aF58f259CDF771d5AB1226e20D`. **Do not silently reinterpret or overwrite the preparation manifest as deployment evidence.** A deployment record needs verified transaction hash, source/compiler settings, bytecode and treasury attribution.

## Release criteria
1. Independently obtain chain ID 80002 and contract bytecode from two trustworthy sources.
2. Compare verified explorer source/compiler metadata with repository code.
3. Confirm ERC-20 name, symbol, decimals, total supply and two wallet balances on-chain.
4. Open both published pages in real desktop/mobile browsers and test wallet consent, invalid address and RPC outage.
5. Record results and only then mark the testnet prototype verified.

No new contract deployment or funds transfer is authorized by this document.
