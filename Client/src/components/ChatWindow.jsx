import { useState } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import { sendMessage } from "../services/api";
import { getPath } from "../utils/getpath";
import { useEffect } from "react";
import { fetchMessages } from "../services/api";
import Sidebar from "./Sidebar";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [activeNodeId, setActiveNodeId] = useState(null);
  useEffect(() => {
  const loadMessages = async () => {
    const data = await fetchMessages();
    setMessages(data);

    if (data.length > 0) {
      setActiveNodeId(data[data.length - 1]._id);
    }
  };

  loadMessages();
}, []);

  const handleSend = async (text) => {
    const data = await sendMessage(text, activeNodeId);

    const newMessages = [
      ...messages,
      data.user,
      data.assistant,
    ];

    setMessages(newMessages);

    // move active node to latest AI message
    setActiveNodeId(data.assistant._id);
  };

const visibleMessages = activeNodeId
  ? getPath(messages, activeNodeId)
  : messages;

  return (
    <div style={{ padding: "20px" }}>
      <h2>ConceptTree Chat</h2>
    <Sidebar
        style={{ 
          float: "left" ,
          display: "flex",
          flexDirection: "row"
          }}
        messages={messages}
        onSelect={setActiveNodeId}
        activeNodeId={activeNodeId}
      />
    <div>
      {visibleMessages.map((msg) => (
        <Message
          key={msg._id}
          msg={msg}
          onSelect={setActiveNodeId}
          isActive={msg._id === activeNodeId}
        />
      ))}
    </div>

      <InputBox onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;