// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title NVRA experimental token
 * @notice TESTNET/LOCAL PROTOTYPE ONLY. No sale, investment rights or production deployment.
 * @dev Fixed supply, minted once to a separately controlled treasury on deployment.
 *      No owner, post-deployment minting, transfer tax, blacklist, pause or upgrade hooks.
 */
contract NVRAToken is ERC20 {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18;

    constructor(address treasury) ERC20("NovaRise Utility Token", "NVRA") {
        require(treasury != address(0), "NVRA: zero treasury");
        _mint(treasury, MAX_SUPPLY);
    }
}
