// server/seed.js — Seeds admin user + sample data
const bcrypt = require("bcrypt");
const db = require("./db");

async function seed() {
  console.log("🌱 Seeding database...");

  // ── Admin user ───────────────────────────────────────────────────────────────
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get("admin@finance.com");
  if (existing) {
    console.log("⚠️  Admin user already exists, skipping user seed.");
  } else {
    const hash = await bcrypt.hash("admin123", 12);
    const result = db
      .prepare(
        "INSERT INTO users (full_name, email, password_hash, phone, currency, is_admin) VALUES (?,?,?,?,?,?)",
      )
      .run(
        "Admin User",
        "admin@finance.com",
        hash,
        "+91 98765 00000",
        "INR",
        1,
      );

    const adminId = result.lastInsertRowid;
    db.prepare("INSERT INTO preferences (user_id) VALUES (?)").run(adminId);

    // ── Sample transactions ──────────────────────────────────────────────────
    const txs = [
      {
        title: "Monthly Salary",
        amount: 85000,
        type: "income",
        category: "salary",
        date: "2025-05-01",
        note: "May salary",
      },
      {
        title: "Swiggy Order",
        amount: 450,
        type: "expense",
        category: "food",
        date: "2025-05-02",
        note: "Dinner",
      },
      {
        title: "Amazon Shopping",
        amount: 3200,
        type: "expense",
        category: "shopping",
        date: "2025-05-03",
        note: "Books",
      },
      {
        title: "Rent Payment",
        amount: 22000,
        type: "expense",
        category: "rent",
        date: "2025-05-03",
        note: "May rent",
      },
      {
        title: "Petrol Fill",
        amount: 2500,
        type: "expense",
        category: "fuel",
        date: "2025-05-04",
        note: "Full tank",
      },
      {
        title: "Zepto Grocery",
        amount: 1200,
        type: "expense",
        category: "food",
        date: "2025-05-05",
        note: "Weekly grocery",
      },
      {
        title: "Netflix",
        amount: 649,
        type: "expense",
        category: "entertain",
        date: "2025-05-05",
        note: "Monthly sub",
      },
      {
        title: "Electricity Bill",
        amount: 1800,
        type: "expense",
        category: "bills",
        date: "2025-05-06",
        note: "BESCOM",
      },
      {
        title: "Home Loan EMI",
        amount: 18500,
        type: "expense",
        category: "emi",
        date: "2025-05-06",
        note: "HDFC",
      },
      {
        title: "SIP Investment",
        amount: 5000,
        type: "expense",
        category: "invest",
        date: "2025-05-07",
        note: "Mirae Asset",
      },
      {
        title: "Freelance Project",
        amount: 15000,
        type: "income",
        category: "salary",
        date: "2025-05-07",
        note: "UI project",
      },
      {
        title: "Zomato Order",
        amount: 380,
        type: "expense",
        category: "food",
        date: "2025-05-08",
        note: "Lunch",
      },
      {
        title: "Myntra Shopping",
        amount: 2800,
        type: "expense",
        category: "shopping",
        date: "2025-05-09",
        note: "Clothes",
      },
      {
        title: "Spotify",
        amount: 119,
        type: "expense",
        category: "entertain",
        date: "2025-05-10",
        note: "Music sub",
      },
      {
        title: "Mobile Recharge",
        amount: 699,
        type: "expense",
        category: "bills",
        date: "2025-05-11",
        note: "Jio 3mo",
      },
      {
        title: "Dividend Income",
        amount: 3200,
        type: "income",
        category: "invest",
        date: "2025-05-12",
        note: "Quarterly",
      },
      {
        title: "Restaurant Dinner",
        amount: 1800,
        type: "expense",
        category: "food",
        date: "2025-05-13",
        note: "Family",
      },
      {
        title: "Car Service",
        amount: 4500,
        type: "expense",
        category: "fuel",
        date: "2025-05-14",
        note: "Periodic",
      },
      {
        title: "Hotstar",
        amount: 299,
        type: "expense",
        category: "entertain",
        date: "2025-05-15",
        note: "OTT",
      },
      {
        title: "Internet Bill",
        amount: 999,
        type: "expense",
        category: "bills",
        date: "2025-05-15",
        note: "ACT",
      },
    ];
    const insertTx = db.prepare(
      "INSERT INTO transactions (user_id, title, amount, type, category, date, note) VALUES (?,?,?,?,?,?,?)",
    );
    txs.forEach((t) =>
      insertTx.run(
        adminId,
        t.title,
        t.amount,
        t.type,
        t.category,
        t.date,
        t.note,
      ),
    );

    // ── Savings goals ─────────────────────────────────────────────────────────
    const goals = [
      {
        name: "Emergency Fund",
        target_amount: 300000,
        icon: "🛡️",
        color: "#22D4AA",
      },
      {
        name: "Europe Trip",
        target_amount: 150000,
        icon: "✈️",
        color: "#4E7EF5",
      },
      {
        name: "New Laptop",
        target_amount: 80000,
        icon: "💻",
        color: "#A67CF8",
      },
      {
        name: "Down Payment",
        target_amount: 1000000,
        icon: "🏠",
        color: "#F5B731",
      },
    ];
    const insertGoal = db.prepare(
      "INSERT INTO savings_goals (user_id, name, target_amount, icon, color) VALUES (?,?,?,?,?)",
    );
    goals.forEach((g) =>
      insertGoal.run(adminId, g.name, g.target_amount, g.icon, g.color),
    );

    // ── Budgets ───────────────────────────────────────────────────────────────
    const budgets = [
      { category: "food", limit_amount: 8000, icon: "🍽️" },
      { category: "shopping", limit_amount: 5000, icon: "🛍️" },
      { category: "entertain", limit_amount: 2000, icon: "🎬" },
      { category: "fuel", limit_amount: 6000, icon: "⛽" },
      { category: "bills", limit_amount: 5000, icon: "💡" },
    ];
    const insertBudget = db.prepare(
      "INSERT INTO budgets (user_id, category, limit_amount, icon) VALUES (?,?,?,?)",
    );
    budgets.forEach((b) =>
      insertBudget.run(adminId, b.category, b.limit_amount, b.icon),
    );

    // ── Subscriptions ─────────────────────────────────────────────────────────
    const subs = [
      {
        name: "Netflix",
        amount: 649,
        due_date: "2025-05-20",
        icon: "🎬",
        color: "#E50914",
      },
      {
        name: "Spotify",
        amount: 119,
        due_date: "2025-05-22",
        icon: "🎵",
        color: "#1DB954",
      },
      {
        name: "Hotstar",
        amount: 299,
        due_date: "2025-05-25",
        icon: "📺",
        color: "#0065FF",
      },
      {
        name: "Jio Recharge",
        amount: 699,
        due_date: "2025-06-11",
        icon: "📱",
        color: "#0070DB",
      },
      {
        name: "ACT Broadband",
        amount: 999,
        due_date: "2025-06-01",
        icon: "🌐",
        color: "#FF6B00",
      },
    ];
    const insertSub = db.prepare(
      "INSERT INTO subscriptions (user_id, name, amount, due_date, icon, color) VALUES (?,?,?,?,?,?)",
    );
    subs.forEach((s) =>
      insertSub.run(adminId, s.name, s.amount, s.due_date, s.icon, s.color),
    );

    console.log(
      `✅ Admin user created (email: admin@finance.com, password: admin123)`,
    );
    console.log(
      `✅ Seeded ${txs.length} transactions, ${goals.length} goals, ${budgets.length} budgets, ${subs.length} subscriptions`,
    );
  }

  console.log("\n🎉 Seeding complete!\n");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
