// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface INVRAVestingIdentity {
    function owner() external view returns (address);
    function start() external view returns (uint256);
    function duration() external view returns (uint256);
    function cliffDuration() external view returns (uint64);
}

/**
 * @notice UNDEPLOYED research guard for validating the intended team vesting.
 * @dev The expected runtime codehash must be independently verified off-chain.
 *      A matching hash is not an audit; mutable ownership can change later.
 */
contract NVRAVestingIdentityGuardDraft {
    address public immutable vesting;
    address public immutable expectedBeneficiary;
    bytes32 public immutable expectedCodehash;
    uint256 public immutable expectedStart;
    uint256 public immutable expectedDuration;
    uint64 public immutable expectedCliff;

    constructor(
        address vesting_,
        address beneficiary_,
        bytes32 codehash_,
        uint256 start_,
        uint256 duration_,
        uint64 cliff_
    ) {
        require(vesting_ != address(0) && vesting_.code.length != 0, "NVRA: vesting not contract");
        require(beneficiary_ != address(0), "NVRA: zero beneficiary");
        require(codehash_ != bytes32(0), "NVRA: zero codehash");
        require(start_ != 0 && duration_ > cliff_ && cliff_ != 0, "NVRA: invalid schedule");
        vesting = vesting_;
        expectedBeneficiary = beneficiary_;
        expectedCodehash = codehash_;
        expectedStart = start_;
        expectedDuration = duration_;
        expectedCliff = cliff_;
        verify();
    }

    function verify() public view {
        require(vesting.codehash == expectedCodehash, "NVRA: vesting codehash mismatch");
        INVRAVestingIdentity candidate = INVRAVestingIdentity(vesting);
        require(candidate.owner() == expectedBeneficiary, "NVRA: beneficiary mismatch");
        require(candidate.start() == expectedStart, "NVRA: start mismatch");
        require(candidate.duration() == expectedDuration, "NVRA: duration mismatch");
        require(candidate.cliffDuration() == expectedCliff, "NVRA: cliff mismatch");
    }
}
