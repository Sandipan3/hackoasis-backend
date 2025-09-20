// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CampusVoting is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Candidate {
        string name;
        string description;
    }

    struct Election {
        string title;
        string description;
        bool exists;
        uint256 totalCandidates;
        mapping(uint256 => uint256) votes; // candidateId => votes
        mapping(uint256 => Candidate) candidates; // candidateId => Candidate
        mapping(bytes32 => bool) nullifiers; // prevent double voting
        mapping(bytes32 => bool) identityCommitments; // registered voters
    }

    mapping(uint256 => Election) private elections;
    uint256 public electionCount;

    event ElectionCreated(uint256 indexed electionId, string title);
    event CandidateRegistered(uint256 indexed electionId, uint256 indexed candidateId, string name);
    event VoterRegistered(uint256 indexed electionId, bytes32 identityCommitment);
    event VoteCasted(uint256 indexed electionId, uint256 candidateId, bytes32 nullifier);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // Admin creates election
    function createElection(string calldata title, string calldata description)
        external
        onlyRole(ADMIN_ROLE)
        returns (uint256)
    {
        uint256 electionId = electionCount++;
        Election storage e = elections[electionId];
        e.title = title;
        e.description = description;
        e.exists = true;

        emit ElectionCreated(electionId, title);
        return electionId;
    }

    // Admin registers candidates for an election
    function registerCandidate(
        uint256 electionId,
        string calldata name,
        string calldata description
    ) external onlyRole(ADMIN_ROLE) {
        Election storage e = elections[electionId];
        require(e.exists, "Election doesn't exist");

        uint256 candidateId = e.totalCandidates;
        e.candidates[candidateId] = Candidate(name, description);
        e.totalCandidates += 1;

        emit CandidateRegistered(electionId, candidateId, name);
    }

    // Admin registers voters
    function registerVoters(uint256 electionId, bytes32[] calldata identityCommitments)
        external
        onlyRole(ADMIN_ROLE)
    {
        Election storage e = elections[electionId];
        require(e.exists, "Election doesn't exist");

        for (uint256 i = 0; i < identityCommitments.length; i++) {
            e.identityCommitments[identityCommitments[i]] = true;
            emit VoterRegistered(electionId, identityCommitments[i]);
        }
    }

    // Cast vote
    function castVote(
        uint256 electionId,
        uint256 candidateId,
        bytes32 nullifier,
        bytes32 identityCommitment
    ) external {
        Election storage e = elections[electionId];
        require(e.exists, "Election doesn't exist");
        require(candidateId < e.totalCandidates, "Invalid candidate");
        require(!e.nullifiers[nullifier], "Already voted");
        require(e.identityCommitments[identityCommitment], "Voter not registered");

        e.votes[candidateId] += 1;
        e.nullifiers[nullifier] = true;

        emit VoteCasted(electionId, candidateId, nullifier);
    }

    // Get candidate vote count
    function getVoteCount(uint256 electionId, uint256 candidateId) external view returns (uint256) {
        Election storage e = elections[electionId];
        require(e.exists, "Election doesn't exist");
        return e.votes[candidateId];
    }

    // Get candidate info
    function getCandidate(uint256 electionId, uint256 candidateId) external view returns (string memory, string memory) {
        Election storage e = elections[electionId];
        require(e.exists, "Election doesn't exist");
        Candidate storage c = e.candidates[candidateId];
        return (c.name, c.description);
    }

    // Check admin role
    function isAdmin(address user) external view returns (bool) {
        return hasRole(ADMIN_ROLE, user);
    }

    // Admin can grant role to new addresses
    function addAdmin(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ADMIN_ROLE, newAdmin);
    }
}
