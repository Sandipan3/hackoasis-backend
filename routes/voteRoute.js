import express from "express";
import {} from "../controllers/voteControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getRole,
  createElection,
  registerVoters,
  castVote,
  getVoteCount,
} from "../controllers/voteController.js";

const voteRouter = express.Router();

// Only admin can create election and register voters
router.post("/create", authMiddleware, createElection);
router.post("/register", authMiddleware, registerVoters);
router.post("/cast", authMiddleware, castVote);
router.get("/:electionId/:candidateId", getVoteCount);
router.post("/role", authMiddleware, getRole);

export default voteRouter;
