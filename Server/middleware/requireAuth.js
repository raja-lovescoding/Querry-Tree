import { getFirebaseAdminAuth } from "../config/firebaseAdmin.js";
import User from "../models/User.js";

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

    try {
      await User.findOneAndUpdate(
        { firebaseUid: decodedToken.uid },
        {
          $set: {
            email: decodedToken.email || "",
            displayName: decodedToken.name || decodedToken.displayName || "",
            photoURL: decodedToken.picture || "",
            lastSeenAt: new Date(),
          },
          $setOnInsert: {
            firebaseUid: decodedToken.uid,
          },
        },
        {
          new: true,
          upsert: true,
        }
      );
    } catch (syncError) {
      console.error("Failed to sync user record:", syncError);
    }

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