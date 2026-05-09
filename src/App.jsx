import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import * as XLSX from "xlsx";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart2,
  Target,
  Settings,
  Lock,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  Send,
  Search,
  Edit2,
  Trash2,
  Bell,
  Moon,
  Sun,
  Download,
  User,
  CreditCard,
  X,
  ShieldCheck,
  Zap,
  Loader2,
  Utensils,
  ShoppingBag,
  Home,
  Car,
  Tv,
  Lightbulb,
  Package,
  TrendingUp as Invest,
  BadgeDollarSign,
  Trophy,
  LogOut,
  Shield,
  Menu,
} from "lucide-react";

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─────────────────────────────────────────────
// API HELPERS
// ─────────────────────────────────────────────
const getToken = () => localStorage.getItem("financeai_token");

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const api = {
  // Auth
  login: (body) => apiFetch("/auth/login", { method: "POST", body }),
  register: (body) => apiFetch("/auth/register", { method: "POST", body }),

  // Transactions
  getTx: (q = "") => apiFetch(`/transactions${q}`),
  addTx: (body) => apiFetch("/transactions", { method: "POST", body }),
  updateTx: (id, body) =>
    apiFetch(`/transactions/${id}`, { method: "PUT", body }),
  deleteTx: (id) => apiFetch(`/transactions/${id}`, { method: "DELETE" }),

  // Goals
  getGoals: () => apiFetch("/goals"),
  addGoal: (body) => apiFetch("/goals", { method: "POST", body }),
  updateGoal: (id, body) => apiFetch(`/goals/${id}`, { method: "PUT", body }),
  deleteGoal: (id) => apiFetch(`/goals/${id}`, { method: "DELETE" }),

  // Budgets
  getBudgets: () => apiFetch("/budgets"),
  addBudget: (body) => apiFetch("/budgets", { method: "POST", body }),
  updateBudget: (id, body) =>
    apiFetch(`/budgets/${id}`, { method: "PUT", body }),
  deleteBudget: (id) => apiFetch(`/budgets/${id}`, { method: "DELETE" }),

  // Subscriptions
  getSubs: () => apiFetch("/subscriptions"),
  addSub: (body) => apiFetch("/subscriptions", { method: "POST", body }),
  updateSub: (id, body) =>
    apiFetch(`/subscriptions/${id}`, { method: "PUT", body }),
  deleteSub: (id) => apiFetch(`/subscriptions/${id}`, { method: "DELETE" }),

  // Preferences
  getPrefs: () => apiFetch("/preferences"),
  updatePrefs: (body) => apiFetch("/preferences", { method: "PUT", body }),

  // Profile
  getProfile: () => apiFetch("/profile"),
  updateProfile: (body) => apiFetch("/profile", { method: "PUT", body }),
  changePassword: (body) =>
    apiFetch("/profile/password", { method: "PUT", body }),

  // Admin
  getAdminUsers: () => apiFetch("/admin/users"),
  deleteUser: (id) => apiFetch(`/admin/users/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const T = {
  bg0: "#03071A",
  bg1: "#060D22",
  bg2: "#0B1530",
  bg3: "#11203F",
  bg4: "#182B52",
  border: "rgba(100,140,255,0.1)",
  borderHover: "rgba(100,140,255,0.22)",
  primary: "#4E7EF5",
  primaryDim: "rgba(78,126,245,0.15)",
  green: "#22D4AA",
  greenDim: "rgba(34,212,170,0.14)",
  red: "#F45B7A",
  redDim: "rgba(244,91,122,0.14)",
  yellow: "#F5B731",
  yellowDim: "rgba(245,183,49,0.14)",
  purple: "#A67CF8",
  purpleDim: "rgba(166,124,248,0.14)",
  cyan: "#20C8EA",
  t1: "#E8F0FF",
  t2: "#8BA3CC",
  t3: "#3D567A",
  sidebar: "#04091C",
};

// ─────────────────────────────────────────────
// RESPONSIVE HELPERS
// ─────────────────────────────────────────────
const MobileMenuCtx = createContext({ toggle: () => {} });

const useMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
};

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const CATS = [
  { id: "food", label: "Food & Dining", icon: Utensils, color: T.yellow },
  { id: "shopping", label: "Shopping", icon: ShoppingBag, color: T.purple },
  { id: "rent", label: "Rent & Housing", icon: Home, color: T.primary },
  { id: "fuel", label: "Fuel & Travel", icon: Car, color: T.red },
  { id: "salary", label: "Salary", icon: BadgeDollarSign, color: T.green },
  { id: "invest", label: "Investments", icon: Invest, color: T.green },
  { id: "emi", label: "EMI", icon: CreditCard, color: T.cyan },
  { id: "entertain", label: "Entertainment", icon: Tv, color: T.purple },
  { id: "bills", label: "Bills & Utilities", icon: Lightbulb, color: T.yellow },
  { id: "others", label: "Others", icon: Package, color: T.t2 },
];
const CAT = (id) => CATS.find((c) => c.id === id) || CATS[9];
const fmt = (n) =>
  "₹" +
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.abs(n || 0),
  );
const fmtDate = (s) => {
  try {
    return new Date(s).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
};

// ─────────────────────────────────────────────
// EXPORT HELPERS (unchanged, work on local data)
// ─────────────────────────────────────────────
const exportToExcel = (transactions) => {
  const rows = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((t) => ({
      Date: t.date,
      Title: t.title,
      Category: CAT(t.category || t.cat).label,
      Type: t.type === "income" || t.type === "credit" ? "Income" : "Expense",
      Amount: t.amount,
      Note: t.note || "",
    }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 12 },
    { wch: 28 },
    { wch: 18 },
    { wch: 10 },
    { wch: 12 },
    { wch: 24 },
  ];
  const income = transactions
    .filter((t) => t.type === "income" || t.type === "credit")
    .reduce((a, t) => a + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense" || t.type === "debit")
    .reduce((a, t) => a + t.amount, 0);
  const summary = [
    { Metric: "Total Income", Value: income },
    { Metric: "Total Expenses", Value: expense },
    { Metric: "Net Savings", Value: income - expense },
    {
      Metric: "Savings Rate",
      Value: (((income - expense) / income) * 100).toFixed(1) + "%",
    },
    { Metric: "Transactions", Value: transactions.length },
  ];
  const ws2 = XLSX.utils.json_to_sheet(summary);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");
  XLSX.writeFile(wb, "FinanceAI_Transactions.xlsx");
};

const exportToCSV = (transactions) => {
  const header = ["Date", "Title", "Category", "Type", "Amount", "Note"];
  const rows = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((t) => [
      t.date,
      t.title,
      CAT(t.category || t.cat).label,
      t.type === "income" || t.type === "credit" ? "Income" : "Expense",
      t.amount,
      t.note || "",
    ]);
  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "FinanceAI_Transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const exportToPDF = (transactions) => {
  const income = transactions
    .filter((t) => t.type === "income" || t.type === "credit")
    .reduce((a, t) => a + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense" || t.type === "debit")
    .reduce((a, t) => a + t.amount, 0);
  const fmtR = (n) =>
    "₹" +
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
  const rows = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (
        t,
      ) => `<tr><td>${t.date}</td><td>${t.title}</td><td>${CAT(t.category || t.cat).label}</td>
      <td style="color:${t.type === "income" || t.type === "credit" ? "#16a34a" : "#dc2626"};font-weight:600">
        ${t.type === "income" || t.type === "credit" ? "+" : "-"}${fmtR(t.amount)}</td>
      <td>${t.note || "—"}</td></tr>`,
    )
    .join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>FinanceAI Report</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:32px;color:#111;font-size:13px}
.header{display:flex;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e5e7eb}
.logo{font-size:22px;font-weight:800;color:#4E7EF5}.logo span{color:#22D4AA}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
.scard{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px}
table{width:100%;border-collapse:collapse}thead tr{background:#f3f4f6}
th{padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb}
td{padding:9px 12px;border-bottom:1px solid #f3f4f6;font-size:12px}</style></head>
<body><div class="header"><div><div class="logo">Finance<span>AI</span></div></div></div>
<div class="summary">
  <div class="scard"><div style="font-size:11px;color:#9ca3af">Total Income</div><div style="font-size:20px;font-weight:700;color:#16a34a">${fmtR(income)}</div></div>
  <div class="scard"><div style="font-size:11px;color:#9ca3af">Total Expenses</div><div style="font-size:20px;font-weight:700;color:#dc2626">${fmtR(expense)}</div></div>
  <div class="scard"><div style="font-size:11px;color:#9ca3af">Net Savings</div><div style="font-size:20px;font-weight:700;color:#4E7EF5">${fmtR(income - expense)}</div></div>
</div>
<table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Note</th></tr></thead>
<tbody>${rows}</tbody></table></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win)
    win.addEventListener("load", () => {
      setTimeout(() => {
        win.print();
        URL.revokeObjectURL(url);
      }, 400);
    });
};

// ─────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────
const Card = ({ children, style = {}, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: T.bg2,
      borderRadius: 16,
      border: `1px solid ${T.border}`,
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge = ({ children, c = T.primary }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 9px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: c + "22",
      color: c,
    }}
  >
    {children}
  </span>
);

const Chip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "7px 14px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 13,
      fontWeight: 500,
      transition: "all 0.15s",
      background: active ? T.primaryDim : T.bg3,
      color: active ? T.primary : T.t2,
    }}
  >
    {label}
  </button>
);

const StatCard = ({ label, value, sub, Icon, color = T.primary, trend }) => (
  <Card style={{ padding: "16px 18px" }}>
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
        <p
          style={{
            color: T.t2,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 6,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </p>
        <p
          style={{
            color: T.t1,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </p>
        {sub && (
          <p
            style={{
              color: trend >= 0 ? T.green : T.red,
              fontSize: 11,
              marginTop: 5,
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {sub}
          </p>
        )}
      </div>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: color + "1A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={17} color={color} />
      </div>
    </div>
  </Card>
);

const ProgressBar = ({ pct, color, height = 6 }) => (
  <div
    style={{
      height,
      borderRadius: height / 2,
      background: T.bg3,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        height: "100%",
        width: `${Math.min(pct, 100)}%`,
        borderRadius: height / 2,
        background: color,
        transition: "width 0.6s ease",
      }}
    />
  </div>
);

const Spinner = ({ size = 18, color = T.primary }) => (
  <Loader2
    size={size}
    color={color}
    style={{ animation: "spin 0.8s linear infinite" }}
  />
);

const ErrorMsg = ({ msg }) =>
  msg ? (
    <div
      style={{
        background: T.redDim,
        border: `1px solid ${T.red}40`,
        borderRadius: 9,
        padding: "10px 14px",
        color: T.red,
        fontSize: 13,
        marginBottom: 12,
      }}
    >
      {msg}
    </div>
  ) : null;

const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: T.bg3,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "10px 14px",
      }}
    >
      <p style={{ color: T.t2, fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// LOGIN / REGISTER PAGE
// ─────────────────────────────────────────────
const AuthPage = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    currency: "INR",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inp = (key, type = "text", placeholder = "") => (
    <input
      type={type}
      value={form[key]}
      placeholder={placeholder}
      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      style={{
        width: "100%",
        background: T.bg3,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "11px 14px",
        color: T.t1,
        fontSize: 14,
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "inherit",
        marginBottom: 10,
      }}
    />
  );

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      let data;
      if (mode === "login") {
        data = await api.login({ email: form.email, password: form.password });
      } else {
        if (!form.full_name) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        data = await api.register(form);
      }
      localStorage.setItem("financeai_token", data.token);
      onLogin(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: `linear-gradient(135deg,${T.primary},${T.purple})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              margin: "0 auto 14px",
            }}
          >
            ₹
          </div>
          <h1
            style={{
              color: T.t1,
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Nagendra's Finance AI
          </h1>
          <p style={{ color: T.t3, fontSize: 13, marginTop: 4 }}>
            Smart Finance Hub
          </p>
        </div>
        <Card style={{ padding: 28 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 22,
              background: T.bg3,
              borderRadius: 10,
              padding: 4,
            }}
          >
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.15s",
                  background: mode === m ? T.primary : "transparent",
                  color: mode === m ? "#fff" : T.t2,
                }}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>
          <ErrorMsg msg={error} />
          {mode === "register" && inp("full_name", "text", "Full Name")}
          {inp("email", "email", "Email address")}
          {inp("password", "password", "Password")}
          {mode === "register" && inp("phone", "tel", "Phone (optional)")}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              background: T.primary,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            {loading ? <Spinner color="#fff" /> : null}
            {loading
              ? "Please wait…"
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </Card>
        <p
          style={{
            textAlign: "center",
            color: T.t3,
            fontSize: 12,
            marginTop: 18,
          }}
        >
          Admin demo: admin@finance.com / admin123
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", Icon: ArrowLeftRight },
  { id: "analytics", label: "Analytics", Icon: BarChart2 },
  { id: "budget", label: "Budget & Goals", Icon: Target },
  { id: "settings", label: "Settings", Icon: Settings },
];

