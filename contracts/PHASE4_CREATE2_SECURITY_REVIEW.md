# Phase 4 — CREATE2 and immutable vesting security review

Status: EXPERIMENTAL. No merge or Base Mainnet deployment authorized. This is not an independent audit.

## Architecture reviewed
- CREATE2 deploys five recipient vaults, including a factory-only team escrow.
- Token is deployed before immutable vesting to satisfy the token code check.
- Team escrow forwards 150,000 NVRA to vesting atomically, before vesting start.
- Remaining four vaults allow controller-authorized releases.

## P0 blockers
1. **Safe identity not authenticated.** Factory accepts any deployed contract as controller. A code-length check is not evidence of a Safe 3-of-5. Existing official-Safe tests prove compatibility only. Before deployment require a reviewed chain-specific manifest: Safe proxy, singleton, five owners, threshold three, modules, guard, fallback handler, and deployment chain ID. Verify on-chain state before any production operation.
2. **Unrecoverable ERC-20 surplus remains a policy blocker.** The immutable vesting entitlement is now fixed at 150,000 NVRA, so late direct transfers cannot increase beneficiary release rights. However, arbitrary ERC-20 transfers can still reach vesting and any surplus remains stranded without a recovery method. An explicit accept-or-redesign decision is required before deployment.
3. **Independent audit and deployment authorization absent.** Do not merge or deploy.

## P1 issues
- Record CREATE2 salt, init code hashes, expected addresses, bytecode, chain ID and deployment ordering.
- Confirm Safe transaction execution success events, not only successful transaction receipts.
- Test malicious controllers, wrong beneficiary, duplicate/non-owner signatures, replay, expired start, accidental transfers and atomic rollback.
- Document custody and recovery implications of immutable beneficiary keys.
- Verify whether governance permits subsequent Safe owner/threshold/module changes.

CI passing is not an independent security audit. Keep PR #93 as draft and PR #92 unmerged.

## Read-only Safe preflight implemented (2026-11-05)
The script `contracts/scripts/check-safe-3of5.cjs` rejects the wrong chain, missing code, wrong Safe 1.4.x version, non-3-of-5 threshold, owner mismatch/duplicates and enabled modules. It uses a read-only RPC provider and never signs or sends transactions.

Run only with independently verified addresses and an independently trusted Base RPC:
```sh
BASE_RPC_URL="https://your-base-rpc" SAFE_ADDRESS="0x..." SAFE_OWNERS="0x...,0x...,0x...,0x...,0x..." SAFE_SINGLETON="0x..." SAFE_FALLBACK_HANDLER="0x..." node contracts/scripts/check-safe-3of5.cjs
```

**Important limitations:** This is not yet wired as a mandatory deployment gate. It checks configured singleton address, zero guard and configured fallback handler using on-chain storage, but does not validate independently trusted implementation codehashes, proxy bytecode hash, owner identity provenance or mandatory deployment gating. These remain deployment blockers. No production Safe address or owner addresses have been provided or verified.

## Fixed 150,000 NVRA vesting entitlement (2026-11-05)
The research vesting now uses a constant `TEAM_ALLOCATION = 150_000 ether` rather than `balanceOf(vesting) + released` for vesting mathematics. An unexpected direct transfer can no longer enlarge the beneficiary's vesting entitlement. Negative regression tests cover a late transfer after full release.

**Explicit trade-off / unresolved P0:** unsolicited NVRA transfers can still reach any ERC20 recipient address, including this vesting contract. Because the vesting is immutable and intentionally has no rescue, those surplus tokens become permanently inaccessible through the vesting contract. Do not represent this as solved asset recovery. A recovery mechanism, if desired, needs separate security and governance review and must not weaken the immutable beneficiary or team allocation guarantee. The contract remains a research draft; no Mainnet deployment is authorized.

## Surplus handling policy — provisional, not production authorization (2026-11-05)
**Current research design: strict fixed entitlement, no recovery function.**
- The vesting beneficiary may receive at most 150,000 NVRA from this vesting contract across its lifetime, subject to the cliff and linear schedule.
- Any tokens sent directly to vesting outside the atomic 150,000 NVRA prefund do **not** increase the beneficiary's claim.
- Excess balances are **not** treasury assets under a callable recovery mechanism. They can remain permanently locked. Neither a beneficiary nor a Safe administrator can rescue them using this contract.
- No mint, burn, arbitrary transfer, owner or upgrade function is introduced to solve this problem.
- Operational mitigation: prominent irreversible-transfer warnings, blocklisted vesting address in first-party transfer interfaces, and post-deployment monitoring of `balanceOf(vesting) + released - TEAM_ALLOCATION`. Interface blocking cannot prevent direct on-chain transfers.
- **Go/no-go decision pending:** either explicitly accept irrecoverable surplus with documented risk and legal review, or design and independently audit a replacement architecture before any deployment. Do not add privileged sweeping to the existing immutable vesting without a new threat model.

## CI evidence and next security gates
As of commit `838b800`, the three GitHub workflows succeeded after updating the fixed-entitlement regression tests. This is automated testing, not an independent audit. Remaining gates: independently verify actual Safe owners, proxy bytecode and singleton codehash; add positive/negative storage-layout verification tests for the read-only Safe preflight; pin a deployment manifest; audit and approve the surplus policy; obtain explicit deployment authorization. No deployment has taken place.

## Mainnet launch path — scope freeze (2026-11-06)
Operator requested to stop repetitive manual BaseScan code inspection and prioritize creation of NVRA on Base Mainnet. Safe 2-of-3 at `0xdbB84E6279F56EcF39E35F56a5A259DFD026E7fd` has UI evidence for owners, threshold, no modules and no guard. The updated `check-safe-2of3.cjs` test suite is green as of commit `921d2e7`; **production RPC attestation remains incomplete**.

**Minimum sequence (no further manual BaseScan walkthroughs):** (1) freeze final allocations, vesting beneficiary/schedule and surplus policy; (2) automate independent read-only Safe/bytecode/chain checks and run full contract CI; (3) obtain external security/legal sign-off or explicitly record launch blockers; (4) prepare a deterministic deployment transaction with verified addresses and a bounded fee; (5) request explicit authorization for the exact irreversible Base Mainnet transaction. Do not deploy, fund, merge draft contracts or imply production readiness before gates are satisfied.

The prior 3-of-5 examples in this historical review are superseded by the approved 2-of-3 policy and `check-safe-2of3.cjs`. Avoid presenting the older command as the current deployment procedure.
