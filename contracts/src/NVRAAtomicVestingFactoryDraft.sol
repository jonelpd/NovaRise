// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {NVRAFactoryBoundVaultDraft} from "./NVRAFactoryBoundVaultDraft.sol";
import {NVRATeamRestrictedVaultDraft} from "./NVRATeamRestrictedVaultDraft.sol";
import {NVRAAtomicAllocationCandidate} from "./NVRAAtomicAllocationCandidate.sol";

/**
 * @notice UNDEPLOYED research factory with mandatory team vesting destination.
 * @dev Creates 4 general vaults and 1 team-only vault, mints the full NVRA
 *      supply, then binds each vault in a single reverting transaction.
 *      Does not authenticate controller as Safe or vesting implementation.
 */
contract NVRAAtomicVestingFactoryDraft {
    address public immutable initializer;
    address public immutable controller;
    address public immutable teamVesting;
    bool public initialized;
    address public token;
    address[5] public vaults;

    constructor(address controller_, address teamVesting_) {
        require(controller_ != address(0) && controller_.code.length != 0, "NVRA: invalid controller");
        require(teamVesting_ != address(0) && teamVesting_.code.length != 0, "NVRA: invalid vesting");
        initializer = msg.sender;
        controller = controller_;
        teamVesting = teamVesting_;
    }

    function predictVault(uint8 bucket) public view returns (address) {
        require(bucket < 5, "NVRA: invalid bucket");
        bytes32 salt = keccak256(abi.encodePacked("NVRA-vesting-v1", bucket));
        bytes32 initHash;
        if (bucket == 3) {
            initHash = keccak256(abi.encodePacked(
                type(NVRATeamRestrictedVaultDraft).creationCode,
                abi.encode(controller, teamVesting)
            ));
        } else {
            initHash = keccak256(abi.encodePacked(
                type(NVRAFactoryBoundVaultDraft).creationCode,
                abi.encode(controller, bucket)
            ));
        }
        return address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff), address(this), salt, initHash
        )))));
    }

    function initialize() external returns (address tokenAddress) {
        require(msg.sender == initializer, "NVRA: initializer only");
        require(!initialized, "NVRA: already initialized");
        initialized = true;
        address[5] memory recipients;
        for (uint8 i = 0; i < 5; ++i) {
            bytes32 salt = keccak256(abi.encodePacked("NVRA-vesting-v1", i));
            if (i == 3) {
                recipients[i] = address(new NVRATeamRestrictedVaultDraft{salt: salt}(controller, teamVesting));
            } else {
                recipients[i] = address(new NVRAFactoryBoundVaultDraft{salt: salt}(controller, i));
            }
            require(recipients[i] == predictVault(i), "NVRA: address mismatch");
            vaults[i] = recipients[i];
        }
        NVRAAtomicAllocationCandidate candidate = new NVRAAtomicAllocationCandidate(recipients);
        tokenAddress = address(candidate);
        token = tokenAddress;
        for (uint8 i = 0; i < 5; ++i) {
            if (i == 3) {
                NVRATeamRestrictedVaultDraft(recipients[i]).bindToken(tokenAddress);
            } else {
                NVRAFactoryBoundVaultDraft(recipients[i]).bindToken(tokenAddress);
            }
        }
    }
}
