import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const contractAbi = [
  "function createElection(string title, string description, uint256 totalCandidates) public returns (uint256)",
  "function registerVoters(uint256 electionId, bytes32[] identityCommitments) public",
  "function castVote(uint256 electionId, uint256 candidateId, bytes32 nullifier, bytes32 identityCommitment) public",
  "function getVoteCount(uint256 electionId, uint256 candidateId) public view returns (uint256)",
];

// ------------------ Provider and contract ------------------
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractAbi,
  signer
);

// Admin: create election
export const createElection = async (req, res) => {
  try {
    const { title, description, totalCandidates } = req.body;
    const tx = await contract.createElection(
      title,
      description,
      totalCandidates
    );
    const receipt = await tx.wait();
    res.json({ message: "Election created", txHash: tx.hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Admin: register voters
export const registerVoters = async (req, res) => {
  try {
    const { electionId, identityCommitments } = req.body;
    const tx = await contract.registerVoters(electionId, identityCommitments);
    await tx.wait();
    res.json({ message: "Voters registered", txHash: tx.hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Voter: cast vote
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
    res.json({ message: "Vote casted", txHash: tx.hash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get vote count
export const getVoteCount = async (req, res) => {
  try {
    const { electionId, candidateId } = req.params;
    const votes = await contract.getVoteCount(electionId, candidateId);
    res.json({ electionId, candidateId, votes: votes.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
