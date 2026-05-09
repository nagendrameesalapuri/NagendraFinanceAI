-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone         TEXT DEFAULT '',
  currency      TEXT DEFAULT 'INR',
  is_admin      INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  target_amount REAL NOT NULL,
  icon          TEXT DEFAULT '🎯',
  color         TEXT DEFAULT '#4E7EF5',
  created_at    TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS transactions (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  amount         REAL NOT NULL,
  type           TEXT NOT NULL CHECK(type IN ('income','expense')),
  category       TEXT NOT NULL DEFAULT 'others',
  date           TEXT NOT NULL,
  linked_goal_id INTEGER REFERENCES savings_goals(id) ON DELETE SET NULL,
  note           TEXT DEFAULT '',
  created_at     TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')
);

CREATE TABLE IF NOT EXISTS budgets (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category     TEXT NOT NULL,
  limit_amount REAL NOT NULL,
  icon         TEXT DEFAULT '💰',
  UNIQUE(user_id, category)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id       SERIAL PRIMARY KEY,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  amount   REAL NOT NULL,
  due_date TEXT NOT NULL,
  icon     TEXT DEFAULT '📦',
  color    TEXT DEFAULT '#4E7EF5'
);

CREATE TABLE IF NOT EXISTS preferences (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dark_mode      INTEGER DEFAULT 1,
  budget_alerts  INTEGER DEFAULT 1,
  weekly_reports INTEGER DEFAULT 0,
  ai_insights    INTEGER DEFAULT 1
);
