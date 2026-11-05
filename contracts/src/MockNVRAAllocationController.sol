// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/** @dev TEST ONLY. No access controls. NEVER deploy or fund on mainnet. */
contract MockNVRAAllocationController {
    function execute(address target, bytes calldata data) external returns (bytes memory) {
        (bool ok, bytes memory result) = target.call(data);
        if (!ok) {
            assembly { revert(add(result, 32), mload(result)) }
        }
        return result;
    }
}
