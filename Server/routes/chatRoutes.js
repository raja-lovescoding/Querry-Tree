import express from "express";
import { createMessage, getMessages } from "../controllers/chatController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getMessages);
router.post("/", createMessage);

export default router;