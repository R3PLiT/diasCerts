// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract diasCerts {
    address public owner;

    mapping(address => bool) issuers;
    mapping(bytes32 => bool) roots;
    mapping(bytes32 => bool) revokedLeafs;

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can perform this action."
        );
        _;
    }

    modifier onlyIssuer() {
        require(
            issuers[msg.sender] == true,
            "Only authorized issuers can perform this action."
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addIssuer(address _issuer) public onlyOwner {
        issuers[_issuer] = true;
    }

    function addRoot(bytes32 _root) public onlyIssuer returns (uint timeStamp_) {
        require(roots[_root] != true, "This information already exists.");

        roots[_root] = true;
        timeStamp_ = block.timestamp;
    }

    function revertAddRoot(bytes32 _root) public onlyIssuer returns (uint timeStamp_) {
        require(roots[_root] == true, "This information does not exists.");

        roots[_root] = false;
        timeStamp_ = block.timestamp;
    }

    function verifyLeaf(
        bytes32 _root,
        bytes32[] memory _proof,
        bytes32 _leaf
    ) public view returns (bool valid_) {
        require(
            revokedLeafs[_leaf] != true,
            "This certificate has been revoked."
        );
        require(roots[_root] == true, "Information for proof is incorrect.");

        bytes32 leafHash = keccak256(
            bytes.concat(keccak256(abi.encode(_leaf)))
        );

        require(
            MerkleProof.verify(_proof, _root, leafHash),
            "This certificate is invalid"
        );

        valid_ = true;
    }

    function revokeLeaf(bytes32 _leaf) public onlyIssuer returns (uint timeStamp_) {
        require(
            revokedLeafs[_leaf] != true,
            "This certificate has been revoked."
        );

        revokedLeafs[_leaf] = true;
        timeStamp_ = block.timestamp;
    }

    function revertRevokeLeaf(bytes32 _leaf) public onlyIssuer returns (uint timeStamp_) {
        require(
            revokedLeafs[_leaf] == true,
            "This certificate has not been revoked or does not exists."
        );

        revokedLeafs[_leaf] = false;
        timeStamp_ = block.timestamp;
    }
}
