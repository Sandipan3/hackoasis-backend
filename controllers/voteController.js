import dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";

const contractAbi = [
  "function createElection(string title, string description) public returns (uint256)",
  "function registerVoters(uint256 electionId, bytes32[] identityCommitments) public",
  "function castVote(uint256 electionId, uint256 candidateId, bytes32 nullifier, bytes32 identityCommitment) public",
  "function getVoteCount(uint256 electionId, uint256 candidateId) public view returns (uint256)",
  "function isAdmin(address user) public view returns (bool)",
  "function addAdmin(address newAdmin) public",
  "function registerCandidate(uint256 electionId, string name, string description) public",
  "function getCandidate(uint256 electionId, uint256 candidateId) public view returns (string name, string description)",
  "event ElectionCreated(uint256 indexed electionId, string title)",
  "event VoterRegistered(uint256 indexed electionId, bytes32 identityCommitment)",
  "event VoteCasted(uint256 indexed electionId, uint256 candidateId, bytes32 nullifier)",
  "event CandidateRegistered(uint256 indexed electionId, uint256 indexed candidateId, string name)",
];

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractAbi,
  signer
);

function parseEvent(receipt, eventName) {
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed.name === eventName) return parsed.args;
    } catch (err) {
      continue;
    }
  }
  return null;
}

export const createElection = async (req, res) => {
  try {
    const { title, description } = req.body;
    const tx = await contract.createElection(title, description);
    const receipt = await tx.wait();
    const event = parseEvent(receipt, "ElectionCreated");
    if (!event) throw new Error("ElectionCreated event not found");
    res.json({
      message: "Election created successfully",
      electionId: event.electionId.toString(),
      txHash: tx.hash,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerVoters = async (req, res) => {
  try {
    const { electionId, identityCommitments } = req.body;
    const tx = await contract.registerVoters(electionId, identityCommitments);
    await tx.wait();
    res.json({ message: "Voters registered successfully", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const castVote = async (req, res) => {
  try {
    const { electionId, candidateId, nullifier, identityCommitment } = req.body;
    const tx = await contract.castVote(
      electionId,
      candidateId,
      nullifier,
      identityCommitment
    );
    await tx.wait();
    res.json({ message: "Vote cast successfully", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVoteCount = async (req, res) => {
  try {
    const { electionId, candidateId } = req.params;
    const votes = await contract.getVoteCount(electionId, candidateId);
    res.json({ electionId, candidateId, votes: votes.toString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRole = async (req, res) => {
  try {
    const { userAddress } = req.body;
    const isAdmin = await contract.isAdmin(userAddress);
    res.json({ isAdmin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addAdmin = async (req, res) => {
  try {
    const { newAdmin } = req.body;
    const tx = await contract.addAdmin(newAdmin);
    await tx.wait();
    res.json({ message: "Admin role granted", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerCandidate = async (req, res) => {
  try {
    const { electionId, name, description } = req.body;
    const tx = await contract.registerCandidate(electionId, name, description);
    await tx.wait();
    res.json({ message: "Candidate registered successfully", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCandidate = async (req, res) => {
  try {
    const { electionId, candidateId } = req.params;
    const [name, description] = await contract.getCandidate(
      electionId,
      candidateId
    );
    res.json({ electionId, candidateId, name, description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
