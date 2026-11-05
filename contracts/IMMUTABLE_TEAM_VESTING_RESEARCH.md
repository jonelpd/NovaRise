# Immutable team beneficiary vesting — experimental draft

**UNDEPLOYED, unaudited, local only.**

`NVRAImmutableBeneficiaryVestingDraft` binds one ERC-20 token and one beneficiary in immutable constructor storage. It has no Ownable inheritance, no beneficiary setter, no ownership transfer, no admin, no upgrade entry point and no arbitrary recipient parameter. Anyone may trigger `release()`, but the contract always transfers vested tokens to the immutable beneficiary.

The schedule has a cliff with no release through its end, followed by linear vesting. Local tests cover the cliff, partial and final release, recipient immutability, invalid schedules and late funding.

**Critical remaining design issues:**
- This contract is **not integrated** into the mixed CREATE2 factory or Safe integration; current factory still accepts any contract as the team vesting destination.
- Its address cannot be supplied before the token is deployed because its constructor requires the token address. An integrated factory must resolve this circular dependency via deterministic CREATE2 prediction, a secure one-time token binding, or a different deployment architecture, then prove that the vesting instance is the approved code and beneficiary.
- A compromised beneficiary key can still receive vested tokens; immutability is not key security.
- Funding after the vesting schedule has elapsed is immediately releasable. Strict prefunding and funding-time policy are required.
- No funding cap is enforced inside this vesting. Tokens accidentally transferred to it also vest.
- No independent security audit, legal review or production Safe custody validation has occurred.

Never deploy or fund on Base Mainnet without explicit authorization and reviews.
