// server/routes/profile.js
const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const user = db
    .prepare(
      "SELECT id, full_name, email, phone, currency, is_admin, created_at FROM users WHERE id = ?",
    )
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.put("/", (req, res) => {
  const { full_name, phone, currency } = req.body;
  db.prepare(
    "UPDATE users SET full_name=COALESCE(?,full_name), phone=COALESCE(?,phone), currency=COALESCE(?,currency) WHERE id=?",
  ).run(full_name, phone, currency, req.user.id);
  res.json(
    db
      .prepare(
        "SELECT id, full_name, email, phone, currency, is_admin FROM users WHERE id=?",
      )
      .get(req.user.id),
  );
});

router.put("/password", async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res
      .status(400)
      .json({ error: "current_password and new_password required" });
  }
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  const match = await bcrypt.compare(current_password, user.password_hash);
  if (!match)
    return res.status(401).json({ error: "Current password is incorrect" });

  const hash = await bcrypt.hash(new_password, 12);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    hash,
    req.user.id,
  );
  res.json({ success: true });
});

module.exports = router;
