import { useEffect, useMemo, useRef, useState } from "react";
import SearchBar from "./SearchBar";

const Header = ({
  user,
  onLogout,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <h3 className="header-logo-wrap">
          <img
            className="header-logo"
            src="/QT%20icons/QT_logo.png"
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