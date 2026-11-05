# Official Safe 3-of-5 + atomic vaults — local integration

**UNDEPLOYED / NOT AUDITED. No production Safe, owners or keys configured.**

`test/atomic-factory-safe-integration.test.cjs` deploys the **official Safe 1.4.1 singleton and proxy** with five temporary local Hardhat owners and a threshold of three. The Safe controls the `NVRAAtomicFactoryDraft` vaults; it does not initially custody any of the 1,000,000 NVRA. All supply is minted directly to five vaults.

The tests check that outsider direct calls fail, two owner approvals cannot execute a Safe transaction, and three owner approvals can authorize a team-bucket payout. The vault enforces its 150k ceiling independently of Safe approvals.

**Important remaining issue:** the local test deliberately pays the team allocation straight to a recipient, not to a mandatory vesting contract. A 3-of-5 Safe can authorize any recipient that the draft vault accepts. The Safe is therefore **necessary for authorization but insufficient for policy enforcement**. A production team vault must restrict recipients to audited vesting destinations and enforce beneficiary/time policy; other buckets also need purpose-specific controls.

Safe owner changes, modules, guards, fallback handlers, signature variants, chain ID, reentrancy, unexpected token transfers, malicious controller configuration, vesting and recovery must be reviewed separately. Local tests do not verify a deployed Safe on Base Mainnet or replace an independent audit.

**No mainnet deployment or real funds are authorized.**
