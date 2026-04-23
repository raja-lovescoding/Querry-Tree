import { useEffect, useMemo, useRef, useState } from "react";
import SearchBar from "./SearchBar";

const Header = ({
  user,
  onLogout,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  isBeigeTheme,
  onToggleTheme,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const menuRef = useRef(null);
  const helpRef = useRef(null);

  const userInitials = useMemo(() => {
    if (!user) return "U";
    const source = (user.displayName || user.email || "User").trim();
    const parts = source.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }

      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setIsHelpOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsHelpOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <h3 className="header-logo-wrap">
          <img
            className="header-logo"
            src="/QT%20icons/arbor_logo.png"
            alt=""
          />
        </h3>
      </div>
      <div className="header-center">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          onClear={onSearchClear}
        />
      </div>
      <div className="header-right">
        <div className="header-help-wrap" ref={helpRef}>
          <button
            type="button"
            className="header-help-trigger"
            aria-label="About Concept Tree"
            aria-expanded={isHelpOpen}
            aria-controls="header-help-tooltip"
            onClick={() => setIsHelpOpen((prev) => !prev)}
          >
            ?
          </button>
          <div
            id="header-help-tooltip"
            className={`header-help-tooltip ${isHelpOpen ? "is-open" : ""}`}
            role="tooltip"
          >
            <h4 className="header-help-title">What is Arbor?</h4>
            <p className="header-help-text">
              Arbor helps you explore ideas by branching conversations instead of following a
              single linear chat.
            </p>

            <div className="header-help-divider" />

            <h5 className="header-help-subtitle">How to use it</h5>
            <ol className="header-help-list">
              <li>
                <strong>Start a conversation</strong>
                <span>Click New Chat and type your question or idea.</span>
              </li>
              <li>
                <strong>Continue normally</strong>
                <span>Chat with Arbor like any other chat app.</span>
              </li>
              <li>
                <strong>Create branches</strong>
                <span>Click New Branch on any message to explore a different direction from that point.</span>
              </li>
              <li>
                <strong>Switch between branches</strong>
                <span>Use the Branches panel on the right to navigate different paths.</span>
              </li>
              <li>
                <strong>Organize conversations</strong>
                <span>Use the left sidebar to switch between chats.</span>
              </li>
              <li>
                <strong>Save important insights</strong>
                <span>Select messages and save them as notes for later (if notes are enabled).</span>
              </li>
            </ol>

            <div className="header-help-divider" />

            <h5 className="header-help-subtitle">Why use Arbor?</h5>
            <ul className="header-help-bullets">
              <li>Explore multiple approaches to the same problem</li>
              <li>Keep your thinking structured</li>
              <li>Avoid losing context when trying different ideas</li>
            </ul>

            <div className="header-help-divider" />

            <h5 className="header-help-subtitle">Tip</h5>
            <p className="header-help-text header-help-text--tip">
              Think of each branch as a different way of thinking about the same problem.
            </p>
          </div>
        </div>

        {user ? (
          <div className="header-user-menu" ref={menuRef}>
            <button
              type="button"
              className="header-user-trigger"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Open user menu"
            >
              <span className="header-user-avatar">
                <img className="qt-icon qt-icon--avatar" src="/QT%20icons/default_user.png" alt="" />
              </span>
              <span className="header-user-name">{user.displayName || user.email}</span>
            </button>

            <div className={`header-dropdown ${isMenuOpen ? "is-open" : ""}`}>
              <button type="button" className="header-dropdown-item" disabled>
                <img className="qt-icon qt-icon--sm" src="/QT%20icons/setting.png" alt="" />
                Settings
              </button>
              <button type="button" className="header-dropdown-item" disabled>
                <img className="qt-icon qt-icon--sm" src="/QT%20icons/notification.png" alt="" />
                Contact Us
              </button>
              <button
                type="button"
                className="header-dropdown-item header-dropdown-item--danger"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <button className="header-auth-button">
            Login/Signup
          </button>
        )}
      </div>
    </header>
  );
};


export default Header;