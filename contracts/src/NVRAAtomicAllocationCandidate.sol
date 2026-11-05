// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice UNDEPLOYED research draft: atomically mint the fixed NVRA supply
 *         to five previously deployed, independently reviewed vault contracts.
 * @dev Does not verify vault implementation, release policy, controller, Safe
 *      threshold, or whether a vault permits immediate withdrawals.
 */
contract NVRAAtomicAllocationCandidate is ERC20 {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18;

    constructor(address[5] memory vaults) ERC20("NovaRise Utility Token", "NVRA") {
        uint256[5] memory allocations = [
            uint256(300_000 * 10 ** 18),
            uint256(250_000 * 10 ** 18),
            uint256(200_000 * 10 ** 18),
            uint256(150_000 * 10 ** 18),
            uint256(100_000 * 10 ** 18)
        ];
        for (uint256 i = 0; i < 5; ++i) {
            require(vaults[i] != address(0) && vaults[i].code.length != 0, "NVRA: invalid vault");
            for (uint256 j = 0; j < i; ++j) {
                require(vaults[i] != vaults[j], "NVRA: duplicate vault");
            }
            _mint(vaults[i], allocations[i]);
        }
        assert(totalSupply() == MAX_SUPPLY);
    }
}
