import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../auth/firebase";

const Login = ({ startupError = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mapAuthErrorToMessage = (err) => {
    const errorCode = err?.code || "";

    if (errorCode === "auth/unauthorized-domain") {
      return "This domain is not authorized in Firebase. Add your Vercel domain in Firebase Auth > Settings > Authorized domains.";
    }

    if (errorCode === "auth/popup-blocked") {
      return "Popup was blocked by your browser. Redirect login will be used instead.";
    }

    if (errorCode === "auth/popup-closed-by-user") {
      return "The Google sign-in popup was closed before completion. Try again.";
    }

    if (errorCode === "auth/operation-not-allowed") {
      return "Google sign-in is disabled in Firebase Authentication. Enable Google provider and try again.";
    }

    return err?.message || "Google sign-in failed.";
  };

  const handleGoogleLogin = async () => {
    setError("");

    if (!isFirebaseConfigured) {
      setError("Add your Firebase env values in the Client .env file, then restart Vite.");
      return;
    }

    if (!auth) {
      setError("Firebase auth is not ready yet. Check your env values and restart the app.");
      return;
    }

    try {
      setIsLoading(true);

      const isDeployedHost = typeof window !== "undefined" &&
        (window.location.hostname.includes("vercel.app") ||
          window.location.hostname !== "localhost");

      // Redirect flow is more reliable on many hosted domains and strict popup policies.
      if (isDeployedHost) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const errorCode = err?.code || "";

      if (errorCode === "auth/popup-blocked") {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      setError(mapAuthErrorToMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!isFirebaseConfigured) {
      setError("Add your Firebase env values in the Client .env file, then restart Vite.");
      return;
    }

    if (!auth) {
      setError("Firebase auth is not ready yet. Check your env values and restart the app.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(mapAuthErrorToMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-video-shell" aria-hidden="true">
        <video className="login-video" autoPlay muted loop playsInline>
          <source src="/login-bg.mp4" type="video/mp4" />
        </video>
        <div className="login-video-overlay" />
      </div>

      <div className="login-content">
        <div className="login-card">
          <div className="login-brand-row">
            <img className="login-brand-logo" src="/QT%20icons/arbor_logo.png" alt="" />
            <span className="login-brand-name">Arbor</span>
          </div>

          <h2 className="login-title">Welcome to Arbor</h2>
          <p className="login-subtitle">Sign in with Google to start building your tree</p>

          <button className="google-login-button" onClick={handleGoogleLogin} disabled={isLoading}>
            <span className="google-login-icon" aria-hidden="true">G</span>
            <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
          </button>

          <form onSubmit={handleEmailLogin} style={{ marginTop: "14px", display: "grid", gap: "8px" }}>
            <input
              type="email"
              placeholder="Debug email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isLoading}
              style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.26)", background: "rgba(8,8,8,0.28)", color: "#fff" }}
            />
            <input
              type="password"
              placeholder="Debug password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
              style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.26)", background: "rgba(8,8,8,0.28)", color: "#fff" }}
            />
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.24)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {isLoading ? "Signing in..." : "Sign in with Email (debug)"}
            </button>
          </form>

          {startupError ? <p className="login-error">{startupError}</p> : null}
          {error ? <p className="login-error">{error}</p> : null}

          <p className="login-video-note"></p>
        </div>
      </div>
    </div>
  );
};

export default Login;