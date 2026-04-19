import { useState } from "react";

const InputBox = ({ onSend }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
    console.log("Sending:", input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="Input-box" >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="Input-box-field"
      />
      <button onClick={handleSend} className="Send-message">
        <img className="qt-icon qt-icon--sm" src="/QT%20icons/send.png" alt="" 
          className="send-icon"
        />
      </button>
    </div>
  );
};

export default InputBox;