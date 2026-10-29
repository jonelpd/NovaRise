# NVRA preliminary vesting security review — 2026-10-29

## Scope and status
Static review and test additions only. **Not an independent audit; no successful CI result verified in this session.** No deployment or token transfers on a public network.

## Current candidate
- `NVRAMainnetCandidate.sol`: fixed 1,000,000 NVRA minted once to a deployed contract address. A deployed contract address is **not** proof of a secure multisig.
- `NVRATeamVesting.sol`: 12-month-cliff-plus-36-month-linear **concept**; constructor takes seconds, and exact calendar dates must be approved separately.
- `MockNVRATreasury.sol`: intentionally insecure test-only contract. **Never deploy or fund in production**.

## Findings and controls
1. **Transferable beneficiary rights:** OpenZeppelin VestingWallet is Ownable; the beneficiary can transfer ownership. Decide whether that is permitted. If not, design and independently review non-transferable beneficiary controls before any deployment.
2. **Late deposits:** Funding a vesting wallet after vesting has progressed can immediately unlock vested portions. Fully fund at the intended start, reconcile allocation and monitor deposits.
3. **No revocation:** The current vesting contract does not allow the treasury to revoke unvested tokens. Confirm policy and legal terms before finalizing.
4. **No allocation enforcement:** Vesting does not enforce bucket allocations or approved spending purposes. Define governance, caps and treasury controls separately.
5. **Exact timestamps:** Solidity schedules use seconds, not calendar months; choose and publish exact start, cliff and end timestamps.
6. **Custody:** Candidate token checks that treasury has code but cannot validate multisig signers or threshold. Validate Safe configuration independently.
7. **Testing:** Added test cases for cliff boundary, release, beneficiary ownership transfer and late funding. **Execution result pending confirmation**.

## Required before mainnet
- Obtain passing reproducible CI compile and test logs tied to a specific commit.
- Add fuzz/invariant tests, independent security audit and remediation.
- Approve Safe threshold, signers, beneficiary policy, allocations and precise dates.
- Conduct legal review for Spain/EU, including MiCA applicability, before any offering or launch.

**Not ready for mainnet.**
