import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { createNotification, getActorInfo } from "../lib/notify.js";

export default function notificationRouter(io) {
  const router = Router();
  router.get("/", requireAuth, async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (Math.max(1, parseInt(req.query.page) || 1) - 1) * limit;
    try {
      const { rows } = await pool.query(
        `SELECT n.*,
                u.username        AS actor_username,
                u.full_name       AS actor_full_name,
                u.profile_image_url AS actor_image
         FROM notifications n
         LEFT JOIN app_users u ON u.auth0_id = n.actor_id
         WHERE n.recipient_id = $1
         ORDER BY n.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.auth.sub, limit, offset]
      );
      const { rows: countRows } = await pool.query(
        `SELECT COUNT(*)::int AS total,
                SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END)::int AS unread
         FROM notifications WHERE recipient_id = $1`,
        [req.auth.sub]
      );
      res.json({
        notifications: rows,
        total: countRows[0].total,
        unread: countRows[0].unread,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/unread-count", requireAuth, async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS count FROM notifications
         WHERE recipient_id = $1 AND is_read = false`,
        [req.auth.sub]
      );
      res.json({ count: rows[0].count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch("/read-all", requireAuth, async (req, res) => {
    try {
      await pool.query(
        `UPDATE notifications SET is_read = true
         WHERE recipient_id = $1 AND is_read = false`,
        [req.auth.sub]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch("/:id/read", requireAuth, async (req, res) => {
    try {
      await pool.query(
        `UPDATE notifications SET is_read = true
         WHERE id = $1 AND recipient_id = $2`,
        [req.params.id, req.auth.sub]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/:id", requireAuth, async (req, res) => {
    try {
      await pool.query(
        `DELETE FROM notifications WHERE id = $1 AND recipient_id = $2`,
        [req.params.id, req.auth.sub]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/internal/event", async (req, res) => {
    const secret = req.headers["x-internal-secret"];
    if (secret !== process.env.INTERNAL_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { type, actor_id, recipient_id, entity_type, entity_id, metadata } =
      req.body;
    try {
      const actor = await getActorInfo(actor_id);
      let title, message;

      switch (type) {
        case "NGO_VERIFIED":
          title = "🎉 NGO Verified!";
          message = "Congratulations! Your NGO has been verified.";
          break;
        case "NGO_REJECTED":
          title = "Verification Update";
          message =
            "Your NGO verification was rejected. Please upload valid documents.";
          break;
        case "RESOURCE_REQUEST":
          title = "New Resource Request";
          message = `${actor.name} requested to borrow your ${
            metadata?.resourceName ?? "resource"
          }.`;
          break;
        case "RESOURCE_APPROVED":
          title = "Resource Request Approved";
          message = `Your request for ${
            metadata?.resourceName ?? "the resource"
          } has been approved.`;
          break;
        case "RESOURCE_RETURNED":
          title = "Resource Returned";
          message = `${
            metadata?.resourceName ?? "Resource"
          } has been marked as returned.`;
          break;
        case "PROJECT_APPLICATION":
          title = "New Volunteer Application";
          message = `${actor.name} applied for ${
            metadata?.projectName ?? "your project"
          }.`;
          break;
        case "PROJECT_ACCEPTED":
          title = "Application Accepted!";
          message = `You have been accepted for ${
            metadata?.projectName ?? "the project"
          }.`;
          break;
        case "PROJECT_REJECTED":
          title = "Application Update";
          message = `Your application for ${
            metadata?.projectName ?? "the project"
          } was not selected.`;
          break;
        case "DONATION_RECEIVED":
          title = "Donation Received";
          message = `A donor contributed NPR ${
            metadata?.amount ?? ""
          } to your project.`;
          break;
        case "DONATION_CONFIRMED":
          title = "Donation Confirmed";
          message = `Thank you for donating NPR ${metadata?.amount ?? ""}.`;
          break;
        case "DONATION_GOAL_REACHED":
          title = "🎯 Funding Goal Reached!";
          message = `Your project has reached 100% of its funding goal.`;
          break;
        case "NGO_UNDER_REVIEW":
          title = "Verification Submitted";
          message = `Your NGO verification is under review. We'll notify you within 48 hours.`;
          break;

        case "PROJECT_CLOSED":
          title = "Project Completed";
          message = `${
            metadata?.projectName ?? "Your project"
          } has been marked as completed.`;
          break;
        default:
          return res.status(400).json({ error: `Unknown event type: ${type}` });
      }

      await createNotification(io, {
        recipient_id: recipient_id,
        actor_id: actor_id ?? null,
        type,
        title,
        message,
        entity_type,
        entity_id,
      });

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post("/announcements", requireAuth, async (req, res) => {
    const { title, message, type, audience, scheduled_at } = req.body;
    if (!title || !message || !type)
      return res.status(400).json({ error: "title, message, type required" });

    try {
      const {
        rows: [ann],
      } = await pool.query(
        `INSERT INTO announcements (title, message, type, audience, created_by, scheduled_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          title,
          message,
          type,
          audience || "ALL",
          req.auth.sub,
          scheduled_at || null,
        ]
      );

      if (scheduled_at && new Date(scheduled_at) > new Date()) {
        return res
          .status(201)
          .json({ announcement: ann, sent: false, scheduled: true });
      }

      let roleFilter = "";
      if (audience === "NGO") roleFilter = `WHERE role = 'NGO'`;
      else if (audience === "USERS") roleFilter = `WHERE role = 'USER'`;

      const { rows: users } = await pool.query(
        `SELECT auth0_id FROM app_users
         WHERE deleted_at IS NULL AND onboarding_complete = true
         ${
           audience === "NGO"
             ? "AND role = 'NGO'"
             : audience === "USERS"
             ? "AND role = 'USER'"
             : ""
         }`
      );

      if (users.length > 0) {
        const notifs = users.map((u) => ({
          recipient_id: u.auth0_id,
          actor_id: req.auth.sub,
          type: "ADMIN_ANNOUNCEMENT",
          title,
          message,
          entity_type: "ANNOUNCEMENT",
          entity_id: ann.id,
        }));
        await createNotification(io, notifs);
      }

      res
        .status(201)
        .json({ announcement: ann, sent: true, recipients: users.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/announcements", requireAuth, async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT a.*,
                u.username  AS creator_username,
                u.full_name AS creator_name
         FROM announcements a
         LEFT JOIN app_users u ON u.auth0_id = a.created_by
         ORDER BY a.created_at DESC LIMIT 50`
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
