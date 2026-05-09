// server/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();
const SALT_ROUNDS = 12;

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { full_name, email, password, phone = "", currency = "INR" } = req.body;
  if (!full_name || !email || !password) {
    return res
      .status(400)
      .json({ error: "full_name, email and password are required" });
  }
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email);
  if (existing)
    return res.status(409).json({ error: "Email already registered" });

  try {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = db
      .prepare(
        "INSERT INTO users (full_name, email, password_hash, phone, currency) VALUES (?,?,?,?,?)",
      )
      .run(full_name, email, password_hash, phone, currency);

    // Create default preferences row
    db.prepare("INSERT INTO preferences (user_id) VALUES (?)").run(
      result.lastInsertRowid,
    );

    const token = jwt.sign(
      { id: result.lastInsertRowid, email, is_admin: 0 },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    res
      .status(201)
      .json({
        token,
        user: {
          id: result.lastInsertRowid,
          full_name,
          email,
          currency,
          is_admin: 0,
        },
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user)
    return res.status(401).json({ error: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match)
    return res.status(401).json({ error: "Invalid email or password" });

  const token = jwt.sign(
    { id: user.id, email: user.email, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

module.exports = router;
