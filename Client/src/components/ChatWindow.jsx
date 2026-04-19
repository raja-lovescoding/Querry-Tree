import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import {
  createConversation,
  deleteBranch,
  deleteConversation,
  fetchBranches,
  fetchConversations,
  fetchMessages,
  sendMessage,
} from "../services/api";
import { getPath } from "../utils/getpath";
import Sidebar from "./Sidebar";
import ConversationSidebar from "./ConversationSidebar";
import Header from "./Header";
import Footer from "./Footer";

const ChatWindow = ({ user, onLogout }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState(null);
  const [error, setError] = useState("");
  const [isAIloading, setIsAILoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const streamTimerRef = useRef(null);

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

  const clearStreamingTimer = () => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearStreamingTimer();
    };
  }, []);

  useEffect(() => {
    clearStreamingTimer();
    setIsStreaming(false);
    setStreamingMessageId(null);
  }, [activeConversationId]);

  useEffect(() => {
    setSearchQuery("");
  }, [activeConversationId]);

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

  const streamAssistantMessage = (assistantMessageId, fullText) => {
    clearStreamingTimer();

    const text = typeof fullText === "string" ? fullText : "";
    let index = 0;

    setIsStreaming(true);
    setStreamingMessageId(assistantMessageId);

    streamTimerRef.current = setInterval(() => {
      const chunk = Math.floor(Math.random() * 7) + 1;
      index = Math.min(index + chunk, text.length);
      const nextText = text.slice(0, index);

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === assistantMessageId ? { ...msg, content: nextText } : msg
        )
      );

      if (index >= text.length) {
        clearStreamingTimer();
        setIsStreaming(false);
        setStreamingMessageId(null);
      }
    }, 28);
  };

  const handleSend = async (text) => {
    if (!activeConversationId) {
      return;
    }

    clearStreamingTimer();
    setIsStreaming(false);
    setStreamingMessageId(null);

    const currentActiveNodeId = activeNodeId;

    const tempUserMessage = {
      _id: `temp-user-${Date.now()}`,
      role: "user",
      content: text,
      parentId: currentActiveNodeId || null,
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setActiveNodeId(tempUserMessage._id);
    setIsAILoading(true);
    setError("");

    try {
      const data = await sendMessage(
        text,
        currentActiveNodeId,
        activeBranchId,
        activeConversationId
      );

      const assistantMessageId = data?.assistant?._id;

      setMessages((prev) => {
        const withoutTemp = prev.filter((msg) => msg._id !== tempUserMessage._id);
        return [
          ...withoutTemp,
          data.user,
          {
            ...data.assistant,
            content: "",
          },
        ];
      });
      setActiveNodeId(assistantMessageId);
      setIsAILoading(false);
      streamAssistantMessage(assistantMessageId, data.assistant.content);

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
            ? { ...conversation, lastMessageId: assistantMessageId }
            : conversation
        )
      );
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => msg._id !== tempUserMessage._id));
      clearStreamingTimer();
      setIsStreaming(false);
      setStreamingMessageId(null);
      setError(err.message || "Failed to send message");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (!activeConversationId) {
      return;
    }

    try {
      const result = await deleteBranch(branchId, activeConversationId);
      const deletedIdSet = new Set((result?.deletedIds || []).map((id) => String(id)));
      const remainingBranches = branches.filter(
        (branch) => !deletedIdSet.has(String(branch._id))
      );

      setBranches(remainingBranches);

      if (deletedIdSet.has(String(activeBranchId))) {
        if (remainingBranches.length > 0) {
          const nextActiveBranch = remainingBranches[remainingBranches.length - 1];
          setActiveBranchId(nextActiveBranch._id);
          setActiveNodeId(nextActiveBranch.lastMessageId || null);
        } else {
          setActiveBranchId(null);
          setActiveNodeId(messages.length > 0 ? messages[messages.length - 1]._id : null);
        }
      }

      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete branch");
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation(conversationId);
      const newConversations = conversations.filter(
        (c) => c._id !== conversationId
      );
      setConversations(newConversations);

      if (activeConversationId === conversationId) {
        if (newConversations.length > 0) {
          const deletedIndex = conversations.findIndex(
            (c) => c._id === conversationId
          );
          const newActiveIndex = Math.max(0, deletedIndex - 1);
          setActiveConversationId(newConversations[newActiveIndex]._id);
        } else {
          setActiveConversationId(null);
        }
      }
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete conversation");
    }
  };

  const handleUpdateConversation = (updated) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c))
    );
  };

  const handleUpdateBranch = (updated) => {
    setBranches((prev) =>
      prev.map((b) => (b._id === updated._id ? updated : b))
    );
  };

  const visibleMessages = activeNodeId ? getPath(messages, activeNodeId) : messages;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredMessages = normalizedSearchQuery
    ? visibleMessages.filter((msg) =>
        String(msg.content || "").toLowerCase().includes(normalizedSearchQuery)
      )
    : visibleMessages;

  return (
    <div className="app-shell">
      <Header
        user={user}
        onLogout={onLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={setSearchQuery}
        onSearchClear={() => setSearchQuery("")}
      />

      <div className="app-layout">
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelect={setActiveConversationId}
          onCreate={handleCreateConversation}
          onDeleteConversation={handleDeleteConversation}
          onUpdateConversation={handleUpdateConversation}
          style={{ width: "272px" }}
        />

        <div className="chat-main">
          <h2 className="conversation-title">
            {conversations.find((c) => c._id === activeConversationId)?.title || "Conversation"}
          </h2>
          {error ? <p className="chat-error">{error}</p> : null}

          <div className="message-list">
            {filteredMessages.map((msg) => (
              <Message
                key={msg._id}
                msg={msg}
                isActive={msg._id === activeNodeId}
                activeBranchId={activeBranchId}
                activeConversationId={activeConversationId}
                searchQuery={searchQuery}
                onBranchCreate={(branch) => {
                  setBranches((prev) => [...prev, branch]);
                }}
              />
            ))}
            {isAIloading ? (
              <div className="chat-loading"> 
                Loading respoinse...
              </div>
            ) : null}
            {normalizedSearchQuery && filteredMessages.length === 0 ? (
              <div className="chat-empty-state"> 
                No results found.
              </div>
            ) : null}
            {isStreaming && streamingMessageId ? (
              <div className="chat-typing"> 
                AI is typing...
              </div>
            ) : null}
          </div>
          
            <InputBox onSend={handleSend} />
          
        </div>

        <Sidebar
          branches={branches}
          onSelect={setActiveBranchId}
          activeBranchId={activeBranchId}
          onDeleteBranch={handleDeleteBranch}
            onUpdateBranch={handleUpdateBranch}
            activeConversationId={activeConversationId}
          style={{ width: "332px", overflowY: "hidden" }}
        />
      </div>
    </div>
  );
};

export default ChatWindow;