import { useEffect, useState } from "react";
import { getRedirectResult, onAuthStateChanged, signOut } from "firebase/auth";
import ChatWindow from "./components/ChatWindow";
import Login from "./pages/Login";
import { auth } from "./auth/firebase";
import { clearAuthToken, setAuthToken } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (!auth) {
      setAuthReady(true);
      return undefined;
    }

    let unsubscribe = () => {};

    const initializeAuth = async () => {
      try {
        // Completes redirect login flow when popup fallback is used.
        await getRedirectResult(auth);
      } catch (_err) {
        // Errors are surfaced on the Login page; keep app responsive here.
      }

      if (!isActive) return;

      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!isActive) return;

        if (!currentUser) {
          clearAuthToken();
          setUser(null);
          setAuthReady(true);
          return;
        }

        try {
          const token = await currentUser.getIdToken();
          setAuthToken(token);
        } catch (_err) {
          clearAuthToken();
        }

        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName || "Google User",
          email: currentUser.email || "",
          photoURL: currentUser.photoURL || "",
        });
        setAuthReady(true);
      });
    };

    initializeAuth();

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    clearAuthToken();
  };

  if (!authReady) {
    return (
      <div className="skeleton-container" aria-busy="true" aria-live="polite">
        <header className="skeleton-header">
          <div className="skeleton-logo circle skeleton-block" />
          <div className="skeleton-search-bar skeleton-block" />
          <div className="skeleton-profile">
            <div className="skeleton-text small skeleton-block" style={{ width: "80px" }} />
            <div className="skeleton-avatar circle skeleton-block" />
          </div>
        </header>

        <div className="skeleton-main">
          <aside className="skeleton-sidebar">
            <div className="sidebar-header">
              <div className="skeleton-text skeleton-block" style={{ width: "40px" }} />
              <div className="skeleton-icon-btn skeleton-block" />
            </div>
            <div className="skeleton-list-item active skeleton-block" />
            <div className="skeleton-list-item skeleton-block" />
            <div className="skeleton-list-item skeleton-block" />
            <div className="skeleton-list-item skeleton-block" />
            <div className="skeleton-list-item skeleton-block" />
            <div className="skeleton-list-item skeleton-block" />
          </aside>

          <main className="skeleton-chat">
            <div className="skeleton-chat-title skeleton-block" />

            <div className="msg-row user">
              <div className="skeleton-bubble bubble-user skeleton-block" />
            </div>

            <div className="msg-row bot">
              <div className="skeleton-text skeleton-block" style={{ width: "30px", marginBottom: "10px" }} />
              <div className="skeleton-text skeleton-block" style={{ width: "60%" }} />
              <div className="skeleton-text skeleton-block" style={{ width: "40%" }} />
              <div className="skeleton-button skeleton-block" />
            </div>

            <div className="msg-row user">
              <div className="skeleton-bubble bubble-user skeleton-block" style={{ height: "60px" }} />
            </div>

            <div className="msg-row bot">
              <div className="skeleton-text skeleton-block" style={{ width: "30px" }} />
              <div className="skeleton-text skeleton-block" style={{ width: "80%" }} />
              <div className="skeleton-text bullet skeleton-block" />
              <div className="skeleton-text bullet skeleton-block" />
              <div className="skeleton-text bullet skeleton-block" />
            </div>

            <div className="skeleton-input-bar skeleton-block" />
          </main>

          <aside className="skeleton-right-panel">
            <div className="skeleton-text skeleton-block" style={{ width: "80px", marginBottom: "20px" }} />
            <div className="skeleton-tree-item skeleton-block" />
            <div className="skeleton-tree-item indent-1 skeleton-block" />
            <div className="skeleton-tree-item indent-2 skeleton-block" />
            <div className="skeleton-tree-item skeleton-block" />
            <div className="skeleton-tree-item indent-1 skeleton-block" />
          </aside>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <ChatWindow user={user} onLogout={handleLogout} />;
}

export default App;