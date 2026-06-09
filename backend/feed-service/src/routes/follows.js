import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/:userId", requireAuth, async (req, res) => {
  if (req.params.userId === req.auth.sub)
    return res.status(400).json({ error: "You can't follow yourself" });
  try {
    await pool.query(
      `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.auth.sub, req.params.userId]
    );
    res.json({ following: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:userId", requireAuth, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
      [req.auth.sub, req.params.userId]
    );
    res.json({ following: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/followers/:userId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT follower_id, created_at FROM follows
       WHERE following_id = $1 ORDER BY created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/following/:userId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT following_id, created_at FROM follows
       WHERE follower_id = $1 ORDER BY created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
