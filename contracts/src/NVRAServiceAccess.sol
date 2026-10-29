// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NVRAServiceAccess
 * @notice Read-only, non-custodial token-balance eligibility for NovaRise apps.
 * @dev NOT a subscription, identity proof, anti-sybil measure or permanent entitlement.
 *      The consuming application must authenticate wallet ownership off-chain and
 *      define a real service. Balance eligibility can change after a transfer.
 */
contract NVRAServiceAccess {
    IERC20 public immutable nvra;
    uint256 public immutable minimumBalance;

    constructor(address token_, uint256 minimumBalance_) {
        require(token_ != address(0) && token_.code.length != 0, "NVRA: invalid token");
        require(minimumBalance_ > 0, "NVRA: invalid minimum");
        nvra = IERC20(token_);
        minimumBalance = minimumBalance_;
    }

    function hasAccess(address wallet) external view returns (bool) {
        return wallet != address(0) && nvra.balanceOf(wallet) >= minimumBalance;
    }

    function balanceAndEligibility(address wallet) external view returns (uint256 balance, bool eligible) {
        if (wallet == address(0)) return (0, false);
        balance = nvra.balanceOf(wallet);
        eligible = balance >= minimumBalance;
    }
}
