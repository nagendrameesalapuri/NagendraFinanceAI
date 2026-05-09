// server/routes/budgets.js
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const budgets = db
    .prepare("SELECT * FROM budgets WHERE user_id = ?")
    .all(req.user.id);

  // Get current month's spending per category from real transactions
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const result = budgets.map((b) => {
    const spent = db
      .prepare(
        "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id=? AND category=? AND type='expense' AND date LIKE ?",
      )
      .get(req.user.id, b.category, `${month}%`);
    return { ...b, spent: spent.total };
  });
  res.json(result);
});

router.post("/", (req, res) => {
  const { category, limit_amount, icon = "💰" } = req.body;
  if (!category || !limit_amount)
    return res
      .status(400)
      .json({ error: "category and limit_amount required" });
  try {
    const r = db
      .prepare(
        "INSERT INTO budgets (user_id, category, limit_amount, icon) VALUES (?,?,?,?)",
      )
      .run(req.user.id, category, Number(limit_amount), icon);
    res
      .status(201)
      .json(
        db.prepare("SELECT * FROM budgets WHERE id = ?").get(r.lastInsertRowid),
      );
  } catch {
    res.status(409).json({ error: "Budget for this category already exists" });
  }
});

router.put("/:id", (req, res) => {
  const b = db
    .prepare("SELECT * FROM budgets WHERE id=? AND user_id=?")
    .get(req.params.id, req.user.id);
  if (!b) return res.status(404).json({ error: "Budget not found" });
  const { limit_amount, icon } = req.body;
  db.prepare(
    "UPDATE budgets SET limit_amount=COALESCE(?,limit_amount), icon=COALESCE(?,icon) WHERE id=? AND user_id=?",
  ).run(
    limit_amount ? Number(limit_amount) : null,
    icon,
    req.params.id,
    req.user.id,
  );
  res.json(db.prepare("SELECT * FROM budgets WHERE id=?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  const r = db
    .prepare("DELETE FROM budgets WHERE id=? AND user_id=?")
    .run(req.params.id, req.user.id);
  if (r.changes === 0)
    return res.status(404).json({ error: "Budget not found" });
  res.json({ success: true });
});

module.exports = router;
