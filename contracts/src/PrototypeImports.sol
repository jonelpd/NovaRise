// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Compile the prototypes kept at the project root, plus the standard
// OpenZeppelin VestingWallet artifact needed by local integration tests.
import {NVRAToken} from "../NVRAToken.sol";
import {VestingWallet} from "@openzeppelin/contracts/finance/VestingWallet.sol";
