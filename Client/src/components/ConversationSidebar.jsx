import { useEffect, useRef, useState } from "react";
import { updateConversationTitle } from "../services/api";
import ConfirmDialog from "./ConfirmDialog";
import { formatTimestampFull, formatTimestampShort } from "../utils/formatTimestamp";

const ConversationSidebar = ({
  conversations,
  activeConversationId,
  onSelect,
  onCreate,
  onDeleteConversation,
  onUpdateConversation,
  className,
  style,
}) => {
  const [openMenuConversationId, setOpenMenuConversationId] = useState(null);
  const [renamingConversationId, setRenamingConversationId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmConversation, setConfirmConversation] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!sidebarRef.current) return;
      if (!sidebarRef.current.contains(event.target)) {
        setOpenMenuConversationId(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenMenuConversationId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
      className={`conversation-sidebar ${className || ""}`.trim()}
      ref={sidebarRef}
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
        (() => {
          const rawTimestamp = conversation.updatedAt || conversation.createdAt;
          const timestamp = formatTimestampShort(rawTimestamp);
          const fullTimestamp = formatTimestampFull(rawTimestamp);

          return (
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
            {timestamp ? (
              <span className="item-timestamp" title={fullTimestamp || undefined}>
                {timestamp}
              </span>
            ) : null}
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
                    setConfirmConversation(conversation);
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
          );
        })()
      ))}

      <ConfirmDialog
        open={Boolean(confirmConversation)}
        title="Delete conversation"
        message="Are you sure you want to delete this conversation?"
        onCancel={() => setConfirmConversation(null)}
        onConfirm={() => {
          if (confirmConversation && onDeleteConversation) {
            onDeleteConversation(confirmConversation._id);
          }
          setConfirmConversation(null);
        }}
      />
    </div>
  );
};

export default ConversationSidebar;