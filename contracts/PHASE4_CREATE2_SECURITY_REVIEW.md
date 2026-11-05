# Phase 4 — CREATE2 and immutable vesting security review

Status: EXPERIMENTAL. No merge or Base Mainnet deployment authorized. This is not an independent audit.

## Architecture reviewed
- CREATE2 deploys five recipient vaults, including a factory-only team escrow.
- Token is deployed before immutable vesting to satisfy the token code check.
- Team escrow forwards 150,000 NVRA to vesting atomically, before vesting start.
- Remaining four vaults allow controller-authorized releases.

## P0 blockers
1. **Safe identity not authenticated.** Factory accepts any deployed contract as controller. A code-length check is not evidence of a Safe 3-of-5. Existing official-Safe tests prove compatibility only. Before deployment require a reviewed chain-specific manifest: Safe proxy, singleton, five owners, threshold three, modules, guard, fallback handler, and deployment chain ID. Verify on-chain state before any production operation.
2. **Late direct ERC-20 transfers.** The factory's escrow can only fund once, but third parties can send tokens directly to vesting. After the schedule, those tokens may become immediately releasable. Ordinary ERC-20 recipients cannot universally reject transfers. Decide whether this is acceptable; consider fixed-allocation vesting accounting with explicit surplus handling and tests.
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
BASE_RPC_URL="https://your-base-rpc" SAFE_ADDRESS="0x..." SAFE_OWNERS="0x...,0x...,0x...,0x...,0x..." node contracts/scripts/check-safe-3of5.cjs
```

**Important limitations:** This is not yet wired as a mandatory deployment gate. It does not validate the Safe singleton implementation, guard, fallback handler, proxy bytecode hash or on-chain owner identity provenance. These remain deployment blockers. No production Safe address or owner addresses have been provided or verified.
