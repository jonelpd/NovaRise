# NovaRise — Mainnet readiness gates (draft)

Status: NOT READY FOR MAINNET. Date: 2026-10-29. Consolidated preliminary security assessment: [nvra-consolidated-security-assessment-2026-10-29.md](nvra-consolidated-security-assessment-2026-10-29.md).

## Gate A — Code and tests
- [x] Separate 1,000,000 NVRA candidate Solidity source committed.
- [x] Draft team vesting source and local tests committed.
- [x] CI workflow committed for local Hardhat compilation/tests.
- [x] GitHub Actions run #7 reports **Success** for commit `4bdd491871f17ed07423d3f6a27803f9dcfc51e4` (run ID `40858729335`), based on the repository owner's GitHub Actions screenshot, 2026-10-29. Compilation and local test job marked green. Independent audit and broader security tests remain pending.
- [ ] Complete fuzz/property-based invariant tests and remaining edge cases. Boundary, late-funding, owner rotation, Safe adversarial signature and deterministic supply-accounting tests have passed through GitHub Actions run #19 (commit `aac3976`), per owner screenshot.
- [ ] Reproducible dependency lockfile and verified compiler output.
- [ ] Independent security review and fixes.

## Gate B — Custody and token release
- [ ] Decide whether a token is required by validated utility.
- [ ] Approve final allocation, recipients and initial circulating supply.
- [ ] Approve Safe multisig signers, threshold, backups, recovery and governance. A **3-of-5 proposal** and operational controls are documented in [multisig-treasury-design-v1.md](multisig-treasury-design-v1.md), but no Safe is deployed and no signers are approved.
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

## CI verification reference (for repository owner)
1. Open https://github.com/jonelpd/NovaRise/actions/workflows/nvra-contract-tests.yml
2. Select the latest run on the default branch; run #19 for commit `aac3976` was reported green by the owner, but verify any subsequent code changes independently.
3. Confirm both **Compile Solidity contracts** and **Run all local Hardhat tests** are green; inspect job logs and exact tested SHA.
4. If no run exists, use **Run workflow** on the default branch, or verify GitHub Actions is enabled.
5. Capture any failure log for remediation. A green local run is necessary but not an independent security audit.

## Verified milestone — 2026-10-29
- Screenshot of GitHub Actions run https://github.com/jonelpd/NovaRise/actions/runs/40858729335 shows overall Success and a green compile-and-test job on commit `4bdd491`.
- This establishes a passing CI milestone for that commit, **not** proof of contract security or production readiness.

## Security assessment — 2026-10-29
- Preliminary internal report: [NVRA consolidated security assessment](nvra-consolidated-security-assessment-2026-10-29.md).
- Current conclusion: **NO-GO for mainnet**. Passing CI is necessary but insufficient; outstanding custody, legal, reproducibility and independent audit gates remain.
