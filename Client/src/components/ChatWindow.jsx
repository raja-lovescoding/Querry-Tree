import { useState } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import { fetchBranches, fetchMessages, sendMessage } from "../services/api";
import { getPath } from "../utils/getpath";
import { useEffect } from "react";
import Sidebar from "./Sidebar";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const [branchData, messageData] = await Promise.all([
        fetchBranches(),
        fetchMessages(),
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

      if (safeMessages.length > 0) {
        setActiveNodeId(safeMessages[safeMessages.length - 1]._id);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
  if (!activeBranchId) return;

  const branch = branches.find(b => b._id === activeBranchId);

  if (branch) {
    setActiveNodeId(branch.lastMessageId);
  }
}, [activeBranchId, branches]);

  const handleSend = async (text) => {
    const data = await sendMessage(text, activeNodeId, activeBranchId);

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
  };

  const visibleMessages = activeNodeId ? getPath(messages, activeNodeId) : messages;

  return (
  <div style={{ display: "flex" }}>
    
    

    <div style={{ flex: 1, padding: "20px" }}>
      <h2>ConceptTree Chat</h2>

      <div>
        {visibleMessages.map((msg) => (
          <Message
            key={msg._id}
            msg={msg}
            onSelect={setActiveNodeId}
            isActive={msg._id === activeNodeId}
            activeBranchId={activeBranchId}
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