const Message = ({ msg, onSelect, isActive }) => {
  return (
    <div
      onClick={() => onSelect(msg._id)}
      style={{
        margin: "10px 0",
        padding: "10px",
        border: isActive ? "2px solid blue" : "1px solid gray",
        cursor: "pointer",
      }}
    >
      <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
      <p>{msg.content}</p>

      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent parent click
          onSelect(msg._id);
        }}
      >
        New Branch
      </button>
    </div>
  );
};

export default Message;