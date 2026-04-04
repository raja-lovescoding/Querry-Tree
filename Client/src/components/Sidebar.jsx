import { getBranches } from "../utils/getBranches";

const Sidebar = ({ messages, onSelect, activeNodeId }) => {
  const branches = getBranches(messages);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "220px",
        borderRight: "1px solid #ccc",
        padding: "10px",
      }}
    >
      <h3>Branches</h3>

      {branches.map((branch, index) => (
        <div
          key={branch._id}
          onClick={() => onSelect(branch._id)}
          style={{
            padding: "8px",
            marginBottom: "5px",
            cursor: "pointer",
            background:
              branch._id === activeNodeId ? "#ddd" : "transparent",
            borderRadius: "4px",
          }}
        >
          {index === 0 ? "Main" : `Branch ${index}`}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;