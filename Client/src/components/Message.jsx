const Message = ({ msg }) => {
  return (
    <div style={{ margin: "10px 0" }}>
      <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
      <p>{msg.content}</p>
    </div>
  );
};

export default Message;