const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const budgets = (await pool.query("SELECT * FROM budgets WHERE user_id = $1", [req.user.id])).rows;
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const result = await Promise.all(budgets.map(async (b) => {
    const spent = (await pool.query(
      "SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE user_id=$1 AND category=$2 AND type='expense' AND date LIKE $3",
      [req.user.id, b.category, `${month}%`]
    )).rows[0];
    return { ...b, spent: Number(spent.total) };
  }));
  res.json(result);
});

router.post("/", async (req, res) => {
  const { category, limit_amount, icon = "💰" } = req.body;
  if (!category || !limit_amount)
    return res.status(400).json({ error: "category and limit_amount required" });
  try {
    const result = await pool.query(
      "INSERT INTO budgets (user_id, category, limit_amount, icon) VALUES ($1,$2,$3,$4) RETURNING *",
      [req.user.id, category, Number(limit_amount), icon]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(409).json({ error: "Budget for this category already exists" });
  }
});

router.put("/:id", async (req, res) => {
  const check = await pool.query("SELECT * FROM budgets WHERE id=$1 AND user_id=$2", [req.params.id, req.user.id]);
  if (!check.rows[0]) return res.status(404).json({ error: "Budget not found" });

  const { limit_amount, icon } = req.body;
  const result = await pool.query(
    "UPDATE budgets SET limit_amount=COALESCE($1,limit_amount), icon=COALESCE($2,icon) WHERE id=$3 AND user_id=$4 RETURNING *",
    [limit_amount ? Number(limit_amount) : null, icon, req.params.id, req.user.id]
  );
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM budgets WHERE id=$1 AND user_id=$2", [req.params.id, req.user.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "Budget not found" });
  res.json({ success: true });
});

module.exports = router;
