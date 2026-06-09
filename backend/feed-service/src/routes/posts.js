import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = Router();

export async function enrichPosts(posts, currentUserId) {
  if (!posts.length) return [];
  const ids = posts.map((p) => p.id);

  const [likes, comments, myLikes] = await Promise.all([
    pool.query(
      `SELECT post_id, COUNT(*)::int AS count
       FROM post_likes WHERE post_id = ANY($1) GROUP BY post_id`,
      [ids]
    ),
    pool.query(
      `SELECT post_id, COUNT(*)::int AS count
       FROM comments WHERE post_id = ANY($1) GROUP BY post_id`,
      [ids]
    ),
    currentUserId
      ? pool.query(
          `SELECT post_id FROM post_likes
           WHERE post_id = ANY($1) AND user_id = $2`,
          [ids, currentUserId]
        )
      : Promise.resolve({ rows: [] }),
  ]);

  const likeMap = Object.fromEntries(
    likes.rows.map((r) => [r.post_id, r.count])
  );
  const commentMap = Object.fromEntries(
    comments.rows.map((r) => [r.post_id, r.count])
  );
  const likedSet = new Set(myLikes.rows.map((r) => r.post_id));

  return posts.map((p) => ({
    ...p,
    like_count: likeMap[p.id] ?? 0,
    comment_count: commentMap[p.id] ?? 0,
    liked_by_me: likedSet.has(p.id),
  }));
}

router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*,
              op.content   AS original_content,
              op.author_id AS original_author_id
       FROM posts p
       LEFT JOIN posts op ON p.original_post_id = op.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Post not found" });
    const [enriched] = await enrichPosts(rows, req.auth?.sub);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const {
    content,
    media_urls = [],
    post_type = "regular",
    project_id,
  } = req.body;
  if (!content?.trim() && !media_urls.length)
    return res.status(400).json({ error: "Content or media required" });

  try {
    const { rows } = await pool.query(
      `INSERT INTO posts (author_id, content, media_urls, post_type, project_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        req.auth.sub,
        content?.trim() || null,
        media_urls,
        post_type,
        project_id || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  const { content, media_urls } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE posts
       SET content    = COALESCE($1, content),
           media_urls = COALESCE($2, media_urls),
           is_edited  = true,
           updated_at = NOW()
       WHERE id = $3 AND author_id = $4
       RETURNING *`,
      [content ?? null, media_urls ?? null, req.params.id, req.auth.sub]
    );
    if (!rows.length)
      return res.status(404).json({ error: "Post not found or not yours" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM posts WHERE id = $1 AND author_id = $2`,
      [req.params.id, req.auth.sub]
    );
    if (!rowCount)
      return res.status(404).json({ error: "Post not found or not yours" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/repost", requireAuth, async (req, res) => {
  const { repost_comment } = req.body;
  try {
    const original = await pool.query(`SELECT id FROM posts WHERE id = $1`, [
      req.params.id,
    ]);
    if (!original.rows.length)
      return res.status(404).json({ error: "Original post not found" });

    const { rows } = await pool.query(
      `INSERT INTO posts
         (author_id, content, post_type, original_post_id, repost_comment)
       VALUES ($1, $2, 'repost', $3, $4)
       RETURNING *`,
      [
        req.auth.sub,
        repost_comment || null,
        req.params.id,
        repost_comment || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
