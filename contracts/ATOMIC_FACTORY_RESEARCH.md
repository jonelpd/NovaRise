# Atomic CREATE2 factory and one-time NVRA binding — experimental draft

**Research only. Not audited, not approved, not deployed on Base Mainnet.**

`NVRAAtomicFactoryDraft` is configured at construction with a controller contract and the initializer address (factory deployer). The initializer can call `initialize()` **once**. In that single atomic transaction the factory:

1. Deploys five `NVRAFactoryBoundVaultDraft` contracts with deterministic CREATE2 salts and checks their computed addresses.
2. Deploys `NVRAAtomicAllocationCandidate`, minting 300k/250k/200k/150k/100k NVRA into those five vaults.
3. Binds each vault exactly once to the newly created token address. If any step fails, **the entire transaction reverts**.

This removes dependence on externally guessing the token deployment nonce, and avoids a public arbitrary-address `bindToken` function. It does **not** make the system production-ready.

**Outstanding critical risks:**

- The controller mock in local tests allows any caller to authorize transfers. Replace with independently verified Safe 3-of-5 or audited authorization policy; the factory's `code.length` check does not authenticate a Safe.
- The factory initializer is an EOA in the test; production governance, key custody, deployment authority, transaction simulation and approvals remain undecided.
- Anyone can send unrelated ERC-20 tokens to a vault; unexpected deposits may be trapped. There is no rescue, timelock, pause, per-recipient policy or beneficiary verification.
- After release, recipient spending is outside the vault's control. Team releases must be routed to reviewed vesting and must not be sent straight to individuals.
- The factory can be deployed more than once, creating independent token candidates. **Only one production token address** can be approved and published after chain/bytecode verification.
- No formal verification, independent audit, Safe configuration or legal/MiCA assessment has been performed.

**Next:** adversarial tests (malicious token/controller, vesting, failed initialization, signer changes, unexpected deposits), final security design and independent review. No real funds, transactions or deployment are authorized.
