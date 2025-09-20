import express from "express";
import { getNonce, login } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/nonce", getNonce);
authRouter.post("/login", login);

export default authRouter;
