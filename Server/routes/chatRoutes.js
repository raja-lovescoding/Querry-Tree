import express from "express";
import { createMessage } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", createMessage);

export default router;