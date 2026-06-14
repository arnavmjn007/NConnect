import { pool } from "../db.js";

const postsSql = `
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

const chatSql = `
CREATE TABLE IF NOT EXISTS conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         VARCHAR(255) NOT NULL,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  last_read_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       VARCHAR(255) NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  read_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_conv    ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_participant ON conversation_participants(user_id);
`;

const notifSql = `
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id VARCHAR(255) NOT NULL,
  actor_id     VARCHAR(255),
  type         VARCHAR(50)  NOT NULL,
  title        VARCHAR(255) NOT NULL,
  message      TEXT         NOT NULL,
  entity_type  VARCHAR(50),
  entity_id    VARCHAR(255),
  is_read      BOOLEAN      DEFAULT false,
  created_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  message     TEXT         NOT NULL,
  type        VARCHAR(50)  NOT NULL,
  audience    VARCHAR(50)  NOT NULL DEFAULT 'ALL',
  created_by  VARCHAR(255) NOT NULL,
  scheduled_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread    ON notifications(recipient_id, is_read);
`;

try {
  await pool.query(postsSql);
  console.log("✅ Posts/likes/comments/follows tables migrated");

  await pool.query(chatSql);
  console.log("✅ Chat tables migrated");

  await pool.query(notifSql);
  console.log("✅ Notifications tables migrated");
} catch (err) {
  console.error("❌ Migration failed:", err.message);
} finally {
  await pool.end();
}