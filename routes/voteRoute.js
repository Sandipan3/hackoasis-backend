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
voteRouter.post("/create", authMiddleware, createElection);
voteRouter.post("/register", authMiddleware, registerVoters);
voteRouter.post("/cast", authMiddleware, castVote);
voteRouter.get("/:electionId/:candidateId", getVoteCount);
voteRouter.post("/role", authMiddleware, getRole);

export default voteRouter;
