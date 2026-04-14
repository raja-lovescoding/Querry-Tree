// Builds the conversational path to the root node.
import Message from "../models/Message.js";
export const buildContext = async (messageId, userId) => {
  try {
    const context = [];
    let currentId = messageId;
    while (currentId) {
      const message = await Message.findOne({ _id: currentId, userId });
      if (!message) break;
      context.push({
        content: message.content,
        role: message.role,
      });
      currentId = message.parentId;
    }
    return context.reverse();
  }
  catch (error) {
    console.error("Error building context:", error);
    return [];
  }
};
  
