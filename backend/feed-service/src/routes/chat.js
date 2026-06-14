import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/conversations", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         c.id,
         c.created_at,
         -- last message
         m.content      AS last_message,
         m.created_at   AS last_message_at,
         m.sender_id    AS last_sender_id,
         -- other participant
         cp2.user_id    AS other_user_id,
         -- unread count
         (SELECT COUNT(*)::int FROM messages msg
          WHERE msg.conversation_id = c.id
            AND msg.created_at > cp.last_read_at
            AND msg.sender_id != $1) AS unread_count
       FROM conversations c
       JOIN conversation_participants cp  ON cp.conversation_id  = c.id AND cp.user_id  = $1
       JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id != $1
       LEFT JOIN LATERAL (
         SELECT content, created_at, sender_id
         FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC LIMIT 1
       ) m ON true
       ORDER BY COALESCE(m.created_at, c.created_at) DESC`,
      [req.auth.sub]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/messages/:conversationId", requireAuth, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const before = req.query.before;

  try {
    const check = await pool.query(
      `SELECT 1 FROM conversation_participants
       WHERE conversation_id = $1 AND user_id = $2`,
      [req.params.conversationId, req.auth.sub]
    );
    if (!check.rows.length)
      return res.status(403).json({ error: "Not a participant" });

    const { rows } = await pool.query(
      `SELECT * FROM messages
       WHERE conversation_id = $1
         ${before ? "AND created_at < $3" : ""}
       ORDER BY created_at DESC
       LIMIT $2`,
      before
        ? [req.params.conversationId, limit, before]
        : [req.params.conversationId, limit]
    );
    res.json(rows.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/conversations", requireAuth, async (req, res) => {
  const { otherUserId } = req.body;
  if (!otherUserId)
    return res.status(400).json({ error: "otherUserId required" });

  try {
    const existing = await pool.query(
      `SELECT c.id FROM conversations c
       JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = $1
       JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = $2`,
      [req.auth.sub, otherUserId]
    );
    if (existing.rows.length) return res.json(existing.rows[0]);

    const { rows } = await pool.query(
      `INSERT INTO conversations DEFAULT VALUES RETURNING id`
    );
    const convId = rows[0].id;
    await pool.query(
      `INSERT INTO conversation_participants (conversation_id, user_id)
       VALUES ($1, $2), ($1, $3)`,
      [convId, req.auth.sub, otherUserId]
    );
    res.status(201).json({ id: convId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
