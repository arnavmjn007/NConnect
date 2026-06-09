import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import feedRouter from "./routes/feed.js";
import postsRouter from "./routes/posts.js";
import reactionsRouter from "./routes/reactions.js";
import commentsRouter from "./routes/comments.js";
import followsRouter from "./routes/follows.js";
import { requireAuth, authErrorHandler } from "./middleware/auth.js";
import { pool } from "./db.js";

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/", async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ service: "NConnect Feed Service", db: "connected" });
  } catch {
    res.status(500).json({ service: "NConnect Feed Service", db: "error" });
  }
});

app.use("/feed", feedRouter);
app.use("/posts", postsRouter);
app.use("/posts/:id/like", reactionsRouter);
app.use("/posts/:id/comments", commentsRouter);

app.delete("/comments/:id", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM comments WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.auth.sub]
    );
    if (!rowCount)
      return res.status(404).json({ error: "Comment not found or not yours" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/follow", followsRouter);
app.use("/followers", followsRouter);
app.use("/following", followsRouter);

app.use(authErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Feed service on http://localhost:${PORT}`)
);
