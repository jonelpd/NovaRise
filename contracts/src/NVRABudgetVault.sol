// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @notice Prototype for capped ecosystem/treasury/community disbursements.
 * @dev Must be pre-funded with its own allocation. No minting, no upgrade, no owner bypass.
 *      Periods are fixed UTC seconds (30/90 days), NOT calendar months/quarters.
 *      Independent audit and testnet rehearsal required before any production use.
 */
contract NVRABudgetVault {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public immutable controller;
    uint64 public immutable startTime;
    uint64 public immutable periodSeconds;
    uint32 public immutable numberOfPeriods;
    uint256 public immutable periodLimit;
    uint256 public immutable totalAllocation;
    uint256 public totalReleased;
    mapping(uint256 => uint256) public releasedInPeriod;

    event Disbursed(address indexed recipient, uint256 indexed period, uint256 amount);

    constructor(
        address token_,
        address controller_,
        uint64 startTime_,
        uint64 periodSeconds_,
        uint32 numberOfPeriods_,
        uint256 periodLimit_
    ) {
        require(token_ != address(0) && token_.code.length != 0, "NVRA: invalid token");
        require(controller_ != address(0) && controller_.code.length != 0, "NVRA: controller must be contract");
        require(startTime_ > 0 && periodSeconds_ > 0 && numberOfPeriods_ > 0 && periodLimit_ > 0, "NVRA: invalid schedule");
        token = IERC20(token_);
        controller = controller_;
        startTime = startTime_;
        periodSeconds = periodSeconds_;
        numberOfPeriods = numberOfPeriods_;
        periodLimit = periodLimit_;
        totalAllocation = uint256(numberOfPeriods_) * periodLimit_;
    }

    function currentPeriod() public view returns (uint256) {
        require(block.timestamp >= startTime, "NVRA: not started");
        uint256 period = (block.timestamp - startTime) / periodSeconds;
        require(period < numberOfPeriods, "NVRA: schedule ended");
        return period;
    }

    function disburse(address recipient, uint256 amount) external {
        require(msg.sender == controller, "NVRA: only controller");
        require(recipient != address(0) && amount > 0, "NVRA: invalid disbursement");
        uint256 period = currentPeriod();
        require(releasedInPeriod[period] + amount <= periodLimit, "NVRA: period cap");
        require(totalReleased + amount <= totalAllocation, "NVRA: total cap");
        releasedInPeriod[period] += amount;
        totalReleased += amount;
        token.safeTransfer(recipient, amount);
        emit Disbursed(recipient, period, amount);
    }
}
