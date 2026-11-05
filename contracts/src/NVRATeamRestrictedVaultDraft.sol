// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @notice UNDEPLOYED team-only vault research draft.
 * @dev Even a legitimate controller cannot send the team allocation to an
 *      arbitrary wallet: the only destination is an immutable vesting contract.
 *      Vesting code and beneficiary policy must be audited separately.
 */
contract NVRATeamRestrictedVaultDraft {
    using SafeERC20 for IERC20;

    uint256 public constant CAP = 150_000 ether;
    address public immutable factory;
    address public immutable controller;
    address public immutable vesting;
    address public token;
    uint256 public released;

    constructor(address controller_, address vesting_) {
        require(controller_ != address(0) && controller_.code.length != 0, "NVRA: invalid controller");
        require(vesting_ != address(0) && vesting_.code.length != 0, "NVRA: invalid vesting");
        factory = msg.sender;
        controller = controller_;
        vesting = vesting_;
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
        released += amount;
        IERC20(token).safeTransfer(vesting, amount);
    }
}
