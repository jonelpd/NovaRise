# NVRA atomic factory — adversarial test findings (local)

**No mainnet deployment, no real tokens, no independent audit.**

The test suite `test/atomic-factory-adversarial.test.cjs` adds checks for unauthorized initialization, zeroed state before initialization, immutable one-time token binding, unauthorized direct withdrawals, invalid recipients, zero amounts, excessive payouts, repeated payouts and conservation of the fixed 1m supply across five independent allocation vaults.

**Critical finding demonstrated deliberately:** the local `MockNVRAAllocationController` accepts calls from arbitrary addresses. An outsider can therefore use the mock to authorize transfers from the vault. The vault's `msg.sender == controller` check does **not** protect funds when the controller itself has no authentication. **Never use the mock controller for any real funds or mainnet launch.**

The tests also do not validate a real Safe, signer independence, modules/guards, ERC-20 token behavior outside the local candidate, factory front-running in a public mempool, unexpected deposits, recovery, timelocks or team vesting policy. A controller's code existence does not prove it is a Safe.

**Next gate:** build a production-grade authorization specification, test a verified Safe integration locally, then independently audit the complete factory + vault + controller + vesting design. Do not deploy or fund before explicit authorization.
