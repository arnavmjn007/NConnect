import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { enrichPosts } from "./posts.js";

const router = Router();
const PAGE_SIZE = 20;

const baseSelect = `
  SELECT p.*,
         op.content   AS original_content,
         op.author_id AS original_author_id
  FROM posts p
  LEFT JOIN posts op ON p.original_post_id = op.id
`;

router.get("/", optionalAuth, async (req, res) => {
  const offset = (Math.max(1, +req.query.page || 1) - 1) * PAGE_SIZE;
  try {
    const { rows } = await pool.query(
      `${baseSelect} ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
      [PAGE_SIZE, offset]
    );
    const posts = await enrichPosts(rows, req.auth?.sub);
    res.json({ posts, has_more: rows.length === PAGE_SIZE });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/trending", optionalAuth, async (req, res) => {
  const offset = (Math.max(1, +req.query.page || 1) - 1) * PAGE_SIZE;
  try {
    const { rows } = await pool.query(
      `${baseSelect}
       LEFT JOIN post_likes pl ON pl.post_id = p.id
       LEFT JOIN comments   c  ON c.post_id  = p.id
       WHERE p.created_at > NOW() - INTERVAL '7 days'
       GROUP BY p.id, op.content, op.author_id
       ORDER BY (COUNT(DISTINCT pl.id)*2 + COUNT(DISTINCT c.id)) DESC,
                p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [PAGE_SIZE, offset]
    );
    const posts = await enrichPosts(rows, req.auth?.sub);
    res.json({ posts, has_more: rows.length === PAGE_SIZE });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/following", requireAuth, async (req, res) => {
  const offset = (Math.max(1, +req.query.page || 1) - 1) * PAGE_SIZE;
  try {
    const { rows } = await pool.query(
      `${baseSelect}
       WHERE p.author_id IN (
         SELECT following_id FROM follows WHERE follower_id = $1
       )
       ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
      [req.auth.sub, PAGE_SIZE, offset]
    );
    const posts = await enrichPosts(rows, req.auth.sub);
    res.json({ posts, has_more: rows.length === PAGE_SIZE });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
