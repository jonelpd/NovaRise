// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {NVRAVestingIdentityGuardDraft} from "./NVRAVestingIdentityGuardDraft.sol";

/**
 * @notice UNDEPLOYED research vault with identity re-check on each team payout.
 * @dev This is not yet part of the CREATE2 atomic factory. Do not fund on mainnet.
 */
contract NVRATeamGuardedVaultDraft {
    using SafeERC20 for IERC20;

    uint256 public constant CAP = 150_000 ether;
    address public immutable factory;
    address public immutable controller;
    NVRAVestingIdentityGuardDraft public immutable guard;
    address public token;
    uint256 public released;

    constructor(address controller_, address guard_) {
        require(controller_ != address(0) && controller_.code.length != 0, "NVRA: invalid controller");
        require(guard_ != address(0) && guard_.code.length != 0, "NVRA: invalid guard");
        factory = msg.sender;
        controller = controller_;
        guard = NVRAVestingIdentityGuardDraft(guard_);
        guard.verify();
    }

    function bindToken(address token_) external {
        require(msg.sender == factory, "NVRA: factory only");
        require(token == address(0), "NVRA: already bound");
        require(token_ != address(0) && token_.code.length != 0, "NVRA: invalid token");
        token = token_;
    }

    function releaseToVesting(uint256 amount) external {
        require(msg.sender == controller, "NVRA: controller only");
        require(token != address(0), "NVRA: unbound");
        require(amount != 0 && amount <= CAP - released, "NVRA: budget exceeded");
        guard.verify();
        released += amount;
        IERC20(token).safeTransfer(guard.vesting(), amount);
    }
}
