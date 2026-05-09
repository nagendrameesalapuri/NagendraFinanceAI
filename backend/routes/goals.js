// server/routes/goals.js
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  const goals = db
    .prepare(
      "SELECT * FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC",
    )
    .all(req.user.id);

  // Calculate saved amount from linked transactions for each goal
  const result = goals.map((g) => {
    const txs = db
      .prepare(
        "SELECT amount FROM transactions WHERE user_id = ? AND linked_goal_id = ?",
      )
      .all(req.user.id, g.id);
    const saved = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return { ...g, saved };
  });
  res.json(result);
});

router.post("/", (req, res) => {
  const { name, target_amount, icon = "🎯", color = "#4E7EF5" } = req.body;
  if (!name || !target_amount)
    return res.status(400).json({ error: "name and target_amount required" });
  const r = db
    .prepare(
      "INSERT INTO savings_goals (user_id, name, target_amount, icon, color) VALUES (?,?,?,?,?)",
    )
    .run(req.user.id, name, Number(target_amount), icon, color);
  res
    .status(201)
    .json(
      db
        .prepare("SELECT * FROM savings_goals WHERE id = ?")
        .get(r.lastInsertRowid),
    );
});

router.put("/:id", (req, res) => {
  const g = db
    .prepare("SELECT * FROM savings_goals WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!g) return res.status(404).json({ error: "Goal not found" });
  const { name, target_amount, icon, color } = req.body;
  db.prepare(
    "UPDATE savings_goals SET name=COALESCE(?,name), target_amount=COALESCE(?,target_amount), icon=COALESCE(?,icon), color=COALESCE(?,color) WHERE id=? AND user_id=?",
  ).run(
    name,
    target_amount ? Number(target_amount) : null,
    icon,
    color,
    req.params.id,
    req.user.id,
  );
  res.json(
    db.prepare("SELECT * FROM savings_goals WHERE id = ?").get(req.params.id),
  );
});

router.delete("/:id", (req, res) => {
  const r = db
    .prepare("DELETE FROM savings_goals WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);
  if (r.changes === 0) return res.status(404).json({ error: "Goal not found" });
  res.json({ success: true });
});

module.exports = router;
