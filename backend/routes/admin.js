// server/routes/admin.js
const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireAdmin);

// GET /api/admin/users
router.get("/users", (req, res) => {
  const users = db
    .prepare(
      "SELECT id, full_name, email, phone, currency, is_admin, created_at FROM users ORDER BY created_at DESC",
    )
    .all();
  res.json(users);
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ error: "Cannot delete your own account" });
  }
  const result = db
    .prepare("DELETE FROM users WHERE id = ?")
    .run(req.params.id);
  if (result.changes === 0)
    return res.status(404).json({ error: "User not found" });
  res.json({ success: true });
});

module.exports = router;
