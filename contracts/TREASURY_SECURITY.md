# NVRA treasury and vesting — security design v0.1

**Design proposal only. No wallets, contracts or allocations have been deployed. No real funds should be sent.**

## Recommended custody model

1. Use a widely reviewed multisignature treasury (e.g. Safe) on the *same chain* as NVRA. For a small independent team, a **2-of-3** signing threshold is a preliminary option, not a final security guarantee.
2. Each signer must be a separate trusted person or institution with an independently protected hardware wallet. Do not place all keys on one device or with one person. Define key rotation, recovery and incident procedures before launch.
3. Separate treasury administration from service operations and analytics infrastructure. Never store seed phrases, private keys, RPC credentials or signer material in the website, repository, GitHub Actions, or analytics services.
4. Treasury movements require a written allocation policy, spending limits, public transaction records and at least two independent approvals under the proposed 2-of-3 model. Reassess threshold as the project grows.
5. Do not publish a treasury address as official until its signers, network, ownership and test transfers have been independently verified.

## Proposed allocation controls

The current **illustrative** distribution in whitepaper v0.3 is: 45% ecosystem utility/incentives, 20% treasury/operations, 15% team/development, 10% security/audits and 10% partnerships. These are not commitments or circulating balances.

- At deployment, NVRAToken mints all 100,000,000 NVRA to the provided treasury address; this is **not** an unlock schedule. The treasury controls the full balance until it transfers tokens to independently specified allocation contracts or recipients.
- Consider OpenZeppelin `VestingWallet` for time-based team/partner unlocks. The sample test funds a 15% allocation to a 365-day vesting wallet after a short future start delay **only to demonstrate the mechanism**; it does not represent the actual schedule.
- A real vesting policy must define a meaningful cliff, start date, duration, beneficiary restrictions and treatment of departures. **OpenZeppelin VestingWallet is not a cliff by default**, and its beneficiary/ownership may be transferable: assess whether that meets the intended policy.
- Use separate contracts and explicit vesting schedules for each beneficiary, subject to security review. Do not assume that a lock guarantees no economic transfer if beneficiary ownership can be sold.
- Avoid automated burning, discretionary minting, transfer taxes, arbitrary freezing and hidden administrator privileges in the token itself.
- A service-credit system should be implemented separately, after validating off-chain accounting, pricing, fraud controls and consumer protections.

## Release gates

- Confirm whether token issuance is necessary and legally permissible; identify the responsible legal entity and relevant MiCA obligations.
- Fix tokenomics and publicly document initial circulating supply and all allocations.
- Verify multisig signers, hardware custody, disaster recovery, transaction monitoring and approval procedures.
- Review vesting semantics, including cliff, start time, ownership transfer, revocation policy and beneficiary eligibility.
- Add negative tests and static analysis, then commission an independent contract/security review.
- Test the complete flow locally; only then consider Amoy testnet. **No production deployment or mainnet token issuance is authorized by this document.**

## Local test

Run `npm install && npm test` inside `contracts/`. Tests require access to npm dependencies and a Solidity compiler. The test suite is intended to validate mechanics, not certify security.
