const API_BASE = "http://localhost:5000";

export const fetchConversations = async () => {
  const res = await fetch(`${API_BASE}/conversations`);
  if (!res.ok) throw new Error("Failed to fetch conversations");
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

  if (!res.ok) throw new Error("Failed to create conversation");

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

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || "Failed to send message");
  }

  return res.json();
};

export const fetchMessages = async (conversationId) => {
  const res = await fetch(`${API_BASE}/chat?conversationId=${conversationId}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
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

  if (!res.ok) throw new Error("Failed to create branch");

  return res.json();
};

export const fetchBranches = async (conversationId) => {
  const res = await fetch(`${API_BASE}/branches?conversationId=${conversationId}`);
  if (!res.ok) throw new Error("Failed to fetch branches");
  return res.json();
};