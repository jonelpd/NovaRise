// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/** @notice UNDEPLOYED research vault. Token is bound once by its immutable factory. */
contract NVRAFactoryBoundVaultDraft {
    using SafeERC20 for IERC20;

    address public immutable factory;
    address public immutable controller;
    uint8 public immutable bucket;
    uint256 public immutable cap;
    address public token;
    uint256 public released;

    constructor(address controller_, uint8 bucket_) {
        require(controller_ != address(0) && controller_.code.length != 0, "NVRA: invalid controller");
        require(bucket_ < 5, "NVRA: invalid bucket");
        factory = msg.sender;
        controller = controller_;
        bucket = bucket_;
        if (bucket_ == 0) cap = 300_000 ether;
        else if (bucket_ == 1) cap = 250_000 ether;
        else if (bucket_ == 2) cap = 200_000 ether;
        else if (bucket_ == 3) cap = 150_000 ether;
        else cap = 100_000 ether;
    }

    function bindToken(address token_) external {
        require(msg.sender == factory, "NVRA: factory only");
        require(token == address(0), "NVRA: already bound");
        require(token_ != address(0) && token_.code.length != 0, "NVRA: invalid token");
        token = token_;
    }

    function release(address recipient, uint256 amount) external {
        require(msg.sender == controller, "NVRA: controller only");
        require(token != address(0), "NVRA: unbound");
        require(recipient != address(0) && recipient != address(this), "NVRA: invalid recipient");
        require(amount != 0 && amount <= cap - released, "NVRA: budget exceeded");
        released += amount;
        IERC20(token).safeTransfer(recipient, amount);
    }
}
