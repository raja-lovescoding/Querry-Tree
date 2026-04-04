import express from "express";
import Conversation from "../models/Conversation.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (_err) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    const conversation = await Conversation.create({
      title: title?.trim() || "New Chat",
      lastMessageId: null,
    });
    res.status(201).json(conversation);
  } catch (_err) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

export default router;