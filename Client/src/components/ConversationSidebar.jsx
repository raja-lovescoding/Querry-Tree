const ConversationSidebar = ({
  conversations,
  activeConversationId,
  onSelect,
  onCreate,
}) => {
  return (
    <div
      style={{
        width: "240px",
        borderRight: "1px solid #ccc",
        padding: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <h3 style={{ margin: 0 }}>Chats</h3>
        <button onClick={onCreate}>+ New Chat</button>
      </div>

      {conversations.map((conversation) => (
        <div
          key={conversation._id}
          onClick={() => onSelect(conversation._id)}
          style={{
            padding: "8px",
            cursor: "pointer",
            borderRadius: "6px",
            background:
              conversation._id === activeConversationId ? "#e9edf8" : "transparent",
            marginBottom: "4px",
          }}
        >
          {conversation.title || "New Chat"}
        </div>
      ))}
    </div>
  );
};

export default ConversationSidebar;