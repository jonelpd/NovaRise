# Official Safe + mixed atomic factory + vesting integration

**Local-only research. No deployment, funds, production keys or independent audit.**

`test/atomic-vesting-factory-safe.test.cjs` exercises the official Safe 1.4.1 singleton/proxy, five ephemeral owners and a 3-of-5 threshold, as the controller for `NVRAAtomicVestingFactoryDraft`. The factory creates four generic budget vaults plus a team-only restricted vault, mints 1,000,000 NVRA across them and binds all to the new token.

The suite checks two signatures are insufficient; three distinct owner approvals can release team tokens **only into the immutable vesting address**, not directly to a beneficiary or other recipient. It checks the cliff, full unlock, team cap, and fixed supply. This addresses the insecure mock-controller gap in prior mixed-factory tests.

**Outstanding critical checks:** the vesting address is only validated as a contract, not as a verified immutable beneficiary/schedule/codehash. The existing `NVRATeamVesting` beneficiary may be transferable and late funding can unlock immediately. The other four generic vaults still permit arbitrary Safe-approved recipients. Official Safe local tests do not guarantee production owner custody, safe modules, guards, recovery or operational policy. Independent audit, legal review and explicit mainnet authorization remain mandatory.

Do not deploy or fund these drafts on Base Mainnet.
