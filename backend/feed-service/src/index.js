import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();
import feedRouter from "./routes/feed.js";
import postsRouter from "./routes/posts.js";
import commentsRouter from "./routes/comments.js";
import chatRouter from "./routes/chat.js";
import { requireAuth, authErrorHandler } from "./middleware/auth.js";
import { pool } from "./db.js";
import makeReactionsRouter from "./routes/reactions.js";
import makeFollowsRouter from "./routes/follows.js";
import makeNotificationsRouter from "./routes/notifications.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

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
app.use("/posts/:id/comments", commentsRouter);
app.use("/chat", chatRouter);
app.use("/posts/:id/like", makeReactionsRouter(io));
app.use("/notifications", makeNotificationsRouter(io));
app.use("/follow", makeFollowsRouter(io));

app.get("/followers/:userId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT follower_id, created_at FROM follows WHERE following_id = $1 ORDER BY created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/following/:userId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT following_id, created_at FROM follows WHERE follower_id = $1 ORDER BY created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/comments/:id", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM comments WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.auth.sub]
    );
    if (!rowCount)
      return res.status(404).json({ error: "Not found or not yours" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(authErrorHandler);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    socket.disconnect();
    return;
  }

  onlineUsers.set(userId, socket.id);
  socket.join(`user:${userId}`);
  io.emit("user_online", { userId });

  socket.on("join_conversations", (ids) => {
    if (Array.isArray(ids)) {
      ids.forEach((id) => socket.join(`conv:${id}`));
    }
  });

  socket.on("send_message", async ({ conversationId, content }) => {
    if (!content?.trim()) return;
    try {
      const { rows } = await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, content)
         VALUES ($1, $2, $3) RETURNING *`,
        [conversationId, userId, content.trim()]
      );
      const message = rows[0];

      socket.broadcast
        .to(`conv:${conversationId}`)
        .emit("receive_message", message);

      socket.emit("message_sent", message);
    } catch (err) {
      socket.emit("error", { message: err.message });
    }
  });

  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(`conv:${conversationId}`).emit("typing", { userId, isTyping });
  });

  socket.on("mark_read", async ({ conversationId }) => {
    try {
      await pool.query(
        `UPDATE conversation_participants SET last_read_at = NOW()
         WHERE conversation_id = $1 AND user_id = $2`,
        [conversationId, userId]
      );
      socket.to(`conv:${conversationId}`).emit("read_receipt", {
        conversationId,
        userId,
        readAt: new Date(),
      });
    } catch (err) {
      console.error("mark_read error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("user_offline", { userId });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`✅ Feed+Chat+Notifications on http://localhost:${PORT}`)
);
