import dotenv from "dotenv";
import connectDB from "./config/db.js";
import express from "express";
import chatRoutes from "./routes/chatRoutes.js";
import cors from "cors";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/test", (_req, res) => {
  res.send("server is running");
});

app.use("/api/chat", chatRoutes);
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

connectDB();
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});


app.use("/chat", chatRoutes);