// server/routes/preferences.js
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  let prefs = db
    .prepare("SELECT * FROM preferences WHERE user_id = ?")
    .get(req.user.id);
  if (!prefs) {
    db.prepare("INSERT INTO preferences (user_id) VALUES (?)").run(req.user.id);
    prefs = db
      .prepare("SELECT * FROM preferences WHERE user_id = ?")
      .get(req.user.id);
  }
  res.json(prefs);
});

router.put("/", (req, res) => {
  const { dark_mode, budget_alerts, weekly_reports, ai_insights } = req.body;
  db.prepare(
    `UPDATE preferences SET
      dark_mode      = COALESCE(?, dark_mode),
      budget_alerts  = COALESCE(?, budget_alerts),
      weekly_reports = COALESCE(?, weekly_reports),
      ai_insights    = COALESCE(?, ai_insights)
    WHERE user_id = ?`,
  ).run(
    dark_mode !== undefined ? (dark_mode ? 1 : 0) : null,
    budget_alerts !== undefined ? (budget_alerts ? 1 : 0) : null,
    weekly_reports !== undefined ? (weekly_reports ? 1 : 0) : null,
    ai_insights !== undefined ? (ai_insights ? 1 : 0) : null,
    req.user.id,
  );
  res.json(
    db.prepare("SELECT * FROM preferences WHERE user_id = ?").get(req.user.id),
  );
});

module.exports = router;
