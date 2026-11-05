# Vesting identity guard — research draft

**Local-only, not audited, not integrated into factory, no mainnet deployment.**

`NVRAVestingIdentityGuardDraft` checks the selected vesting contract's runtime codehash, current `owner()` (treated as the vesting beneficiary), `start()`, `duration()` and `cliffDuration()` against immutable expected values. It checks once on construction and can be called again via `verify()`. The expected codehash MUST come from independently reviewed bytecode; copying a malicious contract's own codehash would defeat the security objective.

**Important limitations:**
- The existing atomic factory does **not** use this guard; this PR adds isolated checks and tests only.
- VestingWallet ownership can change after a check. A guard's `verify()` does not prevent a future transfer, nor does it automatically run on a payout. Enforce identity at the actual vault release boundary, or deploy a non-transferable beneficiary design after independent review.
- Runtime codehash equality alone does not prove safety, verified source, correct proxy implementation, beneficiary custody, schedule or economic fairness. Proxy bytecode can remain unchanged while its implementation changes.
- Late funding of a live vesting contract can unlock immediately; guard does not solve this.
- A future integrated factory must commit to independently approved codehash, beneficiary and schedule and validate those inputs before mint/binding and at funding.
- The official Safe 3-of-5 tests are local and do not authorize mainnet operations.

No funds, signatures or Base Mainnet deployments.
