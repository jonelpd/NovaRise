// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/** @dev Test-only recipient. NOT a production multisig. */
contract MockNVRATreasury {
    function sendToken(address token, address to, uint256 amount) external {
        require(IERC20(token).transfer(to, amount), "transfer failed");
    }
}
