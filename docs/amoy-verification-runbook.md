# Amoy verification — runbook (2026-10-29)

A read-only verification script is now available at `tests/verify-amoy.cjs`, with a manually triggered GitHub Actions workflow `.github/workflows/verify-amoy.yml`.

## Run from GitHub
1. Open the repository's **Actions** tab.
2. Select **NVRA Amoy read-only verification**.
3. Click **Run workflow**, select the default branch, and start the job.
4. Open the resulting job log. The script will check chain ID 80002, nonempty contract bytecode, 18 decimals, symbol NVRA, total supply and the recorded treasury's testnet balance.
5. Save the log as evidence. A passing run **does not** establish source-code identity, independent audit, token economics or suitability for production.

## Run locally
```sh
node tests/verify-amoy.cjs
```
No credentials or wallet connection required. Optional `NVRA_AMOY_RPC` environment variable may override the default public endpoint. Only use trusted HTTPS RPC endpoints.

## Outstanding source verification
Record the creation transaction, creator, compiler version, optimization settings, linked libraries and verified source from an independent explorer. Recompile reproducibly and compare deployed runtime bytecode (accounting for metadata and immutables where applicable). The preparation-only manifest must remain untouched until those facts are confirmed.

**Current status:** Script and workflow committed; no successful live execution or source match has been observed from this environment. No transactions were sent.
