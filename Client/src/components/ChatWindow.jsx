import { useState } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import {
  createConversation,
  fetchBranches,
  fetchConversations,
  fetchMessages,
  sendMessage,
} from "../services/api";
import { getPath } from "../utils/getpath";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import ConversationSidebar from "./ConversationSidebar";

const ChatWindow = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadConversations = async () => {
      const conversationData = await fetchConversations();
      const safeConversations = Array.isArray(conversationData)
        ? conversationData
        : [];

      setConversations(safeConversations);

      if (safeConversations.length > 0) {
        setActiveConversationId(safeConversations[0]._id);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
    const loadConversationData = async () => {
      if (!activeConversationId) {
        setMessages([]);
        setBranches([]);
        setActiveBranchId(null);
        setActiveNodeId(null);
        return;
      }

      const [branchData, messageData] = await Promise.all([
        fetchBranches(activeConversationId),
        fetchMessages(activeConversationId),
      ]);

      const safeBranches = Array.isArray(branchData) ? branchData : [];
      const safeMessages = Array.isArray(messageData) ? messageData : [];

      setBranches(safeBranches);
      setMessages(safeMessages);

      if (safeBranches.length > 0) {
        const latestBranch = safeBranches[safeBranches.length - 1];
        setActiveBranchId(latestBranch._id);
        setActiveNodeId(latestBranch.lastMessageId || null);
        return;
      }

      setActiveBranchId(null);
      setActiveNodeId(safeMessages.length > 0 ? safeMessages[safeMessages.length - 1]._id : null);
    };

    loadConversationData();
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeBranchId) return;

    const branch = branches.find((b) => b._id === activeBranchId);

    if (branch) {
      setActiveNodeId(branch.lastMessageId);
    }
  }, [activeBranchId, branches]);

  const handleCreateConversation = async () => {
    try {
      const conversation = await createConversation();
      if (!conversation?._id) {
        return;
      }

      setConversations((prev) => [conversation, ...prev]);
      setActiveConversationId(conversation._id);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to create conversation");
    }
  };

  const handleSend = async (text) => {
    if (!activeConversationId) {
      return;
    }

    try {
      const data = await sendMessage(
        text,
        activeNodeId,
        activeBranchId,
        activeConversationId
      );

      setMessages((prev) => [...prev, data.user, data.assistant]);
      setActiveNodeId(data.assistant._id);

      if (data.branch?._id) {
        setActiveBranchId(data.branch._id);
        setBranches((prev) => {
          const hasExisting = prev.some((b) => b._id === data.branch._id);

          if (hasExisting) {
            return prev.map((b) =>
              b._id === data.branch._id ? { ...b, ...data.branch } : b
            );
          }

          return [...prev, data.branch];
        });
      }

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === activeConversationId
            ? { ...conversation, lastMessageId: data.assistant._id }
            : conversation
        )
      );
      setError("");
    } catch (err) {
      setError(err.message || "Failed to send message");
    }
  };

  const visibleMessages = activeNodeId ? getPath(messages, activeNodeId) : messages;

  return (
    <div style={{ display: "flex" }}>
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={setActiveConversationId}
        onCreate={handleCreateConversation}
      />

      <div style={{ flex: 1, padding: "20px" }}>
        <h2>ConceptTree Chat</h2>
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

        <div>
          {visibleMessages.map((msg) => (
            <Message
              key={msg._id}
              msg={msg}
              onSelect={setActiveNodeId}
              isActive={msg._id === activeNodeId}
              activeBranchId={activeBranchId}
              activeConversationId={activeConversationId}
              onBranchCreate={(branch) => {
                setBranches((prev) => [...prev, branch]);
                setActiveBranchId(branch._id);
                setActiveNodeId(branch.lastMessageId);
              }}
            />
          ))}
        </div>

        <InputBox onSend={handleSend} />
      </div>

      <Sidebar
        branches={branches}
        onSelect={setActiveBranchId}
        activeBranchId={activeBranchId}
      />
    </div>
  );
};

export default ChatWindow;