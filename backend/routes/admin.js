const express = require("express");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get("/users", async (req, res) => {
  const users = (await pool.query(
    "SELECT id, full_name, email, phone, currency, is_admin, created_at FROM users ORDER BY created_at DESC"
  )).rows;
  res.json(users);
});

router.delete("/users/:id", async (req, res) => {
  if (Number(req.params.id) === req.user.id)
    return res.status(400).json({ error: "Cannot delete your own account" });

  const result = await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });
  res.json({ success: true });
});

module.exports = router;
