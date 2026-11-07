// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MockNVRATreasury} from "./MockNVRATreasury.sol";

interface INVRASurplusRecovery {
    function recoverSurplus(uint256 amount) external;
}

/** @dev TEST ONLY. Mimics a contract controller invoking bounded recovery. */
contract MockNVRASurplusController is MockNVRATreasury {
    function recover(address vesting, uint256 amount) external {
        INVRASurplusRecovery(vesting).recoverSurplus(amount);
    }
}
