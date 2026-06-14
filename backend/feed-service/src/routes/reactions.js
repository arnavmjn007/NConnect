import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { createNotification, getActorInfo } from "../lib/notify.js";

export default function reactionsRouter(io) {
  const router = Router({ mergeParams: true });

  router.post("/", requireAuth, async (req, res) => {
    try {
      const { rowCount } = await pool.query(
        `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [req.params.id, req.auth.sub]
      );
      const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS count FROM post_likes WHERE post_id = $1`,
        [req.params.id]
      );

      if (rowCount > 0) {
        const post = await pool.query(
          `SELECT author_id FROM posts WHERE id = $1`,
          [req.params.id]
        );
        if (post.rows.length && post.rows[0].author_id !== req.auth.sub) {
          const actor = await getActorInfo(req.auth.sub);
          await createNotification(io, {
            recipient_id: post.rows[0].author_id,
            actor_id: req.auth.sub,
            type: "LIKE",
            title: "New Like",
            message: `${actor.name} liked your post.`,
            entity_type: "POST",
            entity_id: req.params.id,
          });
        }
      }

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

  return router;
}
