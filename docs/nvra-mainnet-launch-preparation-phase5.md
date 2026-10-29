# NovaRise — Phase 5: mainnet deployment preparation (NO DEPLOYMENT)

Date: 2026-10-29. Status: **preparation only / NO-GO**.

## Decision
Stop expanding the experimental Hardhat 3 smoke suite for now. Maintain the already passing Hardhat 2 regression workflow and retain Hardhat 3 as an isolated experiment. Do not deploy or market the future NVRA token yet.

## Candidate parameters and provisional allocation decision
- Network: Polygon PoS mainnet (chain ID 137).
- ERC-20: NovaRise Utility Token (NVRA), 18 decimals.
- Fixed one-time mint: 1,000,000 NVRA, minted directly to a **deployed, verified production Safe**, not to a personal account or MockNVRATreasury.
- The existing 100,000,000-NVRA Polygon Amoy test token is a separate prototype, not a representation of the mainnet supply.
- Proposed Safe: 3 approvals from 5 independently controlled signers; **real owners, recovery, key security, gas management and operating procedures are not approved**.
- Allocation accepted provisionally for planning on 2026-10-29 (not final launch approval): ecosystem 300,000; treasury/development 250,000; community 200,000; team 150,000; future liquidity 100,000. Total 1,000,000.
- Team vesting (NOT approved): 12-month cliff then 36-month linear vesting; specify UTC start/end, beneficiary, ownership transfer policy and late-funding effects before deployment.

## Mandatory sequence and acceptance evidence
1. **Product/legal gate:** document real NVRA utility and why a transferable token is needed. Identify responsible entity and obtain qualified Spain/EU legal review, including MiCA classification, whitepaper/public offering and marketing obligations as applicable. No token sale or investment claims.
2. **Governance gate:** name five consenting Safe signers outside public repo, verify hardware wallet/key custody, backups, conflict of interest, loss and rotation procedures. Record an independently checked 3-of-5 Safe deployment plan. No private keys or seed phrases in GitHub or ChatGPT.
3. **Economics gate:** approve allocation, recipient categories, initially circulating supply, transfer restrictions if any, release policy, team beneficiary and exact UTC vesting timestamps. Define treasury disbursement controls; vesting alone does not restrict purpose.
4. **Security gate:** remediate or formally assess remaining Hardhat/Hardhat 3 dependency advisories, obtain independent Solidity and custody/security audit, address findings, preserve tested code hashes, and verify deployed Safe bytecode/source.
5. **Rehearsal gate:** deploy the **complete final architecture** on Amoy using test-only signers; confirm supply, Safe owners and threshold, funding/vesting, on-chain verification, multisig recovery drills, and repeatable deployment records. Never use MockNVRATreasury for real funds.
6. **Deployment gate:** prepare and independently review chain ID 137, exact constructor arguments, verified Safe address, gas funding, block explorer verification and transaction simulation. Publish a signed go/no-go record with designated approvers. Only then authorize a separate explicit mainnet deployment.

## Required deliverables before go/no-go
- Final token utility and tokenomics; legal sign-off; signer custody and governance policy; exact vesting schedule; independent audit and remediation evidence; full Amoy rehearsal manifest; source and bytecode verification; mainnet deployment runbook with rollback/incident response limitations.

## Current blockers
- Legal entity and legal classification unresolved.
- Safe real signers and production custody unresolved.
- Allocation percentages accepted provisionally; initial circulation, recipient identities, release controls and vesting timestamps remain unapproved.
- Independent audit and complete final-architecture rehearsal pending.
- Hardhat 3 has only partial parity with the 22 stable Hardhat 2 tests; its 4 reported high dependency alerts also require triage. This does not block *preparation* but does block treating the experimental suite as a release qualification.

**No mainnet contracts, transactions, wallets or funds are created or moved by this document.**
