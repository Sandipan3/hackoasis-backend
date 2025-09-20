import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// ------------------ Contract ABI ------------------
const contractAbi = [
  "function createElection(string title, string description, uint256 totalCandidates) public returns (uint256)",
  "function registerVoters(uint256 electionId, bytes32[] identityCommitments) public",
  "function castVote(uint256 electionId, uint256 candidateId, bytes32 nullifier, bytes32 identityCommitment) public",
  "function getVoteCount(uint256 electionId, uint256 candidateId) public view returns (uint256)",
];

// ------------------ Provider and Contract ------------------
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractAbi,
  signer
);

// ------------------ Controllers ------------------

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

    const electionId = receipt.events[0].args.electionId.toString();

    res.json({
      message: "Election created successfully",
      electionId,
      txHash: tx.hash,
    });
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

    res.json({
      message: "Voters registered successfully",
      txHash: tx.hash,
    });
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

    res.json({
      message: "Vote cast successfully",
      txHash: tx.hash,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Public: get vote count
export const getVoteCount = async (req, res) => {
  try {
    const { electionId, candidateId } = req.params;
    const votes = await contract.getVoteCount(electionId, candidateId);
    res.json({
      electionId,
      candidateId,
      votes: votes.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Check if a user is admin
export const getRole = async (req, res) => {
  try {
    const { userAddress } = req.body;
    const isAdmin = await contract.isAdmin(userAddress);
    res.json({ isAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
