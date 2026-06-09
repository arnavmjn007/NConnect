import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

router.post("/", requireAuth, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, req.auth.sub]
    );
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM post_likes WHERE post_id = $1`,
      [req.params.id]
    );
    res.json({ liked: true, count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/", requireAuth, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`,
      [req.params.id, req.auth.sub]
    );
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM post_likes WHERE post_id = $1`,
      [req.params.id]
    );
    res.json({ liked: false, count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
