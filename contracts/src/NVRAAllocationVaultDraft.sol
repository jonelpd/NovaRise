// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @notice UNDEPLOYED local-only draft. Holds tokens in a dedicated allocation vault.
 * @dev A Safe-like contract controller authorizes releases. A contract address alone
 *      does not prove a Safe or enforce a multisignature threshold.
 *      Direct transfers outside this vault cannot be capped by this contract.
 */
contract NVRAAllocationVaultDraft {
    using SafeERC20 for IERC20;

    uint256 public constant UNIT = 10 ** 18;
    uint256 public constant TOTAL_BUDGET = 1_000_000 * UNIT;
    uint8 public constant BUCKETS = 5;

    IERC20 public immutable token;
    address public immutable controller;
    uint256 public totalReleased;
    uint256[5] private _released;

    event AllocationReleased(uint8 indexed bucket, address indexed recipient, uint256 amount);

    constructor(address token_, address controller_) {
        require(token_ != address(0) && token_.code.length != 0, "NVRA: invalid token");
        require(controller_ != address(0) && controller_.code.length != 0, "NVRA: invalid controller");
        token = IERC20(token_);
        controller = controller_;
    }

    function budget(uint8 bucket) public pure returns (uint256) {
        if (bucket == 0) return 300_000 * UNIT; // ecosystem
        if (bucket == 1) return 250_000 * UNIT; // treasury/development
        if (bucket == 2) return 200_000 * UNIT; // community
        if (bucket == 3) return 150_000 * UNIT; // team
        if (bucket == 4) return 100_000 * UNIT; // future liquidity
        revert("NVRA: invalid bucket");
    }

    function released(uint8 bucket) external view returns (uint256) {
        budget(bucket);
        return _released[bucket];
    }

    function remaining(uint8 bucket) external view returns (uint256) {
        return budget(bucket) - _released[bucket];
    }

    function release(uint8 bucket, address recipient, uint256 amount) external {
        require(msg.sender == controller, "NVRA: controller only");
        require(recipient != address(0) && recipient != address(this), "NVRA: invalid recipient");
        require(amount > 0, "NVRA: zero amount");
        uint256 cap = budget(bucket);
        require(amount <= cap - _released[bucket], "NVRA: allocation exceeded");
        require(amount <= TOTAL_BUDGET - totalReleased, "NVRA: total exceeded");
        _released[bucket] += amount;
        totalReleased += amount;
        token.safeTransfer(recipient, amount);
        emit AllocationReleased(bucket, recipient, amount);
    }
}
