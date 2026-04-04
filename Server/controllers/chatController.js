import Message from "../models/Message.js";
import { buildContext } from "../utils/buildContext.js";
import { getAIResponse } from "../services/aiService.js";
import Branch from "../models/Branch.js";
import Conversation from "../models/Conversation.js";

export const createMessage = async (req, res) => {
  try {
    const { content, parentId, branchId, conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    // 1. Save user message
    const userMsg = await Message.create({
      conversationId,
      content,
      role: "user",
      parentId: parentId || null,
    });

    // 2. Build context
    const context = await buildContext(userMsg._id);

    // 3. Get AI response
    const aiReply = await getAIResponse(context);

    // 4. Store AI message
    const aiMsg = await Message.create({
      conversationId,
      content: aiReply,
      role: "assistant",
      parentId: userMsg._id,
    });

    let branch = null;

    if (branchId) {
      branch = await Branch.findByIdAndUpdate(
        branchId,
        { lastMessageId: aiMsg._id },
        { new: true }
      );
    }

    // If no branch is active (or the id was stale), start a root branch.
    if (!branch) {
      branch = await Branch.create({
        conversationId,
        parentBranchId: null,
        lastMessageId: aiMsg._id,
      });
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageId: aiMsg._id,
    });

    res.status(201).json({
      user: userMsg,
      assistant: aiMsg,
      branch,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to process message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};