import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { ethers } from "ethers";
import User from "../models/User.js";

dotenv.config();

// Generate or fetch nonce for a wallet
export const getNonce = async (req, res) => {
  try {
    let { publicAddress } = req.body;
    if (!publicAddress) {
      return res.status(400).json({ message: "Public address is required" });
    }

    publicAddress = publicAddress.toLowerCase();

    let user = await User.findOne({ publicAddress });
    if (!user) {
      // create new user if not exists
      user = await User.create({
        publicAddress,
        nonce: crypto.randomBytes(32).toString("hex"),
      });
    }

    return res.status(200).json({ nonce: user.nonce });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Verify signature and login
export const login = async (req, res) => {
  try {
    let { publicAddress, signature } = req.body;
    if (!publicAddress || !signature) {
      return res
        .status(400)
        .json({ message: "Missing publicAddress or signature" });
    }

    publicAddress = publicAddress.toLowerCase();
    const user = await User.findOne({ publicAddress });
    if (!user) return res.status(404).json({ message: "User not found" });
    const message = `Sign this nonce: ${user.nonce}`;
    const recovered = ethers.verifyMessage(message, signature);

    if (recovered.toLowerCase() !== publicAddress) {
      return res.status(401).json({ message: "Signature verification failed" });
    }

    // refresh nonce for next login
    user.nonce = crypto.randomBytes(256).toString("hex");
    await user.save();

    const token = jwt.sign(
      { id: user._id, publicAddress },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token, publicAddress });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
