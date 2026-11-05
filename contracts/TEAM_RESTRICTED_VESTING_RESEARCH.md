# Team allocation — immutable vesting recipient research

**UNDEPLOYED / NOT AUDITED / LOCAL ONLY.**

`NVRATeamRestrictedVaultDraft.sol` is a separate prototype of the 150,000 NVRA team allocation. Unlike the general-purpose vault, its payout function has **no recipient argument**. The only destination is an immutable vesting contract supplied at deployment. Even an authorized controller cannot direct this vault's release to an arbitrary wallet through its public interface.

Local tests cover the fixed recipient, 150k lifetime cap, access checks, rejection of non-contract vesting destinations and a real `NVRATeamVesting` cliff/linear release.

**Unresolved:** the existing atomic CREATE2 factory still deploys the *general-purpose* vault for bucket 3. This restricted draft is **not integrated into the atomic factory or official Safe test**. The local controller is an insecure mock, the vesting contract's code identity is not verified, its beneficiary can be changed through ownership transfers, and late funding may accelerate unlocks. A contract-code check does not prove the vesting destination is genuine or audited. The test uses a token minted directly to the restricted vault only to exercise its behavior.

**Required before production:** integrate the restricted vault into an audited atomic factory; verify the exact vesting implementation and beneficiary, lock beneficiary policy and funding time, enforce actual Safe 3-of-5 approvals, add malicious-destination tests, and commission independent security and legal reviews. No mainnet deployment is authorized.
