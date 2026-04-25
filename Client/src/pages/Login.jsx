import { useState } from "react";
import {
  createUserWithEmailAndPassword,
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

    if (errorCode === "auth/email-already-in-use") {
      return "An account with this email already exists. Sign in instead.";
    }

    if (errorCode === "auth/weak-password") {
      return "Use a stronger password with at least 6 characters.";
    }

    if (errorCode === "auth/invalid-email") {
      return "Enter a valid email address.";
    }

    if (errorCode === "auth/user-not-found") {
      return "No account found for this email. Create one instead.";
    }

    if (errorCode === "auth/wrong-password") {
      return "Incorrect password. Try again.";
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

  const handleEmailSignup = async (event) => {
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
      await createUserWithEmailAndPassword(auth, email.trim(), password);
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
          <p className="login-subtitle">Use email or Google to get into your workspace</p>

          <button className="google-login-button" onClick={handleGoogleLogin} disabled={isLoading}>
            <span className="google-login-icon" aria-hidden="true">G</span>
            <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
          </button>

          <form onSubmit={handleEmailLogin} style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isLoading}
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.42)",
                background: "rgba(255,255,255,0.05)",
                color: "#000000",
                fontSize: "14px",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.4)";
                e.target.style.background = "rgba(255,255,255,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.2)";
                e.target.style.background = "rgba(255,255,255,0.05)";
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.49)",
                background: "rgba(255,255,255,0.05)",
                color: "#000000",
                fontSize: "14px",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.4)";
                e.target.style.background = "rgba(255,255,255,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.2)";
                e.target.style.background = "rgba(255,255,255,0.05)";
              }}
            />
            <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", marginTop: "6px" }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgb(255, 255, 255)",
                  color: "#080808",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: isLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.background = "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.15))")}
                onMouseLeave={(e) => !isLoading && (e.target.style.background = "rgb(255, 255, 255)")}
              >
                {isLoading ? "Please wait..." : "Sign in"}
              </button>

              <button
                type="button"
                onClick={handleEmailSignup}
                disabled={isLoading}
                style={{
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.25)",
                  background: "rgb(255, 255, 255)",
                  color: "#070707",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: isLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.background = "rgba(255,255,255,0.12)")}
                onMouseLeave={(e) => !isLoading && (e.target.style.background = "rgb(255, 255, 255)")}
              >
                {isLoading ? "Please wait..." : "Create account"}
              </button>
            </div>
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