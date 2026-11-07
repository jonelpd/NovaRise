// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/** @notice Experimental vesting: fixed team entitlement with bounded surplus recovery. */
contract NVRABoundedSurplusVestingDraft {
    using SafeERC20 for IERC20;
    IERC20 public immutable token;
    address public immutable beneficiary;
    address public immutable controller;
    uint64 public immutable start;
    uint64 public immutable cliffDuration;
    uint64 public immutable linearDuration;
    uint256 public released;
    uint256 public constant TEAM_ALLOCATION = 150_000 ether;

    event TeamReleased(uint256 amount);
    event SurplusRecovered(uint256 amount);

    constructor(address token_, address beneficiary_, address controller_, uint64 start_, uint64 cliff_, uint64 linear_) {
        require(token_.code.length > 0, "NVRA: invalid token");
        require(beneficiary_ != address(0), "NVRA: zero beneficiary");
        require(controller_.code.length > 0, "NVRA: invalid controller");
        require(start_ != 0 && cliff_ != 0 && linear_ != 0, "NVRA: invalid schedule");
        require(uint256(start_) + cliff_ + linear_ <= type(uint64).max, "NVRA: overflow");
        token = IERC20(token_);
        beneficiary = beneficiary_;
        controller = controller_;
        start = start_;
        cliffDuration = cliff_;
        linearDuration = linear_;
    }

    function vestedAmount(uint64 timestamp) public view returns (uint256) {
        uint256 cliffEnd = uint256(start) + cliffDuration;
        if (timestamp <= cliffEnd) return 0;
        if (uint256(timestamp) >= cliffEnd + linearDuration) return TEAM_ALLOCATION;
        return TEAM_ALLOCATION * (uint256(timestamp) - cliffEnd) / linearDuration;
    }

    function releasable() public view returns (uint256) {
        uint256 vested = vestedAmount(uint64(block.timestamp));
        return vested > released ? vested - released : 0;
    }

    function recoverableSurplus() public view returns (uint256) {
        uint256 balance = token.balanceOf(address(this));
        uint256 reserved = TEAM_ALLOCATION - released;
        return balance > reserved ? balance - reserved : 0;
    }

    function release() external {
        uint256 amount = releasable();
        require(amount != 0, "NVRA: nothing releasable");
        require(token.balanceOf(address(this)) >= amount, "NVRA: insufficient funds");
        released += amount;
        token.safeTransfer(beneficiary, amount);
        emit TeamReleased(amount);
    }

    function recoverSurplus(uint256 amount) external {
        require(msg.sender == controller, "NVRA: controller only");
        require(amount != 0 && amount <= recoverableSurplus(), "NVRA: exceeds surplus");
        token.safeTransfer(controller, amount);
        emit SurplusRecovered(amount);
    }
}
