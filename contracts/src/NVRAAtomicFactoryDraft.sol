// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {NVRAFactoryBoundVaultDraft} from "./NVRAFactoryBoundVaultDraft.sol";
import {NVRAAtomicAllocationCandidate} from "./NVRAAtomicAllocationCandidate.sol";

/**
 * @notice UNDEPLOYED local-only research factory.
 * @dev All five CREATE2 vaults, token creation and token binding are one atomic
 *      transaction. CREATE2 salts provide predictable vault addresses; no
 *      externally predicted deployer nonce or token address is needed.
 *      Does not authenticate the controller as a real Safe.
 */
contract NVRAAtomicFactoryDraft {
    address public immutable initializer;
    address public immutable controller;
    bool public initialized;

    constructor(address controller_) {
        require(controller_ != address(0) && controller_.code.length != 0, "NVRA: invalid controller");
        initializer = msg.sender;
        controller = controller_;
    }
    address public token;
    address[5] public vaults;

    function predictVault(uint8 bucket) public view returns (address) {
        require(bucket < 5, "NVRA: invalid bucket");
        bytes32 salt = keccak256(abi.encodePacked("NVRA-vault-v1", bucket));
        bytes32 initHash = keccak256(abi.encodePacked(
            type(NVRAFactoryBoundVaultDraft).creationCode,
            abi.encode(controller, bucket)
        ));
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
            bytes32 salt = keccak256(abi.encodePacked("NVRA-vault-v1", i));
            NVRAFactoryBoundVaultDraft vault = new NVRAFactoryBoundVaultDraft{salt: salt}(controller, i);
            recipients[i] = address(vault);
            require(address(vault) == predictVault(i), "NVRA: address mismatch");
            vaults[i] = address(vault);
        }
        NVRAAtomicAllocationCandidate candidate = new NVRAAtomicAllocationCandidate(recipients);
        tokenAddress = address(candidate);
        token = tokenAddress;
        for (uint8 i = 0; i < 5; ++i) {
            NVRAFactoryBoundVaultDraft(payable(recipients[i])).bindToken(tokenAddress);
        }
    }
}
