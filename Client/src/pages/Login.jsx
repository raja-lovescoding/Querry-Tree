import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../auth/firebase";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError(err?.message || "Google sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Welcome back</h2>
        <p className="login-subtitle">Login with Google to access your chats.</p>

        <button className="google-login-button" onClick={handleGoogleLogin} disabled={isLoading}>
          {isLoading ? "Signing in..." : "Continue with Google"}
        </button>

        {error ? <p className="login-error">{error}</p> : null}
      </div>
    </div>
  );
};

export default Login;