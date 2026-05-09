const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const goals = (await pool.query(
    "SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC",
    [req.user.id]
  )).rows;

  const result = await Promise.all(goals.map(async (g) => {
    const txs = (await pool.query(
      "SELECT amount FROM transactions WHERE user_id = $1 AND linked_goal_id = $2",
      [req.user.id, g.id]
    )).rows;
    const saved = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return { ...g, saved };
  }));
  res.json(result);
});

router.post("/", async (req, res) => {
  const { name, target_amount, icon = "🎯", color = "#4E7EF5" } = req.body;
  if (!name || !target_amount)
    return res.status(400).json({ error: "name and target_amount required" });

  const result = await pool.query(
    "INSERT INTO savings_goals (user_id, name, target_amount, icon, color) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [req.user.id, name, Number(target_amount), icon, color]
  );
  res.status(201).json(result.rows[0]);
});

router.put("/:id", async (req, res) => {
  const check = await pool.query("SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  if (!check.rows[0]) return res.status(404).json({ error: "Goal not found" });

  const { name, target_amount, icon, color } = req.body;
  const result = await pool.query(
    "UPDATE savings_goals SET name=COALESCE($1,name), target_amount=COALESCE($2,target_amount), icon=COALESCE($3,icon), color=COALESCE($4,color) WHERE id=$5 AND user_id=$6 RETURNING *",
    [name, target_amount ? Number(target_amount) : null, icon, color, req.params.id, req.user.id]
  );
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM savings_goals WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "Goal not found" });
  res.json({ success: true });
});

module.exports = router;
