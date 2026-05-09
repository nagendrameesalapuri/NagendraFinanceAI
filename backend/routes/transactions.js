const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const { type, category, search, limit = 200, offset = 0 } = req.query;
  let q = "SELECT * FROM transactions WHERE user_id = $1";
  const params = [req.user.id];
  let i = 1;

  if (type && type !== "all") { q += ` AND type = $${++i}`; params.push(type); }
  if (category && category !== "all") { q += ` AND category = $${++i}`; params.push(category); }
  if (search) { q += ` AND title ILIKE $${++i}`; params.push(`%${search}%`); }

  q += ` ORDER BY date DESC, id DESC LIMIT $${++i} OFFSET $${++i}`;
  params.push(Number(limit), Number(offset));

  const rows = (await pool.query(q, params)).rows;
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { title, amount, type, category = "others", date, note = "", linked_goal_id = null } = req.body;
  if (!title || !amount || !type || !date)
    return res.status(400).json({ error: "title, amount, type, date required" });
  if (!["income", "expense"].includes(type))
    return res.status(400).json({ error: "type must be income or expense" });

  const result = await pool.query(
    "INSERT INTO transactions (user_id, title, amount, type, category, date, note, linked_goal_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
    [req.user.id, title, Number(amount), type, category, date, note, linked_goal_id]
  );
  res.status(201).json(result.rows[0]);
});

router.put("/:id", async (req, res) => {
  const check = await pool.query("SELECT * FROM transactions WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  if (!check.rows[0]) return res.status(404).json({ error: "Transaction not found" });

  const { title, amount, type, category, date, note, linked_goal_id } = req.body;
  const tx = check.rows[0];
  const result = await pool.query(
    `UPDATE transactions SET
      title = COALESCE($1, title),
      amount = COALESCE($2, amount),
      type = COALESCE($3, type),
      category = COALESCE($4, category),
      date = COALESCE($5, date),
      note = COALESCE($6, note),
      linked_goal_id = $7
    WHERE id = $8 AND user_id = $9 RETURNING *`,
    [title, amount ? Number(amount) : null, type, category, date, note,
     linked_goal_id !== undefined ? linked_goal_id : tx.linked_goal_id,
     req.params.id, req.user.id]
  );
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM transactions WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  if (result.rowCount === 0) return res.status(404).json({ error: "Transaction not found" });
  res.json({ success: true });
});

module.exports = router;
