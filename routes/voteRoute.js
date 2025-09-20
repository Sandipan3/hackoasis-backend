import express from "express";
import {
  createElection,
  registerVoters,
  castVote,
  getVoteCount,
  getRole,
  addAdmin,
  registerCandidate,
  getCandidate,
} from "../controllers/voteController.js";

const voteRouter = express.Router();

voteRouter.post("/create", createElection);
voteRouter.post("/register", registerVoters);
voteRouter.post("/vote", castVote);
voteRouter.post("/add-admin", addAdmin);
voteRouter.post("/role", getRole);
voteRouter.post("/candidate/register", registerCandidate);
voteRouter.get("/candidate/:electionId/:candidateId", getCandidate);
voteRouter.get("/count/:electionId/:candidateId", getVoteCount);

export default voteRouter;
