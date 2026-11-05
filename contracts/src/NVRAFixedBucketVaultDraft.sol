// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @notice UNDEPLOYED research draft: single-purpose allocation vault with
 *         immutable token, controller, bucket and cumulative payout ceiling.
 * @dev Expected token may not have code yet at vault deployment. The binding
 *      relies on a correct, independently verified deployment plan.
 *      Controller contract code alone DOES NOT prove Safe multisig security.
 */
contract NVRAFixedBucketVaultDraft {
    using SafeERC20 for IERC20;

    address public immutable token;
    address public immutable controller;
    uint8 public immutable bucket;
    uint256 public immutable cap;
    uint256 public released;

    event Released(address indexed recipient, uint256 amount);

    constructor(address expectedToken, address controller_, uint8 bucket_) {
        require(expectedToken != address(0), "NVRA: zero token");
        require(controller_ != address(0) && controller_.code.length != 0, "NVRA: invalid controller");
        require(bucket_ < 5, "NVRA: invalid bucket");
        token = expectedToken;
        controller = controller_;
        bucket = bucket_;
        if (bucket_ == 0) cap = 300_000 ether;
        else if (bucket_ == 1) cap = 250_000 ether;
        else if (bucket_ == 2) cap = 200_000 ether;
        else if (bucket_ == 3) cap = 150_000 ether;
        else cap = 100_000 ether;
    }

    function remaining() external view returns (uint256) {
        return cap - released;
    }

    function release(address recipient, uint256 amount) external {
        require(msg.sender == controller, "NVRA: controller only");
        require(recipient != address(0) && recipient != address(this), "NVRA: invalid recipient");
        require(amount != 0 && amount <= cap - released, "NVRA: budget exceeded");
        require(token.code.length != 0, "NVRA: token not deployed");
        released += amount;
        IERC20(token).safeTransfer(recipient, amount);
        emit Released(recipient, amount);
    }
}
