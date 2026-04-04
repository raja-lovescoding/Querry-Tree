const Sidebar = ({ branches, onSelect, activeBranchId }) => {
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

  const renderNode = (node, level = 0) => (
    <div key={node._id}>
      <div
        onClick={() => onSelect(node._id)}
        style={{
          paddingLeft: `${level * 12}px`,
          cursor: "pointer",
          background:
            node._id === activeBranchId ? "#ddd" : "transparent",
        }}
      >
        {`Branch ${node._id.slice(-4)}`}
      </div>

      {node.children.length > 0 &&
        node.children.map((child) =>
          renderNode(child, level + 1)
        )}
    </div>
  );

  return (
    <div style={{ width: "250px", paddingLeft: "1px solid #ccc" }}>
      <h3>Branches</h3>
      {roots.map((root) => renderNode(root))}
    </div>
  );
};

export default Sidebar;