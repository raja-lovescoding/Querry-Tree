import Message from "../models/Message.js";
import { buildContext } from "../utils/buildContext.js";
import { getAIResponse } from "../services/aiService.js";

export const createMessage = async (req, res) => {
  try {
    const { content, parentId } = req.body;

    // 1. Save user message
    const userMsg = await Message.create({
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
      content: aiReply,
      role: "assistant",
      parentId: userMsg._id,
    });

    res.status(201).json({
      user: userMsg,
      assistant: aiMsg,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to process message" });
  }
};