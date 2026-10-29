# NovaRise treasury and vesting architecture

Draft only. Future mainnet NVRA supply: 1,000,000 tokens. The existing 100,000,000-token Amoy test contract remains separate.

Use a reviewed multisignature treasury with independent signers. Candidate configuration: three approvals from five signers, subject to governance review. Do not place keys in source control.

Proposed allocations: ecosystem 300,000; development treasury 250,000; community 200,000; team 150,000; future liquidity 100,000 NVRA.

Team allocation: proposed 12-month cliff followed by 36-month linear release. Other allocation releases and beneficiaries remain unapproved. Define timestamps, revocation, ownership transfers, funding rules and emergency procedures before implementation.

Next: write local-only Solidity drafts and automated tests, obtain independent security and legal reviews, rehearse on testnet, and seek separate approval before any mainnet deployment.

This document does not deploy contracts or authorize token transfers.
