# NovaRise — reproducible dependency build migration

Date: 2026-10-29. Status: **dependency lockfile migration completed and CI verified** (GitHub Actions run #22, commit `f71be12`, reported Success in owner's screenshot on 2026-10-29). This is a reproducible npm dependency install baseline, not a complete byte-for-byte reproducible Solidity build guarantee.

## Why this is needed

The Hardhat project uses ethers v6, while the pinned official Safe Solidity package declares an ethers v5 peer dependency. They are intentionally installed as separate npm projects under `contracts/` and `contracts/safe-deps/`. GitHub Actions copies only the official Safe Solidity package into Hardhat's standard resolver location.

## Current CI behavior

1. Generate `contracts/package-lock.json` and `contracts/safe-deps/package-lock.json` in the ephemeral CI runner.
2. Run `npm ci` independently in each package directory using the generated lockfiles.
3. Print resolved top-level dependencies and SHA-256 digests of both lockfiles.
4. Upload both lockfiles as the `nvra-npm-lockfiles` Actions artifact (30-day retention).
5. Compile Solidity and run the existing local tests.

**Important limitation:** generating lockfiles afresh in every run does **not** guarantee cross-run reproducibility. The lockfiles must be committed to Git, and CI must stop regenerating them.

## Next required action (after a green run)

1. Download the `nvra-npm-lockfiles` artifact from the successful GitHub Actions run.
2. Review its `package-lock.json` and `safe-deps/package-lock.json` files, package versions, resolved registries and integrity checksums. Confirm the archives' directory structure before committing.
3. Commit both reviewed lockfiles to their corresponding repository paths.
4. Remove the two `npm install --package-lock-only` steps from CI. Keep both `npm ci` steps, dependency inventory and SHA-256 output.
5. Run GitHub Actions again on the exact commit. Only after that run is green may the dependency-lock gate be marked complete.

## Additional controls

- Pin Node.js and npm versions to an approved supported runtime and consider exact package versions.
- Record the Solidity compiler versions (0.8.24 for NVRA; 0.7.6 for Safe), optimizer settings and deployed bytecode verification.
- Treat GitHub Actions `Success` as test evidence, not an independent security audit.
- Never introduce production keys or live network deployment credentials to this workflow.

No mainnet deployment is authorized.

## Completion evidence — 2026-10-29
- Both `contracts/package-lock.json` and `contracts/safe-deps/package-lock.json` are committed in Git.
- Workflow commit `f71be12` removes lockfile regeneration and automated commits, uses `npm ci` for both dependency trees, and sets read-only workflow permissions.
- GitHub Actions run #22 is green according to repository owner's screenshot (27 seconds).
- **Further hardening:** pin action revisions and runner image, verify compiler binaries and artifact hashes, perform independent reproducibility checks and supply-chain audit.
