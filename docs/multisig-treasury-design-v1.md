# NovaRise — multisignature treasury design v1 (proposal)

**Status: design only; no Safe deployed, no signers appointed, no mainnet token deployed.** Date: 2026-10-29.

## Custody architecture

- Proposed chain: Polygon PoS mainnet, subject to final legal/technical approval.
- Use a verified Safe smart account (Gnosis Safe), not a custom unaudited multisig.
- **Candidate threshold: 3 of 5 independent signers**, subject to formal approval. No signer list or private keys should be published in the repository.
- Deploy and independently verify the Safe **before** deploying the fixed-supply token, because `NVRAMainnetCandidate` requires a contract treasury and mints the full supply to it.
- Record and cross-check Safe address, chain ID, Safe implementation, owners, threshold, transaction service configuration and verified deployment metadata from two independent reviewers.
- Use separate hardware wallets for signers. No seed phrases, private keys, or transaction signing in GitHub Actions, browser screenshots, logs or code.
- A 3-of-5 Safe prevents a single signer from spending, but **does not prevent 3 colluding or compromised signers** from transferring all tokens. Independent oversight, timelocks/allowances, transparent reports and key recovery procedures are additional controls.

## Proposed allocation and custody boundaries

| Bucket | Draft amount | Required controls |
|---|---:|---|
| Ecosystem/rewards | 300,000 NVRA | Approved budget, capped distribution, documented recipients and vesting if applicable |
| Development treasury | 250,000 NVRA | Multisig approvals, budgets, accounting, disclosure |
| Community/adoption | 200,000 NVRA | Eligibility rules, abuse controls, release schedule |
| Team | 150,000 NVRA | Dedicated reviewed vesting wallet; approved beneficiary, dates and ownership policy |
| Future liquidity | 100,000 NVRA | Segregated custody; no use until separate legal/launch decision |

All allocations remain proposals; the treasury initially holds the entire supply until authorized movements. None of these budgets is automatically enforced by the ERC-20 contract.

## Required operational decisions

1. Approve independent signers and alternates, jurisdictional/operational availability, and conflicts of interest.
2. Approve threshold, signer rotation, lost-device response and emergency pause/response process.
3. Decide whether beneficiaries may transfer team vesting rights. The current `VestingWallet` owner **can transfer ownership**.
4. Approve exact UTC start, cliff and end timestamps. The proposed 12+36 months currently use seconds-based schedules, not calendar-month logic.
5. Fund vesting deliberately; late funding may be immediately claimable to the extent already vested.
6. Establish a 2-person independent review of every address, token amount, Safe transaction payload and recipient before signatures.
7. Verify Safe transactions using a trusted interface and simulation; test approvals and recovery on a test network.
8. Obtain an independent smart contract audit and Spain/EU legal review, including MiCA where applicable.
9. Document a formal go/no-go vote before mainnet.

## Test plan (not yet completed)

- Simulate a Safe 3-of-5 with a trusted test deployment, verifying that 1 or 2 approvals cannot execute and 3 can.
- Verify signer addition/removal and threshold change governance, replay protections, nonce handling, and destination-address validation.
- Verify 1,000,000 NVRA mint into the actual Safe and controlled movement into separately reviewed vesting wallet.
- Run fuzz/invariant tests for supply, vesting and custody, plus adversarial cases.
- Review the production contract bytecode and dependencies against the audited source.

**Never use `MockNVRATreasury.sol` in production:** its transfer function has no access control.

No deployment or transfer is authorized by this document.
