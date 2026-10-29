// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/** @notice UNDEPLOYED candidate, independent of the 100m testnet NVRA. */
contract NVRAMainnetCandidate is ERC20 {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18;

    constructor(address treasury) ERC20("NovaRise Utility Token", "NVRA") {
        require(treasury != address(0), "NVRA: zero treasury");
        require(treasury.code.length != 0, "NVRA: treasury must be a contract");
        _mint(treasury, MAX_SUPPLY);
    }
}
