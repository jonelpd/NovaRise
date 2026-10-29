// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VestingWallet} from "@openzeppelin/contracts/finance/VestingWallet.sol";

/** @notice UNDEPLOYED draft: cliff followed by linear vesting. */
contract NVRATeamVesting is VestingWallet {
    uint64 public immutable cliffDuration;

    constructor(address beneficiary, uint64 startTime, uint64 cliff, uint64 linearDuration)
        VestingWallet(beneficiary, startTime, cliff + linearDuration)
    {
        require(beneficiary != address(0), "NVRA: zero beneficiary");
        require(cliff != 0 && linearDuration != 0, "NVRA: invalid durations");
        cliffDuration = cliff;
    }

    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp)
        internal view override returns (uint256)
    {
        uint256 cliffEnd = uint256(start()) + uint256(cliffDuration);
        if (timestamp <= cliffEnd) return 0;
        uint256 end = uint256(start()) + uint256(duration());
        if (timestamp >= end) return totalAllocation;
        return totalAllocation * (uint256(timestamp) - cliffEnd) / (end - cliffEnd);
    }
}
