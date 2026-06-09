import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

router.get("/", optionalAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    const top = rows.filter((c) => !c.parent_comment_id);
    const replies = rows.filter((c) => c.parent_comment_id);
    const nested = top.map((c) => ({
      ...c,
      replies: replies.filter((r) => r.parent_comment_id === c.id),
    }));
    res.json(nested);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { content, parent_comment_id } = req.body;
  if (!content?.trim())
    return res.status(400).json({ error: "Content required" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO comments (post_id, user_id, parent_comment_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, req.auth.sub, parent_comment_id || null, content.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
