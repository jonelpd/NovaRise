// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {NVRAFactoryBoundVaultDraft} from "./NVRAFactoryBoundVaultDraft.sol";
import {NVRATeamPrefundEscrowDraft} from "./NVRATeamPrefundEscrowDraft.sol";
import {NVRAAtomicAllocationCandidate} from "./NVRAAtomicAllocationCandidate.sol";
import {NVRAImmutableBeneficiaryVestingDraft} from "./NVRAImmutableBeneficiaryVestingDraft.sol";

/**
 * @notice UNDEPLOYED local-only research: CREATE2 vaults, token, immutable
 *         vesting and prefunding in one reverting transaction.
 * @dev Token is created before vesting to satisfy vesting's code-length check.
 *      The team escrow exists before token mint; only factory can fund vesting.
 *      Controller authenticity as the approved Safe 2-of-3 remains UNVERIFIED.
 */
contract NVRAAtomicImmutableVestingFactoryDraft {
    address public immutable initializer;
    address public immutable controller;
    address public immutable beneficiary;
    uint64 public immutable start;
    uint64 public immutable cliffDuration;
    uint64 public immutable linearDuration;
    bool public initialized;
    address public token;
    address public vesting;
    uint64 public actualVestingStart;
    address[5] public vaults;

    constructor(address controller_, address beneficiary_, uint64 start_, uint64 cliff_, uint64 linear_) {
        require(controller_.code.length != 0, "NVRA: invalid controller");
        require(beneficiary_ != address(0), "NVRA: zero beneficiary");
        require(start_ != 0 && cliff_ != 0 && linear_ != 0, "NVRA: invalid schedule");
        require(uint256(start_) + cliff_ + linear_ <= type(uint64).max, "NVRA: overflow");
        initializer = msg.sender;
        controller = controller_;
        beneficiary = beneficiary_;
        start = start_;
        cliffDuration = cliff_;
        linearDuration = linear_;
    }

    function predictVault(uint8 bucket) public view returns (address) {
        require(bucket < 5, "NVRA: invalid bucket");
        bytes32 salt = keccak256(abi.encodePacked("NVRA-immutable-v1", bucket));
        bytes32 initHash = bucket == 3
            ? keccak256(type(NVRATeamPrefundEscrowDraft).creationCode)
            : keccak256(abi.encodePacked(type(NVRAFactoryBoundVaultDraft).creationCode, abi.encode(controller, bucket)));
        return address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, initHash)))));
    }

    function initialize() external returns (address tokenAddress, address vestingAddress) {
        require(msg.sender == initializer && !initialized, "NVRA: unauthorized / initialized");
        require(block.timestamp >= start, "NVRA: before launch date");
        initialized = true;
        address[5] memory recipients;
        for (uint8 i; i < 5; ++i) {
            bytes32 salt = keccak256(abi.encodePacked("NVRA-immutable-v1", i));
            recipients[i] = i == 3
                ? address(new NVRATeamPrefundEscrowDraft{salt: salt}())
                : address(new NVRAFactoryBoundVaultDraft{salt: salt}(controller, i));
            require(recipients[i] == predictVault(i), "NVRA: CREATE2 mismatch");
            vaults[i] = recipients[i];
        }
        tokenAddress = address(new NVRAAtomicAllocationCandidate(recipients));
        vestingAddress = address(new NVRAImmutableBeneficiaryVestingDraft(
            tokenAddress, beneficiary, uint64(block.timestamp), cliffDuration, linearDuration
        ));
        require(NVRAImmutableBeneficiaryVestingDraft(vestingAddress).beneficiary() == beneficiary, "NVRA: beneficiary mismatch");
        require(address(NVRAImmutableBeneficiaryVestingDraft(vestingAddress).token()) == tokenAddress, "NVRA: token mismatch");
        token = tokenAddress;
        vesting = vestingAddress;
        actualVestingStart = uint64(block.timestamp);
        for (uint8 i; i < 5; ++i) {
            if (i != 3) NVRAFactoryBoundVaultDraft(recipients[i]).bindToken(tokenAddress);
        }
        NVRATeamPrefundEscrowDraft(recipients[3]).fund(tokenAddress, vestingAddress);
    }
}
