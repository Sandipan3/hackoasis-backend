import express from "express";
import {
  createElection,
  registerVoters,
  castVote,
  getVoteCount,
} from "../controllers/voteControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only admin can create election and register voters
router.post("/create", authMiddleware, createElection);
router.post("/register", authMiddleware, registerVoters);

// Voters can cast votes
router.post("/cast", authMiddleware, castVote);

// Anyone can query votes
router.get("/:electionId/:candidateId", getVoteCount);

export default router;
