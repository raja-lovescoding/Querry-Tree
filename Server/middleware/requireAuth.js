import { getFirebaseAdminAuth } from "../config/firebaseAdmin.js";

export const requireAuth = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization || "";
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  const adminAuth = getFirebaseAdminAuth();

  if (!adminAuth) {
    return res.status(500).json({ error: "Firebase admin is not configured on the server" });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || decodedToken.displayName || "",
      picture: decodedToken.picture || "",
    };
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid or expired authorization token" });
  }
};