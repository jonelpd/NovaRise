# Vesting identity enforcement at the team payout boundary

**Research only — no deployment, audit or production funding.**

`NVRATeamGuardedVaultDraft` is a new alternative team vault. It takes a deployed `NVRAVestingIdentityGuardDraft`, validates that guard on construction, and calls `guard.verify()` **again on every authorized release**, immediately before transferring tokens to the guard's immutable vesting address. Its public API has no arbitrary recipient argument. The 150,000 NVRA lifetime ceiling and factory-only token binding remain enforced.

Tests cover two legitimate payouts, budget limits, unauthorized access, and a beneficiary ownership transfer between payouts causing the second payout to revert.

**Outstanding:** this vault is not yet integrated into the five-vault CREATE2 factory or official Safe 3-of-5 integration test. The guard's expected codehash and beneficiary must be independently approved, and the guard contract itself must be authenticated by the factory or a known codehash; accepting arbitrary guard contracts is unsafe. Ownership can change **after the final payout** and vesting itself remains transferable; checking before funding is not a permanent lock on beneficiary. A non-transferable vesting implementation or robust beneficiary governance is needed. Late funding, generic vault recipient policies, audit and legal readiness remain unresolved.

No Base Mainnet operations are permitted.
