const express = require("express");
const jwt = require("jsonwebtoken");
const https = require("https");
const pool = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

router.post("/google", async (req, res) => {
  const { credential, email, name, sub } = req.body;
  if (!email) return res.status(400).json({ error: "Google credential required" });

  try {
    let result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user = result.rows[0];

    if (!user) {
      const inserted = await pool.query(
        "INSERT INTO users (full_name, email, password_hash, phone, currency) VALUES ($1,$2,$3,$4,$5) RETURNING *",
        [name || email.split("@")[0], email, `google_${sub || Date.now()}`, "", "INR"]
      );
      user = inserted.rows[0];
      await pool.query("INSERT INTO preferences (user_id) VALUES ($1)", [user.id]);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
