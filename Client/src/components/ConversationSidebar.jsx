import { useState } from "react";
import { updateConversationTitle } from "../services/api";

const ConversationSidebar = ({
  conversations,
  activeConversationId,
  onSelect,
  onCreate,
  onDeleteConversation,
  onUpdateConversation,
  style,
}) => {
  const [openMenuConversationId, setOpenMenuConversationId] = useState(null);
  const [renamingConversationId, setRenamingConversationId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const handleRenameClick = (conversation) => {
    setRenamingConversationId(conversation._id);
    setRenameValue(conversation.title || "New Chat");
  };

  const handleRenameSave = async (conversationId) => {
    if (!renameValue.trim()) {
      setRenamingConversationId(null);
      return;
    }
    try {
      const updated = await updateConversationTitle(conversationId, renameValue);
      if (onUpdateConversation) {
        onUpdateConversation(updated);
      }
      setRenamingConversationId(null);
      setOpenMenuConversationId(null);
    } catch (err) {
      alert(err.message || "Failed to rename conversation");
    }
  };

  const handleRenameKeyDown = (e, conversationId) => {
    if (e.key === "Enter") {
      handleRenameSave(conversationId);
    } else if (e.key === "Escape") {
      setRenamingConversationId(null);
    }
  };

  return (
    <div
      className="conversation-sidebar"
      style={{ ...style }}
    >
      <div className="sidebar-panel-header">
        <h3 className="sidebar-title">Chats</h3>
        <button
          onClick={onCreate}
          className="sidebar-add-button"
          aria-label="Create conversation"
        >
            <img className="qt-icon qt-icon--md" src="/QT%20icons/add.png" alt="" />
        </button>
      </div>

      {conversations.map((conversation) => (
        <div
          key={conversation._id}
          onClick={() => {
            if (renamingConversationId !== conversation._id) {
              onSelect(conversation._id);
            }
          }}
          className={`conversation-item ${openMenuConversationId === conversation._id ? "is-menu-open" : ""}`}
          data-active={conversation._id === activeConversationId ? "true" : "false"}
        >
          {renamingConversationId === conversation._id ? (
            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => handleRenameKeyDown(e, conversation._id)}
              onBlur={() => handleRenameSave(conversation._id)}
              onClick={(e) => e.stopPropagation()}
              className="inline-rename-input"
            />
          ) : (
            <span className="conversation-label">
              {conversation.title || "New Chat"}
            </span>
          )}
          <div className="conversation-actions">
            <button
              type="button"
              className="conversation-menu-trigger"
              aria-label="Conversation actions"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuConversationId((prev) =>
                  prev === conversation._id ? null : conversation._id
                );
              }}
            >
              <span className="menu-dot" />
              <span className="menu-dot" />
              <span className="menu-dot" />
            </button>

            {openMenuConversationId === conversation._id ? (
              <div className="actions-menu-card" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="conversation-rename menu-action-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameClick(conversation);
                  }}
                >
                    <img className="qt-icon qt-icon--sm" src="/QT%20icons/edit.png" alt="" />
                  Rename
                </button>
                <button
                  type="button"
                  className="conversation-delete menu-action-button action-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    const ok = window.confirm("Delete this conversation?");
                    if (!ok) {
                      return;
                    }
                    if (onDeleteConversation) {
                      onDeleteConversation(conversation._id);
                    }
                    setOpenMenuConversationId(null);
                  }}
                >
                    <img className="qt-icon qt-icon--sm" src="/QT%20icons/delete.png" alt="" />
                  Delete
                </button>
              </div>
            ) : null}
          </div>

        </div>
      ))}
    </div>
  );
};

export default ConversationSidebar;