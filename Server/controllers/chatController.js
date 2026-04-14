import Message from "../models/Message.js";
import { buildContext } from "../utils/buildContext.js";
import { getAIResponse } from "../services/aiService.js";
import Branch from "../models/Branch.js";
import Conversation from "../models/Conversation.js";
import { getBranchTitle, getConversationTitle, isDefaultBranchTitle, isDefaultConversationTitle } from "../utils/titleUtils.js";

export const createMessage = async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { content, parentId, branchId, conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // 1. Save user message
    const userMsg = await Message.create({
      userId,
      conversationId,
      content,
      role: "user",
      parentId: parentId || null,
    });

    // 2. Build context
    const context = await buildContext(userMsg._id, userId);

    // 3. Get AI response
    const aiReply = await getAIResponse(context);

    // 4. Store AI message
    const aiMsg = await Message.create({
      userId,
      conversationId,
      content: aiReply,
      role: "assistant",
      parentId: userMsg._id,
    });

    let branch = null;

    if (branchId) {
      branch = await Branch.findOneAndUpdate(
        { _id: branchId, conversationId, userId },
        { lastMessageId: aiMsg._id },
        { new: true }
      );
    }

    // If no branch is active (or the id was stale), start a root branch.
    if (!branch) {
      branch = await Branch.create({
        userId,
        conversationId,
        parentBranchId: null,
        title: getBranchTitle(userMsg.content),
        lastMessageId: aiMsg._id,
      });
    } else if (isDefaultBranchTitle(branch.title)) {
      branch.title = getBranchTitle(userMsg.content);
      await branch.save();
    }

    if (conversation) {
      conversation.lastMessageId = aiMsg._id;

      if (isDefaultConversationTitle(conversation.title)) {
        conversation.title = getConversationTitle(userMsg.content);
      }

      await conversation.save();
    }

    res.status(201).json({
      user: userMsg,
      assistant: aiMsg,
      branch,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message || "Failed to process message" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId, userId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};