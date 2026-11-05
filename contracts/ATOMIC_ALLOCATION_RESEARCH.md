# NVRA atomic five-vault mint — local research prototype

**UNDEPLOYED / NOT AUDITED / NOT AUTHORIZED FOR MAINNET.**

`src/NVRAAtomicAllocationCandidate.sol` is a separate research candidate; it does **not** replace `NVRAMainnetCandidate.sol`. At deployment it mints exactly 1,000,000 NVRA to five *distinct pre-existing contract addresses*, in a single transaction: ecosystem 300k, development 250k, community 200k, team 150k and liquidity 100k.

If any vault is missing, is an EOA or duplicates another address, construction reverts and the token is not deployed. This avoids the intermediate single-Safe balance of option B, but **does not ensure that vaults actually enforce budgets, Safe approval or vesting**. Contract-code existence is a very weak check: the local tests deliberately show that insecure `MockNVRATreasury` vaults can be drained by anyone. They must never be used in production.

## Important unresolved dependency

The five vault contracts must exist **before** the token deployment, even though they do not yet know the future token address. Production design must enforce a secure, single-use token binding (or precomputed deterministic deployment with reviewed init ordering), prevent deposits of wrong tokens, prevent unauthorized withdrawals and make any vesting funding schedule explicit. There must be no unsafe initializer, address substitution, unbounded rescue or transfer loophole.

## Review checklist

- [ ] Independent audits of all five real vaults and token constructor.
- [ ] Validate vault-token binding and deployment order under adversarial tests.
- [ ] Independently verify any Safe 3-of-5 controllers, modules, guards and owners on Base Mainnet.
- [ ] Specify recovery, time locks, beneficiaries, community eligibility and anti-abuse controls.
- [ ] Verify fixed 1m supply, cumulative bucket ceilings and circulating supply reconciliation.
- [ ] Complete legal/MiCA assessment and obtain explicit go/no-go approval.

Local tests do not authorize any transaction or prove that the complete architecture is safe.
