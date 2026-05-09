const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const result = await pool.query(
    "SELECT id, full_name, email, phone, currency, is_admin, created_at FROM users WHERE id = $1",
    [req.user.id]
  );
  if (!result.rows[0]) return res.status(404).json({ error: "User not found" });
  res.json(result.rows[0]);
});

router.put("/", async (req, res) => {
  const { full_name, phone, currency } = req.body;
  const result = await pool.query(
    "UPDATE users SET full_name=COALESCE($1,full_name), phone=COALESCE($2,phone), currency=COALESCE($3,currency) WHERE id=$4 RETURNING id, full_name, email, phone, currency, is_admin",
    [full_name, phone, currency, req.user.id]
  );
  res.json(result.rows[0]);
});

router.put("/password", async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password)
    return res.status(400).json({ error: "current_password and new_password required" });

  const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
  const user = result.rows[0];
  const match = await bcrypt.compare(current_password, user.password_hash);
  if (!match) return res.status(401).json({ error: "Current password is incorrect" });

  const hash = await bcrypt.hash(new_password, 12);
  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, req.user.id]);
  res.json({ success: true });
});

module.exports = router;