const Sidebar = ({
  page,
  setPage,
  collapsed,
  setCollapsed,
  user,
  onLogout,
  mobileOpen,
  onClose,
}) => {
  const isMobile = useMobile();
  const showLabels = isMobile || !collapsed;

  return (
    <>
      {isMobile && mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 199,
          }}
        />
      )}
      <div
        style={{
          width: isMobile ? 230 : collapsed ? 64 : 230,
          minHeight: "100vh",
          background: T.sidebar,
          borderRight: `1px solid ${T.border}`,
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.25s ease, width 0.25s ease",
          overflow: "hidden",
          transform: isMobile
            ? mobileOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : "translateX(0)",
        }}
      >
        <div
          style={{
            padding: "22px 16px 18px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              flexShrink: 0,
              background: `linear-gradient(135deg,${T.primary},${T.purple})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            ₹
          </div>
          {showLabels && (
            <div>
              <p
                style={{
                  color: T.t1,
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                Nagendra's Finance AI
              </p>
              <p style={{ color: T.t3, fontSize: 10, marginTop: 2 }}>
                Smart Finance Hub
              </p>
            </div>
          )}
          {isMobile ? (
            <button
              onClick={onClose}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.t3,
                padding: 4,
                borderRadius: 6,
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.t3,
                padding: 4,
                borderRadius: 6,
                flexShrink: 0,
              }}
            >
              {collapsed ? <ChevronRight size={14} /> : <X size={14} />}
            </button>
          )}
        </div>
        <nav style={{ padding: "12px 8px" }}>
          {NAV.map(({ id, label, Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setPage(id);
                  if (isMobile) onClose();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "9px 12px",
                  borderRadius: 10,
                  marginBottom: 3,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  background: active ? T.primaryDim : "transparent",
                  color: active ? T.primary : T.t2,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = T.bg3;
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                {showLabels && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                )}
                {showLabels && id === "settings" && user?.is_admin === 1 && (
                  <Shield
                    size={11}
                    color={T.yellow}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </button>
            );
          })}
        </nav>
        <div
          style={{
            marginTop: "auto",
            padding: "14px 10px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 50,
              flexShrink: 0,
              background: `linear-gradient(135deg,${T.green},${T.primary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {(user?.full_name || "U")[0].toUpperCase()}
          </div>
          {showLabels && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  color: T.t1,
                  fontSize: 12,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.full_name}
              </p>
              <p style={{ color: T.t3, fontSize: 10, marginTop: 1 }}>
                {user?.is_admin ? "Admin" : "Member"}
              </p>
            </div>
          )}
          {showLabels && (
            <button
              onClick={onLogout}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.t3,
                padding: 4,
              }}
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

const TopBar = ({ title, sub }) => {
  const isMobile = useMobile();
  const { toggle } = useContext(MobileMenuCtx);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 28,
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {isMobile && (
          <button
            onClick={toggle}
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              border: `1px solid ${T.border}`,
              background: T.bg3,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Menu size={17} color={T.t2} />
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              color: T.t1,
              fontSize: isMobile ? 18 : 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h1>
          {sub && (
            <p style={{ color: T.t2, fontSize: isMobile ? 11 : 13, marginTop: 4 }}>
              {sub}
            </p>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            border: `1px solid ${T.border}`,
            background: T.bg3,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bell size={16} color={T.t2} />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// LOADING OVERLAY
// ─────────────────────────────────────────────
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 320,
      gap: 14,
    }}
  >
    <Spinner size={28} />
    <p style={{ color: T.t3, fontSize: 13 }}>Loading…</p>
  </div>
);

// ─────────────────────────────────────────────
// DASHBOARD PAGE
// ─────────────────────────────────────────────
const PIE_COLORS = {
  food: T.yellow, shopping: T.purple, rent: T.primary, fuel: T.red,
  emi: T.cyan, entertain: "#C97EF5", bills: "#44BFFF", invest: T.green, others: T.t2,
};

const DashboardPage = ({ user, setPage }) => {
  const isMobile = useMobile();
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salaryModal, setSalaryModal] = useState(false);
  const [salaryInput, setSalaryInput] = useState("");
  const [savingSalary, setSavingSalary] = useState(false);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = now.toLocaleString("en-IN", { month: "long", year: "numeric" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txs, g] = await Promise.all([api.getTx(), api.getGoals()]);
      setTransactions(txs);
      setGoals(g);
      const alreadyPrompted = localStorage.getItem(`salary_prompted_${monthKey}`);
      const hasSalary = txs.some(
        (t) => t.type === "income" && t.category === "salary" && t.date.startsWith(monthKey)
      );
      if (!alreadyPrompted && !hasSalary) setSalaryModal(true);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [monthKey]);

  useEffect(() => { load(); }, [load]);

  const addSalary = async () => {
    if (!salaryInput) return;
    setSavingSalary(true);
    try {
      await api.addTx({
        title: "Monthly Salary",
        amount: parseFloat(salaryInput),
        type: "income",
        category: "salary",
        date: `${monthKey}-01`,
        note: `Salary for ${monthLabel}`,
      });
      localStorage.setItem(`salary_prompted_${monthKey}`, "1");
      const txs = await api.getTx();
      setTransactions(txs);
      setSalaryModal(false);
      setSalaryInput("");
    } catch (e) { alert(e.message); }
    setSavingSalary(false);
  };

  const skipSalary = () => {
    localStorage.setItem(`salary_prompted_${monthKey}`, "1");
    setSalaryModal(false);
  };

  if (loading) return <PageLoader />;
  if (error) return <div style={{ color: T.red, padding: 24 }}>{error}</div>;

  // ── Current month only ──
  const monthTx = transactions.filter((t) => t.date.startsWith(monthKey));
  const income = monthTx.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  const balance = income - expense;
  const rate = income > 0 ? ((balance / income) * 100).toFixed(1) : "0.0";
  const recent = [...monthTx].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const catExpenses = {};
  monthTx.filter((t) => t.type === "expense").forEach((t) => {
    catExpenses[t.category] = (catExpenses[t.category] || 0) + t.amount;
  });
  const pieData = Object.entries(catExpenses)
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([cat, v]) => ({ name: CAT(cat).label, v, c: PIE_COLORS[cat] || T.t2 }));

  const hourNow = now.getHours();
  const greeting = hourNow < 12 ? "Good morning" : hourNow < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ minWidth: 0, overflow: "hidden" }}>
      {/* Salary prompt modal */}
      {salaryModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <Card style={{ width: "100%", maxWidth: 380, padding: 28 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💰</div>
              <h3 style={{ color: T.t1, fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                New Month, New Budget!
              </h3>
              <p style={{ color: T.t2, fontSize: 13 }}>
                How much salary did you receive for <strong style={{ color: T.primary }}>{monthLabel}</strong>?
              </p>
            </div>
            <input
              type="number"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSalary()}
              placeholder="Enter salary amount (₹)"
              autoFocus
              style={{ width: "100%", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", color: T.t1, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 14 }}
            />
            <button
              onClick={addSalary}
              disabled={savingSalary || !salaryInput}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: T.primary, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}
            >
              {savingSalary ? <Spinner size={15} color="#fff" /> : null}
              {savingSalary ? "Saving…" : "Add Salary"}
            </button>
            <button
              onClick={skipSalary}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1px solid ${T.border}`, background: "none", color: T.t3, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}
            >
              Skip for now
            </button>
          </Card>
        </div>
      )}

      <TopBar
        title={`${greeting}, ${user?.full_name?.split(" ")[0] || "there"} 👋`}
        sub={`${monthLabel} overview`}
      />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 14, marginBottom: 22, minWidth: 0 }}>
        <StatCard label="Net Balance" value={fmt(balance)} sub={`Savings rate: ${rate}%`} trend={balance >= 0 ? 1 : 0} Icon={Wallet} color={T.primary} />
        <StatCard label="This Month Income" value={fmt(income)} sub={`${monthTx.filter((t) => t.type === "income").length} credits`} trend={1} Icon={TrendingUp} color={T.green} />
        <StatCard label="This Month Expenses" value={fmt(expense)} sub={`${monthTx.filter((t) => t.type === "expense").length} debits`} trend={0} Icon={TrendingDown} color={T.red} />
        <StatCard label="Savings Rate" value={`${rate}%`} sub={Number(rate) >= 30 ? "Target: 30% ✅" : "Target: 30%"} trend={Number(rate) >= 30 ? 1 : 0} Icon={PiggyBank} color={T.purple} />
      </div>

      {/* Pie + Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.7fr 1fr", gap: 14, marginBottom: 22, minWidth: 0, overflow: "hidden" }}>
        <Card style={{ padding: "20px 22px" }}>
          <h3 style={{ color: T.t1, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
            This Month — Expense Breakdown
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="99%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={75} paddingAngle={3} dataKey="v">
                  {pieData.map((e, i) => <Cell key={i} fill={e.c} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: T.t3, fontSize: 13, padding: "32px 0", textAlign: "center" }}>No expenses this month yet</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 6, overflow: "hidden" }}>
            {pieData.slice(0, 4).map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, overflow: "hidden" }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: d.c, flexShrink: 0 }} />
                  <span style={{ color: T.t2, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                </div>
                <span style={{ color: T.t1, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{fmt(d.v)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ color: T.t1, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Quick Stats</h3>
          {[
            ["This Month Txns", monthTx.length, T.t1],
            ["Income Credits", monthTx.filter((t) => t.type === "income").length, T.green],
            ["Expense Debits", monthTx.filter((t) => t.type === "expense").length, T.red],
          ].map(([label, val, color]) => (
            <div key={label} style={{ background: T.bg3, borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ color: T.t3, fontSize: 11 }}>{label}</p>
              <p style={{ color, fontSize: 20, fontWeight: 700 }}>{val}</p>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent + Goals */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: 14, minWidth: 0, overflow: "hidden" }}>
        <Card style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: T.t1, fontSize: 14, fontWeight: 600 }}>Recent Transactions</h3>
            <button onClick={() => setPage("transactions")} style={{ color: T.primary, fontSize: 12, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
              View All <ChevronRight size={12} />
            </button>
          </div>
          {recent.length === 0 ? (
            <p style={{ color: T.t3, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No transactions this month yet</p>
          ) : (
            recent.map((tx) => {
              const cat = CAT(tx.category);
              const Icon = cat.icon;
              return (
                <div key={tx.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 11 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: cat.color + "1C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color={cat.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: T.t1, fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>{tx.title}</p>
                    <p style={{ color: T.t3, fontSize: 11, marginTop: 2, textAlign: "left" }}>{fmtDate(tx.date)} · {cat.label}</p>
                  </div>
                  <span style={{ color: tx.type === "income" ? T.green : T.red, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </Card>
        <Card style={{ padding: "20px 22px" }}>
          <h3 style={{ color: T.t1, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Savings Goals</h3>
          {goals.length === 0 ? (
            <p style={{ color: T.t3, fontSize: 13, textAlign: "center", padding: "24px 0" }}>No goals yet</p>
          ) : (
            goals.map((g) => {
              const pct = Math.round((g.saved / g.target_amount) * 100);
              return (
                <div key={g.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ color: T.t1, fontSize: 12, fontWeight: 500 }}>{g.icon} {g.name}</span>
                    <span style={{ color: g.color || T.primary, fontSize: 12, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <ProgressBar pct={pct} color={g.color || T.primary} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ color: T.t3, fontSize: 10 }}>{fmt(g.saved)}</span>
                    <span style={{ color: T.t3, fontSize: 10 }}>{fmt(g.target_amount)}</span>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TRANSACTIONS PAGE
// ─────────────────────────────────────────────
const EMPTY_FORM = {
  title: "",
  amount: "",
  type: "expense",
  category: "food",
  date: new Date().toISOString().slice(0, 10),
  note: "",
  linked_goal_id: "",
};

const TransactionsPage = () => {
  const isMobile = useMobile();
  const { toggle } = useContext(MobileMenuCtx);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("all");
  const [catF, setCatF] = useState("all");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formErr, setFormErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tx, goals] = await Promise.all([api.getTx(), api.getGoals()]);
      setTransactions(tx);
      setGoals(goals);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const list = transactions
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => typeF === "all" || t.type === typeF)
    .filter((t) => catF === "all" || t.category === catF)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormErr("");
    setModal(true);
  };
  const openEdit = (tx) => {
    setEditId(tx.id);
    setForm({
      title: tx.title,
      amount: String(tx.amount),
      type: tx.type,
      category: tx.category,
      date: tx.date,
      note: tx.note || "",
      linked_goal_id: tx.linked_goal_id ? String(tx.linked_goal_id) : "",
    });
    setFormErr("");
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.amount) {
      setFormErr("Title and amount are required");
      return;
    }
    setSaving(true);
    setFormErr("");
    try {
      const body = {
        ...form,
        amount: parseFloat(form.amount),
        linked_goal_id: form.linked_goal_id
          ? Number(form.linked_goal_id)
          : null,
      };
      if (editId) await api.updateTx(editId, body);
      else await api.addTx(body);
      await load();
      setModal(false);
    } catch (e) {
      setFormErr(e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.deleteTx(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const inp = (key, type = "text", placeholder = "", label = "") => (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label
          style={{
            color: T.t2,
            fontSize: 11,
            fontWeight: 500,
            display: "block",
            marginBottom: 5,
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        style={{
          width: "100%",
          background: T.bg3,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: "10px 13px",
          color: T.t1,
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
        }}
      />
    </div>
  );

  if (loading) return <PageLoader />;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "flex-start",
          gap: isMobile ? 12 : 0,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <button
                onClick={toggle}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  border: `1px solid ${T.border}`,
                  background: T.bg3,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Menu size={17} color={T.t2} />
              </button>
            )}
            <h1
              style={{
                color: T.t1,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Transactions
            </h1>
          </div>
          <p style={{ color: T.t2, fontSize: 13, marginTop: 4 }}>
            {list.length} transactions
          </p>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button
            onClick={() => exportToCSV(list)}
            style={{
              background: T.greenDim,
              color: T.green,
              border: `1px solid ${T.green}40`,
              borderRadius: 10,
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "inherit",
            }}
          >
            <Download size={14} />
            CSV
          </button>
          <button
            onClick={() => exportToExcel(list)}
            style={{
              background: T.bg3,
              color: T.t2,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "inherit",
            }}
          >
            <Download size={14} />
            Excel
          </button>
          <button
            onClick={() => exportToPDF(list)}
            style={{
              background: T.primaryDim,
              color: T.primary,
              border: `1px solid ${T.primary}40`,
              borderRadius: 10,
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "inherit",
            }}
          >
            <Download size={14} />
            PDF
          </button>
          <button
            onClick={openAdd}
            style={{
              background: T.primary,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "inherit",
            }}
          >
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>
      <ErrorMsg msg={error} />
      <Card style={{ padding: "14px 18px", marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <Search
              size={14}
              color={T.t3}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              style={{
                width: "100%",
                background: T.bg3,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "8px 12px 8px 32px",
                color: T.t1,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>
          <Chip
            label="All"
            active={typeF === "all"}
            onClick={() => setTypeF("all")}
          />
          <Chip
            label="↑ Income"
            active={typeF === "income"}
            onClick={() => setTypeF("income")}
          />
          <Chip
            label="↓ Expense"
            active={typeF === "expense"}
            onClick={() => setTypeF("expense")}
          />
          <select
            value={catF}
            onChange={(e) => setCatF(e.target.value)}
            style={{
              background: T.bg3,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "7px 12px",
              color: T.t2,
              fontSize: 13,
              fontFamily: "inherit",
            }}
          >
            <option value="all">All Categories</option>
            {CATS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </Card>
      <Card style={{ padding: "4px 0" }}>
        {list.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "48px 24px", color: T.t3 }}
          >
            <Package
              size={32}
              color={T.t3}
              style={{ marginBottom: 10, opacity: 0.5 }}
            />
            <p style={{ fontSize: 14 }}>No transactions found</p>
          </div>
        ) : (
          list.map((tx, i) => {
            const cat = CAT(tx.category);
            const Icon = cat.icon;
            return (
              <div
                key={tx.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "13px 18px",
                  borderBottom:
                    i < list.length - 1 ? `1px solid ${T.border}` : "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.bg3)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: cat.color + "1C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color={cat.color} />
                </div>
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                  }}
                >
                  <p
                    style={{
                      color: T.t1,
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: "left",
                    }}
                  >
                    {tx.title}
                  </p>
                  <p
                    style={{
                      color: T.t3,
                      fontSize: 11,
                      marginTop: 2,
                      textAlign: "left",
                    }}
                  >
                    {fmtDate(tx.date)} · {cat.label}
                    {tx.linked_goal_id
                      ? `, Goal: ${goals.find((goal) => goal.id === tx.linked_goal_id)?.name || "Linked goal"}`
                      : ""}
                  </p>
                </div>
                <span
                  style={{
                    color: tx.type === "income" ? T.green : T.red,
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginRight: 12,
                  }}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {fmt(tx.amount)}
                </span>
                <button
                  onClick={() => openEdit(tx)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: T.t3,
                    padding: 6,
                    borderRadius: 7,
                  }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(tx.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: T.red + "88",
                    padding: 6,
                    borderRadius: 7,
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </Card>
      {/* Modal */}
      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Card style={{ width: "100%", maxWidth: 440, padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ color: T.t1, fontSize: 16, fontWeight: 700 }}>
                {editId ? "Edit Transaction" : "Add Transaction"}
              </h3>
              <button
                onClick={() => setModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.t3,
                }}
              >
                <X size={18} />
              </button>
            </div>
            <ErrorMsg msg={formErr} />
            {inp("title", "text", "Description", "Title")}
            {inp("amount", "number", "0.00", "Amount")}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  color: T.t2,
                  fontSize: 11,
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
                style={{
                  width: "100%",
                  background: T.bg3,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "10px 13px",
                  color: T.t1,
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  color: T.t2,
                  fontSize: 11,
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                style={{
                  width: "100%",
                  background: T.bg3,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "10px 13px",
                  color: T.t1,
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
              >
                {CATS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  color: T.t2,
                  fontSize: 11,
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Savings Goal
              </label>
              <select
                value={form.linked_goal_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, linked_goal_id: e.target.value }))
                }
                style={{
                  width: "100%",
                  background: T.bg3,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "10px 13px",
                  color: T.t1,
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
              >
                <option value="">None</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name}
                  </option>
                ))}
              </select>
            </div>
            {inp("date", "date", "", "Date")}
            {inp("note", "text", "Optional note", "Note")}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 9,
                  border: `1px solid ${T.border}`,
                  background: "none",
                  color: T.t2,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 9,
                  border: "none",
                  background: T.primary,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {saving ? <Spinner size={14} color="#fff" /> : null}{" "}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// ANALYTICS PAGE (uses real transactions)
// ─────────────────────────────────────────────
const AnalyticsPage = () => {
  const isMobile = useMobile();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(todayKey);

  useEffect(() => {
    api
      .getTx()
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const fmtMonthLabel = (key) => {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
  };

  const getPrevKey = (key) => {
    const [y, m] = key.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // Build dropdown: 24 months back to current
  const monthOpts = [];
  {
    const [ty, tm] = todayKey.split("-").map(Number);
    for (let i = 0; i < 24; i++) {
      let mo = tm - i; let yr = ty;
      while (mo <= 0) { mo += 12; yr--; }
      monthOpts.push(`${yr}-${String(mo).padStart(2, "0")}`);
    }
  }

  const lastMonth = getPrevKey(selectedMonth);

  const selTx = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const lastTx = transactions.filter((t) => t.date.startsWith(lastMonth));

  const income = selTx.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const expense = selTx.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);

  const byCategory = {};
  selTx.filter((t) => t.type === "expense").forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });
  const catData = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, total]) => ({
      name: CAT(cat).label.split(" ")[0],
      total,
      fill: CATS.find((c) => c.id === cat)?.color || T.t2,
    }));

  const lastIncome = lastTx.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const lastExpense = lastTx.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  const compData = [
    { name: "Income", current: income, last: lastIncome },
    { name: "Expense", current: expense, last: lastExpense },
    { name: "Savings", current: Math.max(0, income - expense), last: Math.max(0, lastIncome - lastExpense) },
  ];

  const exportAnalyticsPDF = () => {
    const fmtR = (n) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.abs(n || 0));
    const rate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : "0.0";
    const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    // HTML/CSS bar chart helper
    const maxComp = Math.max(income, expense, lastIncome, lastExpense, 1);
    const compBars = compData.map(d => `
      <div class="comp-group">
        <div class="comp-label">${d.name}</div>
        <div class="comp-bars">
          <div style="flex:1">
            <div class="bar-track"><div class="bar-fill" style="width:${(d.current/maxComp*100).toFixed(1)}%;background:#4E7EF5"></div></div>
            <div class="bar-sub">${fmtR(d.current)}</div>
          </div>
          <div style="flex:1">
            <div class="bar-track"><div class="bar-fill" style="width:${(d.last/maxComp*100).toFixed(1)}%;background:#A67CF8"></div></div>
            <div class="bar-sub">${fmtR(d.last)}</div>
          </div>
        </div>
      </div>`).join("");

    const maxCat = Math.max(...catData.map(c => c.total), 1);
    const catBars = catData.length > 0 ? catData.map(c => `
      <div class="bar-row">
        <div class="bar-label">${c.name}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(c.total/maxCat*100).toFixed(1)}%;background:${c.fill}"></div>
          <span class="bar-value">${fmtR(c.total)}</span>
        </div>
      </div>`).join("") : "<p style='color:#9ca3af;font-size:12px'>No expense data</p>";

    const catColor = (cat) => CATS.find(c => c.id === cat)?.color || "#9ca3af";
    const txRows = [...selTx]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((t, i) => {
        const isIncome = t.type === "income";
        const rowBg = i % 2 === 0 ? "#ffffff" : "#f9fafb";
        const borderColor = isIncome ? "#059669" : "#dc2626";
        const amtColor = isIncome ? "#059669" : "#dc2626";
        const amtBg = isIncome ? "#ecfdf5" : "#fef2f2";
        const catLabel = CAT(t.category).label;
        const cc = catColor(t.category);
        const dateObj = new Date(t.date);
        const dateStr = dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        return `<tr style="background:${rowBg};border-left:3px solid ${borderColor}">
          <td style="color:#6b7280;font-size:11px;white-space:nowrap">${dateStr}</td>
          <td><div style="font-weight:600;color:#111;font-size:12px">${t.title}</div>${t.note ? `<div style="font-size:10px;color:#9ca3af;margin-top:2px">${t.note}</div>` : ""}</td>
          <td><span style="display:inline-flex;align-items:center;gap:5px;background:#f3f4f6;border-radius:20px;padding:3px 9px;font-size:10px;font-weight:600;color:#444"><span style="width:7px;height:7px;border-radius:50%;background:${cc};display:inline-block;flex-shrink:0"></span>${catLabel}</span></td>
          <td><span style="display:inline-block;background:${amtBg};color:${amtColor};font-weight:700;font-size:12px;padding:4px 10px;border-radius:6px;white-space:nowrap">${isIncome ? "+" : "−"}${fmtR(t.amount)}</span></td>
          <td style="color:#9ca3af;font-size:11px">${t.note && !isIncome ? `<span style="background:#fffbeb;color:#92400e;font-size:10px;padding:2px 7px;border-radius:4px">${t.note}</span>` : "—"}</td>
        </tr>`;
      }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>Finance Report — ${fmtMonthLabel(selectedMonth)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;padding:32px 40px;color:#1e293b;background:linear-gradient(145deg,#eef2ff 0%,#f0fdf4 50%,#fdf4ff 100%);font-size:13px;display:flex;flex-direction:column;min-height:100vh}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;padding:20px 24px;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1d4ed8 100%);border-radius:14px;margin-bottom:20px}
.logo{font-size:22px;font-weight:800;color:#fff}
.logo .accent{color:#60a5fa}.logo .ai{color:#34d399}
.header-meta{font-size:11px;color:#94a3b8;margin-top:4px}
.header-right{text-align:right}
.month-title{font-size:14px;font-weight:700;color:#fff;margin-bottom:2px}
.generated{font-size:10px;color:#93c5fd}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.sc{background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.08);border-top:4px solid transparent}
.sc-label{font-size:10px;text-transform:uppercase;color:#94a3b8;font-weight:700;margin-bottom:6px;letter-spacing:.06em}
.sc-value{font-size:22px;font-weight:800;line-height:1}
.sc-sub{font-size:10px;color:#94a3b8;margin-top:5px}
.section{background:#fff;border-radius:12px;padding:20px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,.07)}
.section-title{font-size:14px;font-weight:800;color:#0f172a;margin-bottom:3px}
.section-sub{font-size:11px;color:#94a3b8;margin-bottom:14px}
.legend{display:flex;gap:20px;margin-bottom:14px;font-size:11px;color:#475569}
.ld{width:10px;height:10px;border-radius:2px;display:inline-block;margin-right:5px;vertical-align:middle}
.comp-group{margin-bottom:14px}
.comp-label{font-size:10px;font-weight:700;color:#475569;margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em}
.comp-bars{display:flex;gap:6px}
.comp-bars>div{flex:1}
.bar-track{height:22px;background:#f1f5f9;border-radius:6px;position:relative;overflow:hidden;margin-bottom:3px;flex:1}
.bar-fill{height:100%;border-radius:6px;min-width:3px}
.bar-sub{font-size:10px;color:#64748b;font-weight:600}
.bar-row{display:flex;align-items:center;gap:10px;margin-bottom:9px}
.bar-label{width:110px;font-size:11px;color:#334155;flex-shrink:0;font-weight:600;text-align:right}
.bar-outer{flex:1;background:#f1f5f9;border-radius:6px;height:22px;position:relative;overflow:hidden}
.bar-inner{height:100%;border-radius:6px;min-width:3px}
.bar-amount{font-size:10px;font-weight:700;color:#334155;white-space:nowrap;flex-shrink:0;width:80px;text-align:right}
table{width:100%;border-collapse:separate;border-spacing:0;border-radius:10px;overflow:hidden}
thead tr{background:linear-gradient(135deg,#1e3a5f,#1d4ed8)}
th{padding:12px 14px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;color:#fff;letter-spacing:.08em}
td{padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:12px;vertical-align:middle}
tr:last-child td{border-bottom:none}
.inc{color:#059669;font-weight:700}.exp{color:#dc2626;font-weight:700}
.footer{margin-top:auto;padding:14px 20px;background:#fff;border-radius:10px;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#94a3b8;box-shadow:0 2px 8px rgba(0,0,0,.06)}
@media print{@page{margin:10mm}body{padding:16px 20px;background:#eef2ff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head>
<body>
<div class="header">
  <div>
    <div class="logo">Nagendra's <span class="accent">Finance</span><span class="ai">AI</span></div>
    <div class="header-meta">Smart Finance Hub</div>
  </div>
  <div class="header-right">
    <div class="month-title">Monthly Report — ${fmtMonthLabel(selectedMonth)}</div>
    <div class="generated">Generated on ${today}</div>
  </div>
</div>

<div class="summary">
  <div class="sc" style="border-top-color:#059669"><div class="sc-label">Total Income</div><div class="sc-value" style="color:#059669">${fmtR(income)}</div><div class="sc-sub">${selTx.filter(t=>t.type==="income").length} credits</div></div>
  <div class="sc" style="border-top-color:#dc2626"><div class="sc-label">Total Expense</div><div class="sc-value" style="color:#dc2626">${fmtR(expense)}</div><div class="sc-sub">${selTx.filter(t=>t.type==="expense").length} debits</div></div>
  <div class="sc" style="border-top-color:#1d4ed8"><div class="sc-label">Net Savings</div><div class="sc-value" style="color:#1d4ed8">${fmtR(income-expense)}</div><div class="sc-sub">${rate}% savings rate</div></div>
  <div class="sc" style="border-top-color:#7c3aed"><div class="sc-label">Transactions</div><div class="sc-value" style="color:#7c3aed">${selTx.length}</div><div class="sc-sub">this month</div></div>
</div>

<div class="section">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
    <div>
      <div class="section-title">Transactions</div>
      <div class="section-sub" style="margin-bottom:0">${fmtMonthLabel(selectedMonth)} &mdash; ${selTx.length} total</div>
    </div>
    <div style="display:flex;gap:10px;font-size:11px">
      <span style="background:#ecfdf5;color:#059669;padding:4px 10px;border-radius:20px;font-weight:600">&#8593; ${selTx.filter(t=>t.type==="income").length} income</span>
      <span style="background:#fef2f2;color:#dc2626;padding:4px 10px;border-radius:20px;font-weight:600">&#8595; ${selTx.filter(t=>t.type==="expense").length} expenses</span>
    </div>
  </div>
  <table>
    <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Note</th></tr></thead>
    <tbody>${txRows || '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:24px">No transactions this month</td></tr>'}</tbody>
  </table>
</div>

<div class="section">
  <div class="section-title">Month Comparison</div>
  <div class="section-sub">${fmtMonthLabel(selectedMonth)} vs ${fmtMonthLabel(lastMonth)}</div>
  <div class="legend">
    <span><span class="ld" style="background:#4E7EF5"></span>${fmtMonthLabel(selectedMonth)}</span>
    <span><span class="ld" style="background:#A67CF8"></span>${fmtMonthLabel(lastMonth)}</span>
  </div>
  ${compBars}
</div>

<div class="section">
  <div class="section-title">Spending by Category</div>
  <div class="section-sub">${fmtMonthLabel(selectedMonth)}</div>
  ${catBars}
</div>

<div class="footer">
  <span style="font-weight:600;color:#475569">&copy; ${new Date().getFullYear()} <span style="color:#1d4ed8">Nagendra's Finance AI</span> &mdash; Smart Finance Hub</span>
  <span>&#128274; Confidential &middot; For personal use only</span>
</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) win.addEventListener("load", () => setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 500));
  };

  return (
    <div>
      <TopBar title="Analytics" sub="Visual breakdown of your spending" />

      {/* Month Picker + Export */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <label style={{ color: T.t3, fontSize: 12, flexShrink: 0 }}>Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            flex: 1,
            background: T.bg3,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "8px 12px",
            color: T.t1,
            fontSize: 13,
            outline: "none",
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          {monthOpts.map((key) => (
            <option key={key} value={key} style={{ background: T.bg2 }}>
              {fmtMonthLabel(key)}{key === todayKey ? " (Current)" : ""}
            </option>
          ))}
        </select>
        <button
          onClick={exportAnalyticsPDF}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${T.primary}40`,
            background: T.primaryDim,
            color: T.primary,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          <Download size={13} />
          Export PDF
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        <StatCard
          label="Total Income"
          value={fmt(income)}
          sub={`${selTx.filter((t) => t.type === "income").length} transactions`}
          trend={1}
          Icon={TrendingUp}
          color={T.green}
        />
        <StatCard
          label="Total Expense"
          value={fmt(expense)}
          sub={`${selTx.filter((t) => t.type === "expense").length} transactions`}
          trend={0}
          Icon={TrendingDown}
          color={T.red}
        />
        <StatCard
          label="Net Savings"
          value={fmt(income - expense)}
          sub={income > 0 ? `${(((income - expense) / income) * 100).toFixed(1)}% rate` : "—"}
          trend={1}
          Icon={PiggyBank}
          color={T.purple}
        />
      </div>

      {/* Current vs Last Month Comparison */}
      <Card style={{ padding: "20px 22px", marginBottom: 14 }}>
        <h3 style={{ color: T.t1, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
          Month Comparison
        </h3>
        <p style={{ color: T.t3, fontSize: 11, marginBottom: 16 }}>
          {fmtMonthLabel(selectedMonth)} vs {fmtMonthLabel(lastMonth)}
        </p>
        <ResponsiveContainer width="99%" height={220}>
          <BarChart data={compData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="name" tick={{ fill: T.t3, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.t3, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
            <Tooltip
              contentStyle={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 12, color: T.t1 }}
              formatter={(v, name) => [fmt(v), name === "current" ? fmtMonthLabel(selectedMonth) : fmtMonthLabel(lastMonth)]}
            />
            <Legend
              formatter={(v) => <span style={{ color: T.t2, fontSize: 11 }}>{v === "current" ? fmtMonthLabel(selectedMonth) : fmtMonthLabel(lastMonth)}</span>}
            />
            <Bar dataKey="current" name="current" fill={T.primary} radius={[5, 5, 0, 0]} />
            <Bar dataKey="last" name="last" fill={T.purple} radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Spending by Category */}
      <Card style={{ padding: "20px 22px", marginBottom: 14 }}>
        <h3 style={{ color: T.t1, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          Spending by Category
        </h3>
        {catData.length > 0 ? (
          <ResponsiveContainer width="99%" height={240}>
            <BarChart data={catData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="name" tick={{ fill: T.t3, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.t3, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
              <Tooltip content={<CTip />} />
              <Bar dataKey="total" name="Spent" radius={[6, 6, 0, 0]}>
                {catData.map((e, i) => (
                  <Cell key={i} fill={e.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: T.t3, textAlign: "center", padding: 32 }}>
            No expense data for {fmtMonthLabel(selectedMonth)}
          </p>
        )}
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// BUDGET & GOALS PAGE
// ─────────────────────────────────────────────
const BudgetPage = () => {
  const isMobile = useMobile();
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [goalModal, setGoalModal] = useState(false);
  const [editGoalId, setEditGoalId] = useState(null);
  const [fundModal, setFundModal] = useState(null);
  const [fundAmount, setFundAmount] = useState("");
  const [budgetModal, setBudgetModal] = useState(false);
  const [editBudgetId, setEditBudgetId] = useState(null);
  const [gForm, setGForm] = useState({
    name: "",
    target_amount: "",
    icon: "🎯",
    color: T.primary,
  });
  const [bForm, setBForm] = useState({
    category: "food",
    limit_amount: "",
    icon: "💰",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, g, txs] = await Promise.all([
        api.getBudgets(),
        api.getGoals(),
        api.getTx(),
      ]);
      setBudgets(b);
      setGoals(g);
      setTransactions(txs);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAddGoal = () => {
    setEditGoalId(null);
    setGForm({ name: "", target_amount: "", icon: "🎯", color: T.primary });
    setGoalModal(true);
  };

  const openEditGoal = (g) => {
    setEditGoalId(g.id);
    setGForm({
      name: g.name,
      target_amount: String(g.target_amount),
      icon: g.icon || "🎯",
      color: g.color || T.primary,
    });
    setGoalModal(true);
  };

  const saveGoal = async () => {
    if (!gForm.name || !gForm.target_amount) return;
    setSaving(true);
    try {
      const body = { ...gForm, target_amount: parseFloat(gForm.target_amount) };
      if (editGoalId) {
        await api.updateGoal(editGoalId, body);
      } else {
        await api.addGoal(body);
      }
      await load();
      setGoalModal(false);
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  const addFunds = async () => {
    const amt = parseFloat(fundAmount);
    if (!amt || !fundModal) return;
    setSaving(true);
    try {
      await api.addTx({
        title: `Contribution — ${fundModal.name}`,
        amount: amt,
        type: "expense",
        category: "invest",
        date: new Date().toISOString().slice(0, 10),
        note: `Savings contribution to goal: ${fundModal.name}`,
        linked_goal_id: fundModal.id,
      });
      await load();
      setFundModal(null);
      setFundAmount("");
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  const openAddBudget = () => {
    setEditBudgetId(null);
    setBForm({ category: "food", limit_amount: "", icon: "💰" });
    setBudgetModal(true);
  };

  const openEditBudget = (b) => {
    setEditBudgetId(b.id);
    setBForm({ category: b.category, limit_amount: String(b.limit_amount), icon: b.icon || "💰" });
    setBudgetModal(true);
  };

  const saveBudget = async () => {
    if (!bForm.category || !bForm.limit_amount) return;
    setSaving(true);
    try {
      const body = { ...bForm, limit_amount: parseFloat(bForm.limit_amount) };
      if (editBudgetId) {
        await api.updateBudget(editBudgetId, body);
      } else {
        await api.addBudget(body);
      }
      await load();
      setBudgetModal(false);
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  const deleteGoal = async (id) => {
    if (window.confirm("Delete goal?")) {
      await api.deleteGoal(id);
      await load();
    }
  };
  const deleteBudget = async (id) => {
    if (window.confirm("Delete budget?")) {
      await api.deleteBudget(id);
      await load();
    }
  };


  if (loading) return <PageLoader />;

  const entertainTxs = transactions
    .filter((t) => t.category === "entertain")
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalEntertain = entertainTxs.reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <TopBar
        title="Budget & Goals"
        sub="Track spending limits and savings targets"
      />
      <ErrorMsg msg={error} />
      {/* Budgets */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ color: T.t1, fontSize: 16, fontWeight: 700 }}>
          Monthly Budgets
        </h2>
        <button
          onClick={openAddBudget}
          style={{
            background: T.primaryDim,
            color: T.primary,
            border: `1px solid ${T.primary}40`,
            borderRadius: 9,
            padding: "7px 14px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={13} />
          Add Budget
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(280px,1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {budgets.map((b) => {
          const cat = CAT(b.category);
          const Icon = cat.icon;
          const pct =
            b.limit_amount > 0
              ? Math.round((b.spent / b.limit_amount) * 100)
              : 0;
          const over = b.spent > b.limit_amount;
          return (
            <Card key={b.id} style={{ padding: "16px 18px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: cat.color + "1C",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={15} color={cat.color} />
                  </div>
                  <div>
                    <p style={{ color: T.t1, fontSize: 13, fontWeight: 600 }}>
                      {cat.label}
                    </p>
                    <p style={{ color: over ? T.red : T.t3, fontSize: 11 }}>
                      {over ? "Over budget!" : pct + "% used"}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => openEditBudget(b)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.t3,
                      padding: 4,
                    }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => deleteBudget(b.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.red + "66",
                      padding: 4,
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <ProgressBar
                pct={pct}
                color={over ? T.red : cat.color}
                height={5}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <span
                  style={{
                    color: over ? T.red : T.t1,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {fmt(b.spent)}
                </span>
                <span style={{ color: T.t3, fontSize: 12 }}>
                  of {fmt(b.limit_amount)}
                </span>
              </div>
            </Card>
          );
        })}
        {budgets.length === 0 && (
          <p style={{ color: T.t3, fontSize: 13, padding: "16px 0" }}>
            No budgets set yet. Add one to start tracking!
          </p>
        )}
      </div>

      {/* Goals */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ color: T.t1, fontSize: 16, fontWeight: 700 }}>
          Savings Goals
        </h2>
        <button
          onClick={openAddGoal}
          style={{
            background: T.greenDim,
            color: T.green,
            border: `1px solid ${T.green}40`,
            borderRadius: 9,
            padding: "7px 14px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={13} />
          Add Goal
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(280px,1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {goals.map((g) => {
          const pct =
            g.target_amount > 0
              ? Math.round((g.saved / g.target_amount) * 100)
              : 0;
          return (
            <Card key={g.id} style={{ padding: "16px 18px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <p style={{ color: T.t1, fontSize: 14, fontWeight: 600 }}>
                  {g.icon} {g.name}
                </p>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <button
                    onClick={() => { setFundModal(g); setFundAmount(""); }}
                    title="Add funds"
                    style={{
                      background: T.greenDim,
                      border: `1px solid ${T.green}40`,
                      borderRadius: 6,
                      cursor: "pointer",
                      color: T.green,
                      padding: "3px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "inherit",
                    }}
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => openEditGoal(g)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.t3,
                      padding: 4,
                    }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.red + "66",
                      padding: 4,
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <ProgressBar pct={pct} color={g.color || T.primary} height={6} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <span style={{ color: T.t1, fontSize: 12, fontWeight: 600 }}>
                  {fmt(g.saved)}
                </span>
                <span
                  style={{
                    color: g.color || T.primary,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {pct}%
                </span>
                <span style={{ color: T.t3, fontSize: 12 }}>
                  {fmt(g.target_amount)}
                </span>
              </div>
            </Card>
          );
        })}
        {goals.length === 0 && (
          <p style={{ color: T.t3, fontSize: 13, padding: "16px 0" }}>
            No goals yet. Add one to start saving!
          </p>
        )}
      </div>

      {/* Subscriptions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h2 style={{ color: T.t1, fontSize: 16, fontWeight: 700 }}>
          Entertainment
        </h2>
        <span
          style={{
            fontSize: 11,
            color: T.t3,
            background: T.bg3,
            border: `1px solid ${T.border}`,
            borderRadius: 6,
            padding: "4px 10px",
          }}
        >
          Auto-synced from Transactions
        </span>
      </div>
      <Card style={{ marginBottom: 24 }}>
        {entertainTxs.map((t, i) => {
          const cat = CAT(t.category);
          const Icon = cat.icon;
          return (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "13px 18px",
                borderBottom:
                  i < entertainTxs.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: cat.color + "1C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={15} color={cat.color} />
                </div>
                <div>
                  <p style={{ color: T.t1, fontSize: 13, fontWeight: 500 }}>
                    {t.title}
                  </p>
                  <p style={{ color: T.t3, fontSize: 11, marginTop: 2 }}>
                    {fmtDate(t.date)}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
              </div>
              <span style={{ color: T.red, fontSize: 13, fontWeight: 700 }}>
                -{fmt(t.amount)}
              </span>
            </div>
          );
        })}
        {entertainTxs.length === 0 && (
          <p style={{ color: T.t3, fontSize: 13, padding: "18px 18px" }}>
            No entertainment transactions yet. Add one in the Transactions page.
          </p>
        )}
        {entertainTxs.length > 0 && (
          <div
            style={{ padding: "12px 18px", borderTop: `1px solid ${T.border}` }}
          >
            <p style={{ color: T.t2, fontSize: 12 }}>
              Total spent:{" "}
              <span style={{ color: T.red, fontWeight: 700 }}>
                {fmt(totalEntertain)}
              </span>
            </p>
          </div>
        )}
      </Card>

      {/* Goal Modal */}
      {goalModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Card style={{ width: "100%", maxWidth: 380, padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h3 style={{ color: T.t1, fontSize: 15, fontWeight: 700 }}>
                {editGoalId ? "Edit Goal" : "New Savings Goal"}
              </h3>
              <button
                onClick={() => setGoalModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.t3,
                }}
              >
                <X size={18} />
              </button>
            </div>
            {[
              ["name", "text", "Goal name", "Name"],
              ["target_amount", "number", "Target amount (₹)", "Target"],
              ["icon", "text", "Emoji icon", "Icon"],
              ["color", "color", "", "Color"],
            ].map(([k, t, p, l]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <label
                  style={{
                    color: T.t2,
                    fontSize: 11,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {l}
                </label>
                <input
                  type={t}
                  value={gForm[k]}
                  onChange={(e) =>
                    setGForm((f) => ({ ...f, [k]: e.target.value }))
                  }
                  placeholder={p}
                  style={{
                    width: "100%",
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "9px 13px",
                    color: T.t1,
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            ))}
            <button
              onClick={saveGoal}
              disabled={saving}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 9,
                border: "none",
                background: T.green,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {saving ? <Spinner size={14} color="#fff" /> : null}{" "}
              {saving ? "Saving…" : editGoalId ? "Update Goal" : "Add Goal"}
            </button>
          </Card>
        </div>
      )}

      {/* Add Funds Modal */}
      {fundModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Card style={{ width: "100%", maxWidth: 340, padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h3 style={{ color: T.t1, fontSize: 15, fontWeight: 700 }}>
                Add Funds — {fundModal.icon} {fundModal.name}
              </h3>
              <button
                onClick={() => setFundModal(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: T.t3 }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ color: T.t3, fontSize: 12, marginBottom: 14 }}>
              Saved: {fmt(fundModal.saved)} / {fmt(fundModal.target_amount)}
            </p>
            <label style={{ color: T.t2, fontSize: 11, display: "block", marginBottom: 5 }}>
              Amount to add (₹)
            </label>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="e.g. 500"
              autoFocus
              style={{
                width: "100%",
                background: T.bg3,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "10px 13px",
                color: T.t1,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                marginBottom: 16,
              }}
            />
            <button
              onClick={addFunds}
              disabled={saving || !fundAmount}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 9,
                border: "none",
                background: T.green,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {saving ? <Spinner size={14} color="#fff" /> : null}
              {saving ? "Saving…" : "Add Funds"}
            </button>
          </Card>
        </div>
      )}

      {/* Budget Modal */}
      {budgetModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Card style={{ width: "100%", maxWidth: 360, padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h3 style={{ color: T.t1, fontSize: 15, fontWeight: 700 }}>
                {editBudgetId ? "Edit Budget" : "New Budget"}
              </h3>
              <button
                onClick={() => setBudgetModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.t3,
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  color: T.t2,
                  fontSize: 11,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Category
              </label>
              <select
                value={bForm.category}
                onChange={(e) =>
                  setBForm((f) => ({ ...f, category: e.target.value }))
                }
                style={{
                  width: "100%",
                  background: T.bg3,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "9px 13px",
                  color: T.t1,
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
              >
                {CATS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  color: T.t2,
                  fontSize: 11,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Monthly Limit (₹)
              </label>
              <input
                type="number"
                value={bForm.limit_amount}
                onChange={(e) =>
                  setBForm((f) => ({ ...f, limit_amount: e.target.value }))
                }
                placeholder="e.g. 8000"
                style={{
                  width: "100%",
                  background: T.bg3,
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: "9px 13px",
                  color: T.t1,
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <button
              onClick={saveBudget}
              disabled={saving}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 9,
                border: "none",
                background: T.primary,
                color: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {saving ? <Spinner size={14} color="#fff" /> : null}{" "}
              {saving ? "Saving…" : editBudgetId ? "Update Budget" : "Add Budget"}
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// SETTINGS PAGE
// ─────────────────────────────────────────────
const SettingsPage = ({ user, onUserUpdate, onLogout }) => {
  const isMobile = useMobile();
  const [profile, setProfile] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
  });
  const [showPwModal, setShowPwModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [salaryInput, setSalaryInput] = useState("");
  const [savingSalary, setSavingSalary] = useState(false);

  const nowDate = new Date();
  const curMonthKey = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}`;
  const curMonthLabel = nowDate.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const [salaryMonth, setSalaryMonth] = useState(curMonthKey);

  // Build 24-month options for salary dropdown
  const salaryMonthOpts = [];
  {
    const [ty, tm] = curMonthKey.split("-").map(Number);
    for (let i = 0; i < 24; i++) {
      let mo = tm - i; let yr = ty;
      while (mo <= 0) { mo += 12; yr--; }
      salaryMonthOpts.push(`${yr}-${String(mo).padStart(2, "0")}`);
    }
  }
  const fmtSalaryMonthLabel = (key) => {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pr, pf, txs] = await Promise.all([
          api.getProfile(),
          api.getPrefs(),
          api.getTx(),
        ]);
        setProfile(pr);
        setPrefs(pf);
        setTransactions(txs);
        const existing = txs.find(
          (t) => t.type === "income" && t.category === "salary" && t.date.startsWith(curMonthKey)
        );
        if (existing) setSalaryInput(String(existing.amount));
        else setSalaryInput("");
        if (user?.is_admin) {
          const users = await api.getAdminUsers();
          setAdminUsers(users);
        }
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchAll();
  }, [user?.is_admin]);

  const togglePref = async (key) => {
    const currentVal = prefs?.[key] || 0;
    const newVal = !currentVal;
    setError("");
    setSuccess("");
    setPrefs((p) => ({ ...p, [key]: newVal ? 1 : 0 }));
    try {
      const updated = await api.updatePrefs({ [key]: newVal });
      setPrefs(updated);
      setSuccess("Preferences saved!");
    } catch (e) {
      setPrefs((p) => ({ ...p, [key]: currentVal }));
      setError(e.message);
    }
  };

  const saveProfile = async () => {
    setSaving("profile");
    setError("");
    setSuccess("");
    try {
      const updated = await api.updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        currency: profile.currency,
      });
      setProfile(updated);
      onUserUpdate?.(updated);
      setSuccess("Profile saved!");
    } catch (e) {
      setError(e.message);
    }
    setSaving("");
  };

  const changePassword = async () => {
    if (!pwForm.current_password || !pwForm.new_password) {
      setError("Both password fields required");
      return;
    }
    setSaving("password");
    setError("");
    setSuccess("");
    try {
      await api.changePassword(pwForm);
      setSuccess("Password changed!");
      setPwForm({ current_password: "", new_password: "" });
      setShowPwModal(false);
    } catch (e) {
      setError(e.message);
    }
    setSaving("");
  };

  const saveSalary = async () => {
    if (!salaryInput || isNaN(parseFloat(salaryInput))) return;
    setSavingSalary(true);
    setError("");
    setSuccess("");
    try {
      const monthLabel = fmtSalaryMonthLabel(salaryMonth);
      const existing = transactions.find(
        (t) => t.type === "income" && t.category === "salary" && t.date.startsWith(salaryMonth)
      );
      if (existing) {
        await api.updateTx(existing.id, { amount: parseFloat(salaryInput) });
      } else {
        await api.addTx({
          title: "Monthly Salary",
          amount: parseFloat(salaryInput),
          type: "income",
          category: "salary",
          date: `${salaryMonth}-01`,
          note: `Salary for ${monthLabel}`,
        });
        localStorage.setItem(`salary_prompted_${salaryMonth}`, "1");
      }
      const txs = await api.getTx();
      setTransactions(txs);
      setSuccess(`Salary saved for ${fmtSalaryMonthLabel(salaryMonth)}!`);
    } catch (e) {
      setError(e.message);
    }
    setSavingSalary(false);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.deleteUser(id);
      setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const Toggle = ({ k }) => {
    const on = !!prefs?.[k];
    return (
      <div
        onClick={() => togglePref(k)}
        style={{
          width: 42,
          height: 23,
          borderRadius: 12,
          flexShrink: 0,
          cursor: "pointer",
          background: on ? T.primary : T.bg3,
          border: `1px solid ${on ? T.primary : T.border}`,
          position: "relative",
          transition: "all 0.2s",
        }}
      >
        <div
          style={{
            width: 17,
            height: 17,
            borderRadius: 9,
            background: "#fff",
            position: "absolute",
            top: 2,
            left: on ? 21 : 2,
            transition: "left 0.2s",
          }}
        />
      </div>
    );
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <TopBar title="Settings" sub="Manage your profile and preferences" />
      {error && <ErrorMsg msg={error} />}
      {success && (
        <div
          style={{
            background: T.greenDim,
            border: `1px solid ${T.green}40`,
            borderRadius: 9,
            padding: "10px 14px",
            color: T.green,
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {success}
        </div>
      )}

      {/* Profile */}
      <Card style={{ padding: "24px", marginBottom: 14 }}>
        <h3
          style={{
            color: T.t1,
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Profile
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: 18,
              background: `linear-gradient(135deg,${T.green},${T.primary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {(profile?.full_name || "U")[0].toUpperCase()}
          </div>
          <div>
            <p style={{ color: T.t1, fontSize: 17, fontWeight: 700 }}>
              {profile?.full_name}
            </p>
            <p style={{ color: T.t2, fontSize: 13, marginTop: 3 }}>
              {profile?.email}
            </p>
            <Badge c={user?.is_admin ? T.yellow : T.green}>
              {user?.is_admin ? "Admin" : "Member"}
            </Badge>
          </div>
        </div>
        {profile && (
          <div
            style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}
          >
            {[
              ["Full Name", "full_name"],
              ["Phone", "phone"],
              ["Currency", "currency"],
            ].map(([l, k]) => (
              <div key={k}>
                <label
                  style={{
                    color: T.t3,
                    fontSize: 11,
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  {l}
                </label>
                <input
                  value={profile[k] || ""}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, [k]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "9px 13px",
                    color: T.t1,
                    fontSize: 13,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={saveProfile}
                disabled={saving === "profile"}
                style={{
                  padding: "9px 18px",
                  borderRadius: 9,
                  border: "none",
                  background: T.primary,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {saving === "profile" ? (
                  <Spinner size={13} color="#fff" />
                ) : null}
                {saving === "profile" ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </div>
        )}
        <div style={{ borderTop: `1px solid ${T.border}`, margin: "20px 0" }} />
        <button
          onClick={() => { setPwForm({ current_password: "", new_password: "" }); setShowPwModal(true); }}
          style={{
            padding: "9px 18px",
            borderRadius: 9,
            border: `1px solid ${T.border}`,
            background: T.bg3,
            color: T.t2,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Lock size={14} /> Change Password
        </button>
      </Card>

      {/* Change Password Modal */}
      {showPwModal && (
        <div
          onClick={() => setShowPwModal(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.bg2, borderRadius: 16, padding: 28,
              width: "100%", maxWidth: 420, border: `1px solid ${T.border}`,
            }}
          >
            <h3 style={{ color: T.t1, fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Change Password</h3>
            {[
              ["Current Password", "current_password"],
              ["New Password", "new_password"],
            ].map(([l, k]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ color: T.t3, fontSize: 11, display: "block", marginBottom: 5 }}>{l}</label>
                <input
                  type="password"
                  value={pwForm[k]}
                  onChange={(e) => setPwForm((f) => ({ ...f, [k]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && changePassword()}
                  placeholder={l}
                  style={{
                    width: "100%", background: T.bg3, border: `1px solid ${T.border}`,
                    borderRadius: 8, padding: "10px 13px", color: T.t1,
                    fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button
                onClick={() => setShowPwModal(false)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 9, border: `1px solid ${T.border}`,
                  background: T.bg3, color: T.t2, cursor: "pointer", fontFamily: "inherit",
                  fontSize: 13, fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={changePassword}
                disabled={saving === "password"}
                style={{
                  flex: 1, padding: "10px", borderRadius: 9, border: "none",
                  background: T.primary, color: "#fff", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6,
                }}
              >
                {saving === "password" ? <Spinner size={13} color="#fff" /> : null}
                {saving === "password" ? "Saving…" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Salary */}
      <Card style={{ padding: "24px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ color: T.t1, fontSize: 14, fontWeight: 600 }}>Monthly Salary</h3>
          {transactions.some(
            (t) => t.type === "income" && t.category === "salary" && t.date.startsWith(salaryMonth)
          ) && (
            <span style={{ fontSize: 10, background: T.greenDim, color: T.green, borderRadius: 6, padding: "3px 8px", fontWeight: 600 }}>
              Set
            </span>
          )}
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: T.t3, fontSize: 11, display: "block", marginBottom: 5 }}>Select Month</label>
          <select
            value={salaryMonth}
            onChange={(e) => {
              const newMonth = e.target.value;
              setSalaryMonth(newMonth);
              const existing = transactions.find(
                (t) => t.type === "income" && t.category === "salary" && t.date.startsWith(newMonth)
              );
              setSalaryInput(existing ? String(existing.amount) : "");
            }}
            style={{
              width: "100%",
              background: T.bg3,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "9px 13px",
              color: T.t1,
              fontSize: 13,
              outline: "none",
              fontFamily: "inherit",
              cursor: "pointer",
              boxSizing: "border-box",
            }}
          >
            {salaryMonthOpts.map((key) => (
              <option key={key} value={key} style={{ background: T.bg2 }}>
                {fmtSalaryMonthLabel(key)}{key === curMonthKey ? " (Current)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: T.t3, fontSize: 11, display: "block", marginBottom: 5 }}>
              Salary Amount (₹)
            </label>
            <input
              type="number"
              value={salaryInput}
              onChange={(e) => setSalaryInput(e.target.value)}
              placeholder="e.g. 50000"
              style={{
                width: "100%",
                background: T.bg3,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "9px 13px",
                color: T.t1,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>
          <button
            onClick={saveSalary}
            disabled={savingSalary}
            style={{
              padding: "9px 18px",
              borderRadius: 9,
              border: "none",
              background: T.green,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            {savingSalary ? <Spinner size={13} color="#fff" /> : null}
            {savingSalary ? "Saving…" : "Save Salary"}
          </button>
        </div>
      </Card>

      {/* Preferences */}
      {prefs && (
        <Card style={{ padding: "24px", marginBottom: 14 }}>
          <h3
            style={{
              color: T.t1,
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            Preferences
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              ["dark_mode", "Dark Mode", "Use dark theme throughout the app"],
              [
                "budget_alerts",
                "Budget Alerts",
                "Get notified when approaching budget limits",
              ],
              [
                "weekly_reports",
                "Weekly Reports",
                "Receive weekly spending summaries via email",
              ],
              [
                "ai_insights",
                "AI Insights",
                "Show personalized AI financial insights on dashboard",
              ],
            ].map(([k, label, desc]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ color: T.t1, fontSize: 13, fontWeight: 500 }}>
                    {label}
                  </p>
                  <p style={{ color: T.t3, fontSize: 11, marginTop: 2 }}>
                    {desc}
                  </p>
                </div>
                <Toggle k={k} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Data Management */}
      <Card style={{ padding: "24px", marginBottom: 14 }}>
        <h3
          style={{
            color: T.t1,
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          Data Management
        </h3>
        <p style={{ color: T.t3, fontSize: 12, marginBottom: 14 }}>
          Export all {transactions.length} transactions from your account.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => exportToExcel(transactions)}
            style={{
              padding: "9px 18px",
              borderRadius: 9,
              cursor: "pointer",
              fontFamily: "inherit",
              border: `1px solid ${T.green}40`,
              background: T.green + "14",
              color: T.green,
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Download size={14} />
            Export Excel
          </button>
          <button
            onClick={() => exportToPDF(transactions)}
            style={{
              padding: "9px 18px",
              borderRadius: 9,
              cursor: "pointer",
              fontFamily: "inherit",
              border: `1px solid ${T.primary}40`,
              background: T.primary + "14",
              color: T.primary,
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Download size={14} />
            Export PDF
          </button>
          <button
            onClick={() => exportToCSV(transactions)}
            style={{
              padding: "9px 18px",
              borderRadius: 9,
              cursor: "pointer",
              fontFamily: "inherit",
              border: `1px solid ${T.yellow}40`,
              background: T.yellow + "14",
              color: T.yellow,
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: "9px 18px",
              borderRadius: 9,
              cursor: "pointer",
              fontFamily: "inherit",
              border: `1px solid ${T.red}40`,
              background: T.red + "14",
              color: T.red,
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </Card>

      {/* Admin Panel */}
      {user?.is_admin === 1 && (
        <Card style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Shield size={16} color={T.yellow} />
            <h3 style={{ color: T.yellow, fontSize: 14, fontWeight: 600 }}>
              Admin: User Management
            </h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "ID",
                    "Name",
                    "Email",
                    "Currency",
                    "Admin",
                    "Joined",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        color: T.t3,
                        fontSize: 11,
                        fontWeight: 600,
                        textAlign: "left",
                        padding: "8px 10px",
                        borderBottom: `1px solid ${T.border}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((u) => (
                  <tr key={u.id}>
                    <td
                      style={{
                        color: T.t3,
                        fontSize: 12,
                        padding: "10px 10px",
                      }}
                    >
                      {u.id}
                    </td>
                    <td
                      style={{
                        color: T.t1,
                        fontSize: 12,
                        padding: "10px 10px",
                        fontWeight: 500,
                      }}
                    >
                      {u.full_name}
                    </td>
                    <td
                      style={{
                        color: T.t2,
                        fontSize: 12,
                        padding: "10px 10px",
                      }}
                    >
                      {u.email}
                    </td>
                    <td
                      style={{
                        color: T.t2,
                        fontSize: 12,
                        padding: "10px 10px",
                      }}
                    >
                      {u.currency}
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      {u.is_admin ? (
                        <Badge c={T.yellow}>Admin</Badge>
                      ) : (
                        <Badge c={T.t3}>User</Badge>
                      )}
                    </td>
                    <td
                      style={{
                        color: T.t3,
                        fontSize: 11,
                        padding: "10px 10px",
                      }}
                    >
                      {u.created_at?.slice(0, 10)}
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      {u.id !== user.id && (
                        <button
                          onClick={() => deleteUser(u.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: T.red,
                            fontSize: 12,
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const isMobile = useMobile();
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Inject fonts & global styles
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      html,body{overflow-x:hidden;max-width:100%}
      *{font-family:'Outfit',system-ui,sans-serif!important;box-sizing:border-box;margin:0;padding:0}
      ::-webkit-scrollbar{width:5px;height:5px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:#1A2840;border-radius:10px}
      input,select{color-scheme:dark}
      @keyframes spin{to{transform:rotate(360deg)}}
    `;
    document.head.appendChild(style);

    // Try restoring session from token
    const token = localStorage.getItem("financeai_token");
    if (token) {
      api
        .getProfile()
        .then((u) => setUser(u))
        .catch(() => localStorage.removeItem("financeai_token"))
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    setPage("dashboard");
  };
  const handleLogout = () => {
    localStorage.removeItem("financeai_token");
    setUser(null);
    setPage("dashboard");
  };
  const handleUserUpdate = (u) => setUser((prev) => ({ ...prev, ...u }));

  if (!authChecked)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: T.bg0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner size={32} />
      </div>
    );

  if (!user) return <AuthPage onLogin={handleLogin} />;

  const sideW = isMobile ? 0 : collapsed ? 64 : 230;
  const menuCtx = { toggle: () => setMobileMenuOpen((o) => !o) };

  return (
    <MobileMenuCtx.Provider value={menuCtx}>
      <div style={{ background: T.bg1, minHeight: "100vh", width: "100%", color: T.t1 }}>
        <Sidebar
          page={page}
          setPage={setPage}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          user={user}
          onLogout={handleLogout}
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <main
          style={{
            marginLeft: sideW,
            padding: isMobile ? "20px 16px" : "28px 36px",
            minHeight: "100vh",
            transition: "margin-left 0.25s ease",
            overflowX: "hidden",
            maxWidth: "100%",
          }}
        >
          {page === "dashboard" && <DashboardPage user={user} setPage={setPage} />}
          {page === "transactions" && <TransactionsPage />}
          {page === "analytics" && <AnalyticsPage />}
          {page === "budget" && <BudgetPage />}
          {page === "settings" && <SettingsPage user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />}
          {!["dashboard","transactions","analytics","budget","settings"].includes(page) && <DashboardPage user={user} setPage={setPage} />}
        </main>
      </div>
    </MobileMenuCtx.Provider>
  );
}
