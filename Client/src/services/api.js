const API_BASE = "http://localhost:5000";

export const fetchConversations = async () => {
  const res = await fetch(`${API_BASE}/conversations`);
  return res.json();
};

export const createConversation = async (title = "New Chat") => {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  return res.json();
};

export const sendMessage = async (content, parentId, branchId, conversationId) => {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, parentId, branchId, conversationId }),
  });

  return res.json();
};

export const fetchMessages = async (conversationId) => {
  const res = await fetch(`${API_BASE}/chat?conversationId=${conversationId}`);
  return res.json();
};

export const createBranch = async (parentBranchId, lastMessageId, conversationId) => {
  const res = await fetch(`${API_BASE}/branches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parentBranchId, lastMessageId, conversationId }),
  });

  return res.json();
};

export const fetchBranches = async (conversationId) => {
  const res = await fetch(`${API_BASE}/branches?conversationId=${conversationId}`);
  return res.json();
};