import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { createNotification, getActorInfo } from "../lib/notify.js";

export default function makeFollowsRouter(io) {
  const router = Router();
  router.post("/:userId", requireAuth, async (req, res) => {
    const followerId = req.auth.sub;
    const followingId = req.params.userId;

    if (followerId === followingId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }
    try {
      await pool.query(
        `INSERT INTO follows (follower_id, following_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [followerId, followingId]
      );

      const actor = await getActorInfo(followerId);
      await createNotification(io, {
        recipient_id: followingId,
        actor_id: followerId,
        type: "FOLLOW",
        title: "New Follower",
        message: `${actor.name} started following you.`,
        entity_type: "USER",
        entity_id: followerId,
      });

      res.json({ success: true, following: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/:userId", requireAuth, async (req, res) => {
    const followerId = req.auth.sub;
    const followingId = req.params.userId;
    try {
      await pool.query(
        `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
        [followerId, followingId]
      );
      res.json({ success: true, following: false });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/:userId", optionalAuth, async (req, res) => {
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

  return router;
}
