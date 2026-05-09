const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  let result = await pool.query("SELECT * FROM preferences WHERE user_id = $1", [req.user.id]);
  if (!result.rows[0]) {
    await pool.query("INSERT INTO preferences (user_id) VALUES ($1)", [req.user.id]);
    result = await pool.query("SELECT * FROM preferences WHERE user_id = $1", [req.user.id]);
  }
  res.json(result.rows[0]);
});

router.put("/", async (req, res) => {
  const { dark_mode, budget_alerts, weekly_reports, ai_insights } = req.body;
  const result = await pool.query(
    `UPDATE preferences SET
      dark_mode      = COALESCE($1, dark_mode),
      budget_alerts  = COALESCE($2, budget_alerts),
      weekly_reports = COALESCE($3, weekly_reports),
      ai_insights    = COALESCE($4, ai_insights)
    WHERE user_id = $5 RETURNING *`,
    [
      dark_mode !== undefined ? (dark_mode ? 1 : 0) : null,
      budget_alerts !== undefined ? (budget_alerts ? 1 : 0) : null,
      weekly_reports !== undefined ? (weekly_reports ? 1 : 0) : null,
      ai_insights !== undefined ? (ai_insights ? 1 : 0) : null,
      req.user.id,
    ]
  );
  res.json(result.rows[0]);
});

module.exports = router;
