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
  const [draftMessage, setDraftMessage] = useState("");
  const [isComposerDocked, setIsComposerDocked] = useState(false);
  const [recentBranchId, setRecentBranchId] = useState(null);
  const [isConversationSidebarOpen, setIsConversationSidebarOpen] = useState(false);
  const [isBranchSidebarOpen, setIsBranchSidebarOpen] = useState(false);
  const streamTimerRef = useRef(null);
  const recentBranchTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

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
      setIsComposerDocked(safeMessages.length > 0);

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
      if (recentBranchTimerRef.current) {
        clearTimeout(recentBranchTimerRef.current);
        recentBranchTimerRef.current = null;
      }
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

  useEffect(() => {
    setDraftMessage("");
    setIsComposerDocked(false);
  }, [activeConversationId]);

  useEffect(() => {
    const handleViewportChange = () => {
      if (window.innerWidth > 920) {
        setIsConversationSidebarOpen(false);
        setIsBranchSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleViewportChange);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    if (!messagesEndRef.current) return;

    messagesEndRef.current.scrollIntoView({
      behavior: isStreaming ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, isStreaming, activeConversationId, activeNodeId, streamingMessageId]);

  const handleCreateConversation = async () => {
    try {
      const conversation = await createConversation();
      if (!conversation?._id) {
        return;
      }

      setConversations((prev) => [conversation, ...prev]);
      setActiveConversationId(conversation._id);
      setIsComposerDocked(false);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to create conversation");
    }
  };

  const handleSelectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
    setIsConversationSidebarOpen(false);
  };

  const handleSelectBranch = (branchId) => {
    setActiveBranchId(branchId);
    setIsBranchSidebarOpen(false);
  };

  const handleToggleConversationSidebar = () => {
    setIsConversationSidebarOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsBranchSidebarOpen(false);
      }
      return next;
    });
  };

  const handleToggleBranchSidebar = () => {
    setIsBranchSidebarOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsConversationSidebarOpen(false);
      }
      return next;
    });
  };

  const closeMobileSidebars = () => {
    setIsConversationSidebarOpen(false);
    setIsBranchSidebarOpen(false);
  };

  const markRecentBranch = (branchId) => {
    if (recentBranchTimerRef.current) {
      clearTimeout(recentBranchTimerRef.current);
      recentBranchTimerRef.current = null;
    }

    setRecentBranchId(branchId);
    recentBranchTimerRef.current = setTimeout(() => {
      setRecentBranchId(null);
      recentBranchTimerRef.current = null;
    }, 650);
  };

  const streamAssistantMessage = (assistantMessageId, fullText) => {
    clearStreamingTimer();

    const text = typeof fullText === "string" ? fullText : "";
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    let index = 0;

    setIsStreaming(true);
    setStreamingMessageId(assistantMessageId);

    if (words.length === 0) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === assistantMessageId ? { ...msg, content: text } : msg
        )
      );
      setIsStreaming(false);
      setStreamingMessageId(null);
      return;
    }

    streamTimerRef.current = setInterval(() => {
      index = Math.min(index + 1, words.length);
      const nextText = words.slice(0, index).join(" ");

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === assistantMessageId ? { ...msg, content: nextText } : msg
        )
      );

      if (index >= words.length) {
        clearStreamingTimer();
        setIsStreaming(false);
        setStreamingMessageId(null);
      }
    }, 18);
  };

  const handleSend = async (text) => {
    if (!activeConversationId) {
      return;
    }

    setDraftMessage("");

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
        markRecentBranch(data.branch._id);
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
  const isConversationEmpty = filteredMessages.length === 0 && !normalizedSearchQuery;
  const showCenteredComposer = isConversationEmpty && !isComposerDocked;

  return (
    <div className="app-shell">
      <Header
        user={user}
        onLogout={onLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={setSearchQuery}
        onSearchClear={() => setSearchQuery("")}
        onToggleConversationSidebar={handleToggleConversationSidebar}
        onToggleBranchSidebar={handleToggleBranchSidebar}
        isConversationSidebarOpen={isConversationSidebarOpen}
        isBranchSidebarOpen={isBranchSidebarOpen}
      />

      <div className="app-layout">
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelect={handleSelectConversation}
          onCreate={handleCreateConversation}
          onDeleteConversation={handleDeleteConversation}
          onUpdateConversation={handleUpdateConversation}
          className={isConversationSidebarOpen ? "is-mobile-open" : ""}
          style={{ width: "272px" }}
        />

        <div className="chat-main">
          <h2 className="conversation-title">
            {conversations.find((c) => c._id === activeConversationId)?.title || "Conversation"}
          </h2>
          {error ? <p className="chat-error">{error}</p> : null}

          <div className={`message-list ${showCenteredComposer ? "" : "message-list--with-composer"}`}>
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
                  markRecentBranch(branch._id);
                  setActiveBranchId(branch._id);
                  setActiveNodeId(branch.lastMessageId || msg._id);
                }}
              />
            ))}
            {isAIloading ? (
              <div
                className="chat-loading chat-loading--dots"
                aria-label="AI is loading"
                aria-live="polite"
              >
                <span className="chat-loading-dot" />
                <span className="chat-loading-dot" />
                <span className="chat-loading-dot" />
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
            <div ref={messagesEndRef} />
          </div>

          <div className={`composer-stage ${showCenteredComposer ? "composer-stage--centered" : "composer-stage--docked"}`}>
            <div className={`composer-empty-copy ${showCenteredComposer ? "is-visible" : ""}`}>
              What do you want to learn today?
            </div>
            <div className="composer-shell">
              <InputBox
                value={draftMessage}
                onChange={setDraftMessage}
                onSend={handleSend}
                onSendButton={() => setIsComposerDocked(true)}
              />
            </div>
          </div>

        </div>

        {(isConversationSidebarOpen || isBranchSidebarOpen) ? (
          <button
            type="button"
            className="mobile-sidebar-overlay"
            aria-label="Close sidebars"
            onClick={closeMobileSidebars}
          />
        ) : null}

        <Sidebar
          branches={branches}
          onSelect={handleSelectBranch}
          activeBranchId={activeBranchId}
          recentBranchId={recentBranchId}
          onDeleteBranch={handleDeleteBranch}
            onUpdateBranch={handleUpdateBranch}
            activeConversationId={activeConversationId}
          className={isBranchSidebarOpen ? "is-mobile-open" : ""}
          style={{ width: "332px", overflowY: "hidden" }}
        />
      </div>
    </div>
  );
};

export default ChatWindow;