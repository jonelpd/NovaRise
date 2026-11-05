# NVRA immutable bucket vaults — deployment binding research

**UNDEPLOYED. Experimental local tests only. Not audited or production-ready.**

`src/NVRAFixedBucketVaultDraft.sol` stores four immutable parameters: expected NVRA token address, controller contract address, allocation bucket ID and cap. Each vault may transfer only its bound token through `release`, only when called by its controller, and never more than its lifetime cap. It has no public setter, arbitrary-token rescue or generic execution method.

`test/fixed-bucket-vault.test.cjs` demonstrates a **local CREATE nonce prediction**: deploy the controller, compute the future token address based on the deployer's next nonce plus five vault creations, deploy the five vaults, and then deploy `NVRAAtomicAllocationCandidate` to mint fixed budgets into them. The tests also verify access controls and illustrate that a wrong token prediction leaves a vault unable to release the intended token.

**Security limitations:**

- Nonce prediction is brittle: an extra transaction, different signer, factory, deployment order or chain state can change the token address. A production plan needs independent address verification and a reviewed deterministic deployment strategy, not a manually trusted nonce.
- The local `MockNVRAAllocationController` has **no access control**. Anyone can invoke it. NEVER use it in production. A production controller must have verified Safe 3-of-5 authorization and recipient/release policies.
- An immutable token address restricts which token the vault's `release` method transfers; it does not stop arbitrary ERC-20 contracts from transferring tokens *into* the vault, nor ensure that the bound address hosts authentic NVRA bytecode. Unexpected deposits can be permanently trapped.
- After a legitimate release, the vault cannot control the recipient's onward transfers. It cannot prevent economic rerouting or prove purpose-specific spending.
- There is no timelock, release schedule, beneficiary allowlist, emergency recovery, pause or formal audit. The team bucket does **not** automatically implement vesting: that requires a reviewed, approved beneficiary/vesting design.
- The separate `NVRAAtomicAllocationCandidate` only checks that each recipient is a distinct contract, not that it is one of these verified vaults.

**Next gates:** audited deployment factory/address plan; verified contract bytecode and controllers; time-based release policies and beneficiary checks; negative/adversarial tests; legal and security reviews; explicit go/no-go authorization. No mainnet action is authorized.
