// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Makes OpenZeppelin's reviewed VestingWallet available as a Hardhat artifact
// for LOCAL integration tests. Not a project-specific vesting contract.
import {VestingWallet} from "@openzeppelin/contracts/finance/VestingWallet.sol";
