import { useState } from "react";
import Message from "./Message";
import InputBox from "./InputBox";
import { sendMessage } from "../services/api";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [lastId, setLastId] = useState(null);

  const handleSend = async (text) => {
    const data = await sendMessage(text, lastId);

    const newMessages = [
      ...messages,
      data.user,
      data.assistant,
    ];

    setMessages(newMessages);
    setLastId(data.assistant._id);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>ConceptTree Chat</h2>

      <div>
        {messages.map((msg) => (
          <Message key={msg._id} msg={msg} />
        ))}
      </div>

      <InputBox onSend={handleSend} />
    </div> 
  );
};

export default ChatWindow;