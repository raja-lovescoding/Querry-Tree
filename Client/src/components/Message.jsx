import { createBranch } from "../services/api";

const Message = ({
  msg,
  onSelect,
  isActive,
  activeBranchId,
  activeConversationId,
  onBranchCreate,
}) => {
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
        onClick={async (e) => {
          e.stopPropagation();
          const newBranch = await createBranch(
            activeBranchId || null,
            msg._id,
            activeConversationId
          );

          if (onBranchCreate) {
            onBranchCreate(newBranch); // pass up
          }
        }}
      >
        New Branch
      </button>
    </div>
  );
};
export default Message;