# NovaRise — Mainnet readiness gates (draft)

Status: NOT READY FOR MAINNET. Date: 2026-10-29.

## Gate A — Code and tests
- [x] Separate 1,000,000 NVRA candidate Solidity source committed.
- [x] Draft team vesting source and local tests committed.
- [x] CI workflow committed for local Hardhat compilation/tests.
- [ ] Confirm successful CI run with logs and commit SHA; remediate all failures. **Not yet verified:** this environment cannot access the public GitHub host for a local clone, and the available GitHub integration does not expose a general workflow-run listing. Do not mark tests passed without a successful Actions run.
- [ ] Add boundary, late-funding, ownership-transfer, adversarial and invariant tests.
- [ ] Reproducible dependency lockfile and verified compiler output.
- [ ] Independent security review and fixes.

## Gate B — Custody and token release
- [ ] Decide whether a token is required by validated utility.
- [ ] Approve final allocation, recipients and initial circulating supply.
- [ ] Decide Safe multisig signers, threshold, backups, recovery and governance.
- [ ] Approve precise vesting timestamps and transferability of beneficiary rights.
- [ ] Build spending controls for reward and community budgets; vesting alone does not restrict purpose.
- [ ] Review all deployment arguments and on-chain destination addresses independently.

## Gate C — Legal and operations
- [ ] Confirm responsible legal entity and governance.
- [ ] Obtain legal advice for Spain/EU including MiCA, marketing and any public offering implications.
- [ ] Publish risks and correct consumer disclosures; do not promise returns.
- [ ] Rehearse end-to-end on testnet and verify source code.
- [ ] Formal documented go/no-go decision for mainnet, distinct from testnet prototype.

## Explicit constraints
Existing Amoy token: 100,000,000 test NVRA, no monetary value. Future mainnet design: 1,000,000 NVRA, not deployed. A test contract receiving the candidate's tokens is not proof of a production Safe multisig. Never use the test-only MockNVRATreasury for real custody; it is intentionally unsecured. No production private keys in repository. No funds or tokens transferred by this checklist.

## CI verification instructions (for repository owner)
1. Open https://github.com/jonelpd/NovaRise/actions/workflows/nvra-contract-tests.yml
2. Select the most recent run after commit `4675e5d3b2a03c3872ee9d68ee532bd83faa3842` (or a newer commit containing that fix).
3. Confirm both **Compile Solidity contracts** and **Run all local Hardhat tests** are green; inspect job logs and exact tested SHA.
4. If no run exists, use **Run workflow** on the default branch, or verify GitHub Actions is enabled.
5. Capture any failure log for remediation. A green local run is necessary but not an independent security audit.
