# NVRA — minimum viable Base Mainnet launch gate

Status: DRAFT / NO-GO until all P0 gates are evidenced. This document freezes scope; it does not authorize deployment, token sales or public marketing.

## Frozen technical scope
- Chain: Base Mainnet (chain ID 8453).
- Token: NVRA, fixed supply 1,000,000 tokens, 18 decimals. No extra minting.
- Distribution: five buckets, 300,000 / 250,000 / 200,000 / 150,000 / 100,000.
- Team: 150,000 NVRA prefunded atomically to immutable-beneficiary vesting; cliff and linear durations require explicit sign-off.
- Controller: genuine Safe with five independently verified owners and threshold three.
- No optional analytics, game, social or website improvements are launch blockers.

## Mandatory P0 gates (complete in order)
1. **Governance identities:** record Safe address, five verified owner addresses, intended beneficiary, actual chain, independently checked singleton/fallback handler and proxy/runtime code hashes. Obtain explicit approval from responsible parties. Do not put private keys or seed phrases in GitHub.
2. **Contract freeze and threat model:** confirm factory/controller identity, vesting fixed cap and irrecoverable-surplus policy; verify bytecode, creation salts, deployment ordering, atomic rollback and correct allocations. Freeze commit and compiler settings; no new features.
3. **Security assurance:** independent qualified review of immutable token/factory/vault/vesting deployment path, with critical/high findings resolved or independently justified before deployment. Automated tests alone do not qualify.
4. **Legal/compliance go/no-go:** qualified assessment of MiCA/other applicable rules, public communications, distribution, consumer disclosures, and any marketing/listing restrictions. No assumption that deployment alone authorizes offering/trading.
5. **Dry-run and manifest:** reproducible simulation using the frozen commit and actual intended configuration, verified CREATE2 predictions, gas funding, deployment wallet and chain ID; independently check deployment addresses and balances.
6. **Explicit authorization:** written approval of exact commit, contract hashes, owner/beneficiary identities, schedule, cost estimate and deployment steps. Only then perform a controlled Mainnet deployment and on-chain postflight.

## Stop conditions
- Any mismatch of chain, owner identities, Safe implementation, modules, guard, fallback handler or contract hashes.
- Failed tests, unresolved critical/high findings, incorrect distribution, unauthorized schedule, or absent legal authorization.
- Unexpected transactions or need to expose a private key.

## Explicitly deferred
Website/UX refinements, advanced analytics, token comparison, game integrations, social automations, optional features and unrelated PRs. These must not be used to delay a technically and legally approved token launch.

## Current evidence (2026-11-05)
- PR #93 remains a draft; latest reviewed commit `608f000` passed three CI workflows.
- Tests use simulated/local Safe conditions; no real production Safe identity, owner set or beneficiary authorization has been supplied.
- Immutable vesting caps releases at 150,000 NVRA; unsolicited surplus may be permanently stranded.
- No independent audit, final legal clearance, signed deployment manifest or explicit deployment approval is recorded here.
- **Decision: NO-GO at present.** Progress only on the six P0 gates above; no arbitrary new feature phases.
