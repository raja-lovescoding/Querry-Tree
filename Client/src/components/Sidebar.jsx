import { useEffect, useRef, useState } from "react";
import { updateBranchTitle } from "../services/api";
import ConfirmDialog from "./ConfirmDialog";
import { formatTimestampFull, formatTimestampShort } from "../utils/formatTimestamp";

const Sidebar = ({ branches, onSelect, activeBranchId, recentBranchId, onDeleteBranch, onUpdateBranch, activeConversationId, className, style }) => {
  const [openMenuBranchId, setOpenMenuBranchId] = useState(null);
  const [renamingBranchId, setRenamingBranchId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmBranch, setConfirmBranch] = useState(null);
  const [collapsedBranchIds, setCollapsedBranchIds] = useState({});
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!sidebarRef.current) return;
      if (!sidebarRef.current.contains(event.target)) {
        setOpenMenuBranchId(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenMenuBranchId(null);
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

  const toggleBranchCollapse = (branchId) => {
    setCollapsedBranchIds((prev) => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
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
    (() => {
      const rawTimestamp = node.updatedAt || node.createdAt;
      const timestamp = formatTimestampShort(rawTimestamp);
      const fullTimestamp = formatTimestampFull(rawTimestamp);
      const hasChildren = node.children.length > 0;
      const isCollapsed = Boolean(collapsedBranchIds[node._id]);

      return (
    <div
      key={node._id}
      className={`branch-node ${level === 1 ? "branch-node--root" : ""} ${isLast ? "branch-node--last" : ""} ${node._id === recentBranchId ? "branch-node--recent" : ""}`}
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
        {hasChildren ? (
          <button
            type="button"
            className="branch-collapse-toggle"
            aria-label={isCollapsed ? "Expand branch" : "Collapse branch"}
            aria-expanded={!isCollapsed}
            onClick={(e) => {
              e.stopPropagation();
              toggleBranchCollapse(node._id);
            }}
          >
            <span className="branch-collapse-icon" aria-hidden="true">▾</span>
          </button>
        ) : (
          <span className="branch-collapse-spacer" aria-hidden="true" />
        )}

        {renamingBranchId === node._id ? (
          <input
            autoFocus
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => handleRenameKeyDown(e, node._id)}
            onBlur={() => handleRenameSave(node._id)}
            onClick={(e) => e.stopPropagation()}
            className="inline-rename-input"
          />
        ) : (
          <span className="branch-title">{node.title || `Branch ${node._id.slice(-4)}`}</span>
        )}
        <div className="branch-actions">
          {timestamp ? (
            <span className="item-timestamp" title={fullTimestamp || undefined}>
              {timestamp}
            </span>
          ) : null}
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
              >
                <img className="qt-icon qt-icon--sm" src="/QT%20icons/edit.png" alt="" />
                Rename
              </button>
              <button
                type="button"
                className="branch-delete menu-action-button action-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmBranch(node);
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

      {hasChildren ? (
        <div className={`branch-children ${isCollapsed ? "is-collapsed" : ""}`}>
          <div className="branch-children-inner">
            {node.children.map((child, index) =>
              renderNode(child, level + 1, index === node.children.length - 1)
            )}
          </div>
        </div>
      ) : null}
    </div>
      );
    })()
  );

  return (
    <div
      className={`branch-sidebar ${className || ""}`.trim()}
      ref={sidebarRef}
      style={{
        ...style,
      }}
    >
      <h3 className="icon-label">
        <img className="qt-icon qt-icon--md" src="/QT%20icons/branch.png" alt="" />
        Branches
      </h3>
      {roots.map((root, index) => renderNode(root, 1, index === roots.length - 1))}

      <ConfirmDialog
        open={Boolean(confirmBranch)}
        title="Delete branch"
        message="Delete this branch and all child branches?"
        onCancel={() => setConfirmBranch(null)}
        onConfirm={() => {
          if (confirmBranch && onDeleteBranch) {
            onDeleteBranch(confirmBranch._id);
          }
          setConfirmBranch(null);
        }}
      />
    </div>
  );
};

export default Sidebar;