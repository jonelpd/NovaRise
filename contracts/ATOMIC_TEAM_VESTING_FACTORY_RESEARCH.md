# Atomic distribution with a vesting-restricted team vault — local research

**Not deployed, not audited, not production-ready.**

`NVRAAtomicVestingFactoryDraft` creates five CREATE2 vaults in one transaction. Four are general budget vaults, while bucket 3 (150,000 NVRA team allocation) is `NVRATeamRestrictedVaultDraft` with an immutable destination pointing to `NVRATeamVesting`. The factory mints the full 1m supply to the five vaults and binds each vault to the token, reverting everything if any step fails.

The team vault has **no arbitrary-recipient release function**; even its controller can only call `releaseToVesting(amount)`. Local tests verify the five allocations, address predictions, one-time initialization, team funding to vesting, cliff behavior and supply conservation.

**Remaining launch blockers:**

- Tests here use the **unsafe mock controller**, not a real Safe. The official Safe 3-of-5 integration tests cover the earlier generic factory, not this new mixed-vault factory.
- The factory checks that the vesting address contains contract code, but does not verify its implementation, beneficiary, schedule, or ownership-transfer policy. An attacker or misconfiguration could choose a malicious vesting contract.
- The team beneficiary and vesting start/cliff/linear durations remain subject to policy review. Late funding into a live vesting contract can unlock tokens immediately according to its schedule.
- Other four vaults still allow Safe-authorized arbitrary recipient releases, so economic routing and allocation purpose restrictions remain unresolved.
- Independent security audit, Safe owner custody verification, legal review and explicit authorization are mandatory before mainnet.

**Next:** test the mixed-vault factory with an official Safe proxy; review vesting identity and timing; strengthen purpose-specific policies; independently audit. No mainnet deployment or real funds.
