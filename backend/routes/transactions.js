// server/routes/transactions.js
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/transactions
router.get("/", (req, res) => {
  const { type, category, search, limit = 200, offset = 0 } = req.query;
  let q = "SELECT * FROM transactions WHERE user_id = ?";
  const params = [req.user.id];

  if (type && type !== "all") {
    q += " AND type = ?";
    params.push(type);
  }
  if (category && category !== "all") {
    q += " AND category = ?";
    params.push(category);
  }
  if (search) {
    q += " AND title LIKE ?";
    params.push(`%${search}%`);
  }

  q += " ORDER BY date DESC, id DESC LIMIT ? OFFSET ?";
  params.push(Number(limit), Number(offset));

  const rows = db.prepare(q).all(...params);
  res.json(rows);
});

// POST /api/transactions
router.post("/", (req, res) => {
  const {
    title,
    amount,
    type,
    category = "others",
    date,
    note = "",
    linked_goal_id = null,
  } = req.body;
  if (!title || !amount || !type || !date) {
    return res
      .status(400)
      .json({ error: "title, amount, type, date required" });
  }
  if (!["income", "expense"].includes(type)) {
    return res.status(400).json({ error: "type must be income or expense" });
  }
  const result = db
    .prepare(
      "INSERT INTO transactions (user_id, title, amount, type, category, date, note, linked_goal_id) VALUES (?,?,?,?,?,?,?,?)",
    )
    .run(
      req.user.id,
      title,
      Number(amount),
      type,
      category,
      date,
      note,
      linked_goal_id,
    );

  const row = db
    .prepare("SELECT * FROM transactions WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(row);
});

// PUT /api/transactions/:id
router.put("/:id", (req, res) => {
  const tx = db
    .prepare("SELECT * FROM transactions WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!tx) return res.status(404).json({ error: "Transaction not found" });

  const { title, amount, type, category, date, note, linked_goal_id } =
    req.body;
  db.prepare(
    `UPDATE transactions SET
      title = COALESCE(?, title),
      amount = COALESCE(?, amount),
      type = COALESCE(?, type),
      category = COALESCE(?, category),
      date = COALESCE(?, date),
      note = COALESCE(?, note),
      linked_goal_id = ?
    WHERE id = ? AND user_id = ?`,
  ).run(
    title,
    amount ? Number(amount) : null,
    type,
    category,
    date,
    note,
    linked_goal_id !== undefined ? linked_goal_id : tx.linked_goal_id,
    req.params.id,
    req.user.id,
  );

  res.json(
    db.prepare("SELECT * FROM transactions WHERE id = ?").get(req.params.id),
  );
});

// DELETE /api/transactions/:id
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);
  if (result.changes === 0)
    return res.status(404).json({ error: "Transaction not found" });
  res.json({ success: true });
});

module.exports = router;
