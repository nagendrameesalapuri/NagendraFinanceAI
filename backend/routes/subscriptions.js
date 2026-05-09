const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const rows = (await pool.query("SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY due_date", [req.user.id])).rows;
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { name, amount, due_date, icon = "📦", color = "#4E7EF5" } = req.body;
  if (!name || !amount || !due_date)
    return res.status(400).json({ error: "name, amount, due_date required" });

  const result = await pool.query(
    "INSERT INTO subscriptions (user_id, name, amount, due_date, icon, color) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [req.user.id, name, Number(amount), due_date, icon, color]
  );
  res.status(201).json(result.rows[0]);
});

router.put("/:id", async (req, res) => {
  const check = await pool.query("SELECT * FROM subscriptions WHERE id=$1 AND user_id=$2", [req.params.id, req.user.id]);
  if (!check.rows[0]) return res.status(404).json({ error: "Subscription not found" });

  const { name, amount, due_date, icon, color } = req.body;
  const result = await pool.query(
    "UPDATE subscriptions SET name=COALESCE($1,name), amount=COALESCE($2,amount), due_date=COALESCE($3,due_date), icon=COALESCE($4,icon), color=COALESCE($5,color) WHERE id=$6 AND user_id=$7 RETURNING *",
    [name, amount ? Number(amount) : null, due_date, icon, color, req.params.id, req.user.id]
  );
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM subscriptions WHERE id=$1 AND user_id=$2", [req.params.id, req.user.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "Subscription not found" });
  res.json({ success: true });
});

module.exports = router;
