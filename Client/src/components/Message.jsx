import { createBranch } from "../services/api";
import katex from "katex";
import "katex/dist/katex.min.css";

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

const renderMathEquation = (equation, isBlock = false, keyPrefix) => {
  try {
    const html = katex.renderToString(equation, {
      throwOnError: false,
      displayMode: isBlock,
    });
    return (
      <span
        key={keyPrefix}
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          display: isBlock ? "block" : "inline",
          margin: isBlock ? "8px 0" : "0 2px",
          overflow: "auto",
        }}
      />
    );
  } catch (e) {
    // Fallback for invalid equations
    return (
      <span key={keyPrefix} style={{ color: "#ef4444" }}>
        [Invalid equation]
      </span>
    );
  }
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
  
  // Split by both inline math ($...$) and bold (**...**)
  // First, protect inline math from being split
  const mathPattern = /\$([^\$\n]+)\$/g;
  const mathMatches = [];
  let textWithPlaceholders = value;
  
  let match;
  let mathIndex = 0;
  while ((match = mathPattern.exec(value)) !== null) {
    mathMatches.push(match[1]);
    textWithPlaceholders = textWithPlaceholders.replace(match[0], `__MATH_${mathIndex}__`);
    mathIndex++;
  }
  
  // Now split by bold
  const parts = textWithPlaceholders.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, idx) => {
    // Restore math placeholders
    let restoredPart = part;
    mathMatches.forEach((mathExpr, i) => {
      restoredPart = restoredPart.replace(`__MATH_${i}__`, `$${mathExpr}$`);
    });
    
    const boldMatch = restoredPart.match(/^\*\*([^*]+)\*\*$/);
    
    if (boldMatch) {
      return (
        <strong key={`${keyPrefix}-b-${idx}`}>
          {renderInlineMarkdown(boldMatch[1], `${keyPrefix}-b-${idx}`, searchQuery)}
        </strong>
      );
    }
    
    // Check if this part contains math
    const mathInline = restoredPart.match(/\$([^\$\n]+)\$/g);
    if (mathInline && mathInline.length > 0) {
      // Split and render with math
      const subParts = restoredPart.split(/(\$[^\$\n]+\$)/g);
      return (
        <span key={`${keyPrefix}-t-${idx}`}>
          {subParts.map((subPart, subIdx) => {
            const mathMatch = subPart.match(/^\$([^\$\n]+)\$$/);
            if (mathMatch) {
              return renderMathEquation(mathMatch[1], false, `${keyPrefix}-m-${idx}-${subIdx}`);
            }
            return renderHighlightedText(subPart, searchQuery, `${keyPrefix}-t-${idx}-${subIdx}`);
          })}
        </span>
      );
    }
    
    return (
      <span key={`${keyPrefix}-t-${idx}`}>
        {renderHighlightedText(restoredPart, searchQuery, `${keyPrefix}-t-${idx}`)}
      </span>
    );
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
  let i = 0;

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

  while (i < lines.length) {
    const line = lines[i];

    // Check for block equation start ($$)
    if (line.trim().startsWith("$$")) {
      flushBullets();
      
      // Collect all lines until closing $$
      const equationLines = [line.substring(line.indexOf("$$") + 2)];
      i++;
      
      while (i < lines.length) {
        const currentLine = lines[i];
        if (currentLine.trim().includes("$$")) {
          const endIdx = currentLine.indexOf("$$");
          equationLines.push(currentLine.substring(0, endIdx));
          break;
        }
        equationLines.push(currentLine);
        i++;
      }
      
      const equation = equationLines.join("\n").trim();
      if (equation) {
        nodes.push(renderMathEquation(equation, true, `math-${nodes.length}`));
      }
      i++;
      continue;
    }

    const bulletMatch = line.match(/^\s*[-*]\s+(.*)$/);

    if (bulletMatch) {
      bulletBuffer.push(bulletMatch[1]);
      i++;
      continue;
    }

    flushBullets();

    if (!line.trim()) {
      nodes.push(<div key={`sp-${nodes.length}`} style={{ height: "8px" }} />);
      i++;
      continue;
    }

    const headingNode = renderHeadingLine(line.trim(), `h-${nodes.length}`, searchQuery);

    if (headingNode) {
      nodes.push(headingNode);
      i++;
      continue;
    }

    nodes.push(
      <p key={`p-${nodes.length}`} style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>
        {renderInlineMarkdown(line, `p-${nodes.length}`, searchQuery)}
      </p>
    );
    i++;
  }

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
      <strong className="message-role-label">{isUserMessage ? "You" : ""}</strong>
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