// server/routes/subscriptions.js
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(
    db
      .prepare(
        "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY due_date",
      )
      .all(req.user.id),
  );
});

router.post("/", (req, res) => {
  const { name, amount, due_date, icon = "📦", color = "#4E7EF5" } = req.body;
  if (!name || !amount || !due_date)
    return res.status(400).json({ error: "name, amount, due_date required" });
  const r = db
    .prepare(
      "INSERT INTO subscriptions (user_id, name, amount, due_date, icon, color) VALUES (?,?,?,?,?,?)",
    )
    .run(req.user.id, name, Number(amount), due_date, icon, color);
  res
    .status(201)
    .json(
      db
        .prepare("SELECT * FROM subscriptions WHERE id=?")
        .get(r.lastInsertRowid),
    );
});

router.put("/:id", (req, res) => {
  const s = db
    .prepare("SELECT * FROM subscriptions WHERE id=? AND user_id=?")
    .get(req.params.id, req.user.id);
  if (!s) return res.status(404).json({ error: "Subscription not found" });
  const { name, amount, due_date, icon, color } = req.body;
  db.prepare(
    "UPDATE subscriptions SET name=COALESCE(?,name), amount=COALESCE(?,amount), due_date=COALESCE(?,due_date), icon=COALESCE(?,icon), color=COALESCE(?,color) WHERE id=? AND user_id=?",
  ).run(
    name,
    amount ? Number(amount) : null,
    due_date,
    icon,
    color,
    req.params.id,
    req.user.id,
  );
  res.json(
    db.prepare("SELECT * FROM subscriptions WHERE id=?").get(req.params.id),
  );
});

router.delete("/:id", (req, res) => {
  const r = db
    .prepare("DELETE FROM subscriptions WHERE id=? AND user_id=?")
    .run(req.params.id, req.user.id);
  if (r.changes === 0)
    return res.status(404).json({ error: "Subscription not found" });
  res.json({ success: true });
});

module.exports = router;
