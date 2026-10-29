# NovaRise — triage of Safe npm audit critical advisories

Date: 2026-10-29. Evidence: [GitHub Actions run #25](https://github.com/jonelpd/NovaRise/actions/runs/40865097527), commit `16b2324`, green compile-and-test job and npm audit details.

## Findings from actual CI logs

The isolated Safe dependency tree reports **6 affected package entries: 4 critical and 2 high**. These are npm's transitive package severity classifications, **not six independently proven exploits**.

| npm package | Severity | Why it appears | npm fixAvailable |
|---|---|---|---|
| `elliptic` | Critical | Multiple ECDSA/EDDSA advisories, including [GHSA-vjh7-7g9h-fjfh](https://github.com/advisories/GHSA-vjh7-7g9h-fjfh), and [GHSA-848j-6mx2-7j84](https://github.com/advisories/GHSA-848j-6mx2-7j84) | false |
| `@ethersproject/signing-key` | Critical | Transitive dependency on `elliptic` | false |
| `ethers` | Critical | Depends on `@ethersproject/signing-key` and `@ethersproject/providers` | false |
| `@safe-global/safe-contracts` | Critical | Direct package depends on vulnerable `ethers` tree | false |
| `@ethersproject/providers` | High | Transitive dependency on `ws` | true |
| `ws` | High | WebSocket denial-of-service advisories [GHSA-3h5v-q93c-6h6q](https://github.com/advisories/GHSA-3h5v-q93c-6h6q) and [GHSA-96hv-2xvq-fx4p](https://github.com/advisories/GHSA-96hv-2xvq-fx4p) | true |

### Impact analysis

- The project imports **Solidity sources** from the pinned `@safe-global/safe-contracts@1.4.1-2` package into Hardhat. It does **not** import that package's `ethers` JavaScript runtime into the NVRA tests.
- `npm audit` reports advisories for the **installed npm dependency tree**, not proof that the Solidity contracts contain these JavaScript issues.
- Exposure from `elliptic` and `ws` depends on whether vulnerable JavaScript functions are executed with attacker-controlled inputs. This has **not yet been established** for NovaRise.
- CI's isolated Safe package is currently installed with npm and then only its Solidity contract directory is copied into Hardhat. This suggests an opportunity to install/copy **only vetted Solidity source artifacts** rather than its entire JavaScript dependency tree, but that approach must be designed and verified before changing the tested source chain.
- The four critical entries are **one linked dependency chain**, not four unrelated critical bugs in the on-chain Safe implementation.

## Priority actions

1. **P0:** Never place production signing keys in this environment. No mainnet release until audit and custody controls are complete.
2. **P1:** Design a reproducible Solidity-only Safe source acquisition method pinned by version, integrity hash and repository reference. Verify compiler output against the current tested version and rerun all Safe tests. Do not silently substitute a different Safe version.
3. **P1:** Review the `elliptic` advisories and determine whether any JS signer implementation in the future production process can reach affected functions; prohibit vulnerable signer use if so.
4. **P1:** Review the isolated Safe lockfile for possible compatible `ws` and provider updates; do not use `npm audit fix --force` or change major versions blindly.
5. **P1:** Triage the root Hardhat tree separately (47 entries: 18 high, 10 moderate, 19 low). The advisory log includes Hardhat, undici, adm-zip and other tooling packages; changing to Hardhat 3 is a separate migration requiring full regression tests.
6. **P2:** Repeat both npm audits and the full local Solidity test suite after any dependency change; preserve artifact hashes and independent audit findings.

## Decision

**No dependency or Solidity version change has been made as part of this triage.** CI run #25 passed, but the npm advisories remain open. **Mainnet readiness: NO-GO.**
