import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Branch from "../models/Branch.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.uid }).sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (_err) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title } = req.body;
    const conversation = await Conversation.create({
      userId,
      title: title?.trim() || "New Chat",
      lastMessageId: null,
    });
    res.status(201).json(conversation);
  } catch (_err) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await Conversation.deleteOne({ _id: id, userId });
    await Message.deleteMany({ conversationId: id, userId });
    await Branch.deleteMany({ conversationId: id, userId });

    return res.json({
      message: "Conversation deleted successfully",
      deletedConversationId: id,
    });
  } catch (_err) {
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export default router;