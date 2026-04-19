import { createBranch } from "../services/api";

const escapeRegExp = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildHighlightRegex = (query) => {
  const tokens = String(query || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp)
    .sort((a, b) => b.length - a.length);

  if (tokens.length === 0) {
    return null;
  }

  return new RegExp(`(${tokens.join("|")})`, "gi");
};

const renderHighlightedText = (text, query, keyPrefix, baseKey = "t") => {
  const value = String(text || "");
  const regex = buildHighlightRegex(query);

  if (!regex) {
    return value;
  }

  const segments = value.split(regex);

  return segments.map((segment, idx) => {
    if (!segment) {
      return null;
    }

    const isMatch = regex.test(segment);
    regex.lastIndex = 0;

    if (isMatch) {
      return (
        <mark
          key={`${keyPrefix}-${baseKey}-${idx}`}
          style={{
            background: "#fde68a",
            color: "inherit",
            padding: "0 2px",
            borderRadius: "3px",
          }}
        >
          {segment}
        </mark>
      );
    }

    return <span key={`${keyPrefix}-${baseKey}-${idx}`}>{segment}</span>;
  });
};

const renderInlineMarkdown = (text, keyPrefix, searchQuery) => {
  const value = String(text || "");
  const parts = value.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, idx) => {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);

    if (boldMatch) {
      return <strong key={`${keyPrefix}-b-${idx}`}>{renderHighlightedText(boldMatch[1], searchQuery, `${keyPrefix}-b-${idx}`)}</strong>;
    }

    return <span key={`${keyPrefix}-t-${idx}`}>{renderHighlightedText(part, searchQuery, `${keyPrefix}-t-${idx}`)}</span>;
  });
};

const renderHeadingLine = (line, key, searchQuery) => {
  const match = line.match(/^(#{1,6})\s+(.*)$/);

  if (!match) {
    return null;
  }

  const level = match[1].length;
  const text = match[2];
  const fontSizeMap = {
    1: "1.55rem",
    2: "1.35rem",
    3: "1.2rem",
    4: "1.1rem",
    5: "1rem",
    6: "0.95rem",
  };

  return (
    <div
      key={key}
      style={{
        margin: "4px 0 8px",
        fontWeight: 700,
        fontSize: fontSizeMap[level],
        lineHeight: 1.35,
      }}
    >
      {renderInlineMarkdown(text, key, searchQuery)}
    </div>
  );
};

const renderPlainTextBlock = (text, searchQuery) => {
  const lines = String(text || "").split("\n");
  const nodes = [];
  let bulletBuffer = [];

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} style={{ margin: "6px 0 10px", paddingLeft: "20px" }}>
        {bulletBuffer.map((item, idx) => (
          <li key={`li-${idx}`} style={{ marginBottom: "4px" }}>
            {renderInlineMarkdown(item, `li-${idx}`, searchQuery)}
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((line) => {
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);

    if (bulletMatch) {
      bulletBuffer.push(bulletMatch[1]);
      return;
    }

    flushBullets();

    if (!line.trim()) {
      nodes.push(<div key={`sp-${nodes.length}`} style={{ height: "8px" }} />);
      return;
    }

    const headingNode = renderHeadingLine(line.trim(), `h-${nodes.length}`, searchQuery);

    if (headingNode) {
      nodes.push(headingNode);
      return;
    }

    nodes.push(
      <p key={`p-${nodes.length}`} style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>
        {renderInlineMarkdown(line, `p-${nodes.length}`, searchQuery)}
      </p>
    );
  });

  flushBullets();
  return nodes;
};

const renderFormattedContent = (content, searchQuery) => {
  const parts = String(content || "").split(/```/);

  return parts.map((part, idx) => {
    const isCode = idx % 2 === 1;

    if (isCode) {
      return (
        <pre
          key={`code-${idx}`}
          style={{
            margin: "8px 0 10px",
            padding: "10px",
            background: "#0f172a",
            color: "#e2e8f0",
            borderRadius: "8px",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          <code>{renderHighlightedText(part.trim(), searchQuery, `code-${idx}`)}</code>
        </pre>
      );
    }

    return <div key={`txt-${idx}`}>{renderPlainTextBlock(part, searchQuery)}</div>;
  });
};

const Message = ({
  msg,
  isActive,
  activeBranchId,
  activeConversationId,
  onBranchCreate,
  searchQuery,
}) => {
  const isUserMessage = msg.role === "user";

  return (
    <div
      className={`message-card ${isUserMessage ? "message-card--user" : "message-card--assistant"} ${isActive ? "message-card--active" : ""}`}
    >
      <strong className="message-role-label">{isUserMessage ? "You" : "QT"}:</strong>
      <div className="message-content">
        {renderFormattedContent(msg.content, searchQuery)}
      </div>

      {!isUserMessage ? (
        <button
          type="button"
          className="message-branch-button"
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
          <img className="qt-icon qt-icon--sm" src="/QT%20icons/branch.png" alt="" /> New Branch
        </button>
      ) : null}
    </div>
  );
};
export default Message;