import express from "express";
import Branch from "../models/Branch.js";

const router = express.Router();

// create new branch
router.post("/", async (req, res) => {
  try {
    const { parentBranchId, lastMessageId, conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const branch = await Branch.create({
      conversationId,
      parentBranchId: parentBranchId || null,
      lastMessageId,
    });

    res.json(branch);
  } catch (err) {
    res.status(500).json({ error: "Failed to create branch" });
  }
});

// get all branches
router.get("/", async (req, res) => {
  const { conversationId } = req.query;

  if (!conversationId) {
    return res.status(400).json({ error: "conversationId is required" });
  }

  const branches = await Branch.find({ conversationId }).sort({ createdAt: 1 });
  res.json(branches);
});

export default router;