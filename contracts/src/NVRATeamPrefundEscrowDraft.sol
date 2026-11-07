// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/** @notice Local research only: atomic, factory-only transfer to the verified vesting. */
contract NVRATeamPrefundEscrowDraft {
    using SafeERC20 for IERC20;
    address public immutable factory;
    bool public funded;
    constructor() { factory = msg.sender; }
    function fund(address token, address vesting) external {
        require(msg.sender == factory && !funded, "NVRA: factory only / funded");
        require(token.code.length != 0 && vesting.code.length != 0, "NVRA: invalid code");
        funded = true;
        IERC20(token).safeTransfer(vesting, 150_000 ether);
        require(IERC20(token).balanceOf(address(this)) == 0, "NVRA: escrow remainder");
    }
}
