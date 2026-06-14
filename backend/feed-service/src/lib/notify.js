import { pool } from "../db.js";

export async function createNotification(io, payload) {
  const items = Array.isArray(payload) ? payload : [payload];
  if (!items.length) return;

  const values = [];
  const params = [];
  let i = 1;

  for (const n of items) {
    values.push(
      `($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`
    );
    params.push(
      n.recipient_id,
      n.actor_id ?? null,
      n.type,
      n.title,
      n.message,
      n.entity_type ?? null,
      n.entity_id ?? null
    );
  }

  const { rows } = await pool.query(
    `INSERT INTO notifications
       (recipient_id, actor_id, type, title, message, entity_type, entity_id)
     VALUES ${values.join(", ")}
     RETURNING *`,
    params
  );

  for (const notif of rows) {
    io.to(`user:${notif.recipient_id}`).emit("notification", notif);
  }

  return rows;
}

export async function getActorInfo(auth0Id) {
  if (!auth0Id) return { name: "Someone", image: null };
  const { rows } = await pool.query(
    `SELECT username, full_name, profile_image_url
     FROM app_users WHERE auth0_id = $1`,
    [auth0Id]
  );
  if (!rows.length) return { name: "Someone", image: null };
  return {
    name: rows[0].full_name || rows[0].username || "Someone",
    image: rows[0].profile_image_url,
  };
}
