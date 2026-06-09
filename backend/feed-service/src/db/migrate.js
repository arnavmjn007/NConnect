import { pool } from "../db.js";

const sql = `
CREATE TABLE IF NOT EXISTS posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     VARCHAR(255) NOT NULL,
  content       TEXT,
  media_urls    TEXT[]       DEFAULT '{}',
  post_type     VARCHAR(50)  DEFAULT 'regular',
  project_id    UUID,
  original_post_id UUID      REFERENCES posts(id) ON DELETE SET NULL,
  repost_comment   TEXT,
  is_edited     BOOLEAN      DEFAULT false,
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id           VARCHAR(255) NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id  VARCHAR(255) NOT NULL,
  following_id VARCHAR(255) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_posts_author   ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created  ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post     ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user     ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post  ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_flwr   ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_flwing ON follows(following_id);
`;

try {
  await pool.query(sql);
  console.log("✅ Migration complete");
} catch (err) {
  console.error("❌ Migration failed:", err.message);
} finally {
  await pool.end();
}
