// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @notice UNDEPLOYED local research vesting for exactly one immutable beneficiary.
 * @dev No Ownable, transferOwnership, delegate, admin, upgrade, rescue or
 *      arbitrary destination. Funding timing and beneficiary key security remain risks.
 */
contract NVRAImmutableBeneficiaryVestingDraft {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public immutable beneficiary;
    uint64 public immutable start;
    uint64 public immutable cliffDuration;
    uint64 public immutable linearDuration;
    uint256 public released;

    constructor(
        address token_,
        address beneficiary_,
        uint64 start_,
        uint64 cliff_,
        uint64 linear_
    ) {
        require(token_ != address(0) && token_.code.length != 0, "NVRA: invalid token");
        require(beneficiary_ != address(0), "NVRA: zero beneficiary");
        require(start_ != 0 && cliff_ != 0 && linear_ != 0, "NVRA: invalid schedule");
        require(uint256(start_) + uint256(cliff_) + uint256(linear_) <= type(uint64).max, "NVRA: schedule overflow");
        token = IERC20(token_);
        beneficiary = beneficiary_;
        start = start_;
        cliffDuration = cliff_;
        linearDuration = linear_;
    }

    function vestedAmount(uint64 timestamp) public view returns (uint256) {
        uint256 totalAllocation = token.balanceOf(address(this)) + released;
        uint256 cliffEnd = uint256(start) + uint256(cliffDuration);
        if (timestamp <= cliffEnd) return 0;
        uint256 end = cliffEnd + uint256(linearDuration);
        if (timestamp >= end) return totalAllocation;
        return totalAllocation * (uint256(timestamp) - cliffEnd) / uint256(linearDuration);
    }

    function releasable() public view returns (uint256) {
        return vestedAmount(uint64(block.timestamp)) - released;
    }

    function release() external {
        uint256 amount = releasable();
        require(amount != 0, "NVRA: nothing releasable");
        released += amount;
        token.safeTransfer(beneficiary, amount);
    }
}
