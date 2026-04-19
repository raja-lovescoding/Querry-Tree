import { useState } from "react";
import { updateBranchTitle } from "../services/api";

const Sidebar = ({ branches, onSelect, activeBranchId, onDeleteBranch, onUpdateBranch, activeConversationId, style }) => {
  const [openMenuBranchId, setOpenMenuBranchId] = useState(null);
  const [renamingBranchId, setRenamingBranchId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const handleRenameClick = (branch) => {
    setRenamingBranchId(branch._id);
    setRenameValue(branch.title || `Branch ${branch._id.slice(-4)}`);
  };

  const handleRenameSave = async (branchId) => {
    if (!renameValue.trim()) {
      setRenamingBranchId(null);
      return;
    }
    try {
      const updated = await updateBranchTitle(branchId, renameValue, activeConversationId);
      if (onUpdateBranch) {
        onUpdateBranch(updated);
      }
      setRenamingBranchId(null);
      setOpenMenuBranchId(null);
    } catch (err) {
      alert(err.message || "Failed to rename branch");
    }
  };

  const handleRenameKeyDown = (e, branchId) => {
    if (e.key === "Enter") {
      handleRenameSave(branchId);
    } else if (e.key === "Escape") {
      setRenamingBranchId(null);
    }
  };

  const map = {};
  const roots = [];

  branches.forEach((b) => {
    map[b._id] = { ...b, children: [] };
  });

  branches.forEach((b) => {
    if (b.parentBranchId) {
      map[b.parentBranchId]?.children.push(map[b._id]);
    } else {
      roots.push(map[b._id]);
    }
  });

  const renderNode = (node, level = 1, isLast = false) => (
    <div
      key={node._id}
      className={`branch-node ${level === 1 ? "branch-node--root" : ""} ${isLast ? "branch-node--last" : ""}`}
      style={{ "--branch-level": level }}
    >
      <div
        onClick={() => {
          if (renamingBranchId !== node._id) {
            onSelect(node._id);
          }
        }}
        className={`branch-item ${node._id === activeBranchId ? "is-active" : ""} ${openMenuBranchId === node._id ? "is-menu-open" : ""}`}
      >
        {renamingBranchId === node._id ? (
          <input
            autoFocus
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => handleRenameKeyDown(e, node._id)}
            onBlur={() => handleRenameSave(node._id)}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              padding: "4px 6px",
              border: "1px solid #2563eb",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        ) : (
          <span className="branch-title">{node.title || `Branch ${node._id.slice(-4)}`}</span>
        )}
        <div className="branch-actions">
          <button
            type="button"
            className="branch-menu-trigger"
            aria-label="Branch actions"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuBranchId((prev) => (prev === node._id ? null : node._id));
            }}
          >
            <span className="menu-dot" />
            <span className="menu-dot" />
            <span className="menu-dot" />
          </button>

          {openMenuBranchId === node._id ? (
            <div className="actions-menu-card" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="menu-action-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameClick(node);
                }}
                style={{
                  display: "inline-flex",
                  border: "none",
                  background: "#e0f2fe",
                  color: "#0369a1",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  marginBottom: "6px",
                  fontSize: "12px",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <img className="qt-icon qt-icon--sm" src="/QT%20icons/edit.png" alt="" />
                Rename
              </button>
              <button
                type="button"
                className="branch-delete menu-action-button action-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  const ok = window.confirm("Delete this branch and its child branches?");
                  if (!ok) return;
                  if (onDeleteBranch) {
                    onDeleteBranch(node._id);
                  }
                  setOpenMenuBranchId(null);
                }}
              >
                <img className="qt-icon qt-icon--sm" src="/QT%20icons/delete.png" alt="" />
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {node.children.length > 0 ? (
        <div className="branch-children">
          {node.children.map((child, index) =>
            renderNode(child, level + 1, index === node.children.length - 1)
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className="branch-sidebar"
      style={{
        ...style,
      }}
    >
      <h3 className="icon-label">
        <img className="qt-icon qt-icon--md" src="/QT%20icons/branch.png" alt="" />
        Branches
      </h3>
      {roots.map((root, index) => renderNode(root, 1, index === roots.length - 1))}
    </div>
  );
};

export default Sidebar;