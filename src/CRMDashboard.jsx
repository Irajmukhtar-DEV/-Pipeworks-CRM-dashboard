import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  LayoutGrid, Users, Kanban, BarChart3, Settings, LogOut, Search,
  Bell, Moon, Sun, ChevronDown, Menu, X, Plus, ArrowUpRight, ArrowDownRight,
  Filter, ChevronUp, ChevronsUpDown, Building2, ShieldCheck, UserCog,
  CircleDot, CheckCircle2, Clock, TrendingUp, Wallet, Target, Lock, Mail,
} from "lucide-react";

/* ---------------------------------------------------------------
   TOKENS
   Display: Space Grotesk (headers, brand)
   Body: Inter (UI text)
   Data: JetBrains Mono (every number in the product — the signature)
----------------------------------------------------------------*/
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap";

const palette = {
  light: {
    canvas: "#FBF7F9",
    surface: "#FFFFFF",
    surfaceAlt: "#F7EDF1",
    border: "#EDDCE3",
    borderStrong: "#D9C0CB",
    text: "#241821",
    textSub: "#7C6670",
    textFaint: "#A6919B",
    brand: "#9E2C5A",
    brandSoft: "#F7E1EA",
    accent: "#C46A8F",
    accentSoft: "#F9E9EF",
    success: "#1A8F5E",
    successSoft: "#E5F6EE",
    danger: "#D14343",
    dangerSoft: "#FBEAEA",
  },
  dark: {
    canvas: "#181014",
    surface: "#22181E",
    surfaceAlt: "#2B1F27",
    border: "#3C2C35",
    borderStrong: "#4C3843",
    text: "#F6EEF2",
    textSub: "#BB9AA8",
    textFaint: "#8A7180",
    brand: "#E893B8",
    brandSoft: "#3A2130",
    accent: "#D9749B",
    accentSoft: "#3D2430",
    success: "#3FC98A",
    successSoft: "#0F2A20",
    danger: "#F0716A",
    dangerSoft: "#33191A",
  },
};

/* ---------------------------------------------------------------
   MOCK DATA
----------------------------------------------------------------*/
const STAGES = ["New", "Contacted", "Proposal", "Negotiation", "Won", "Lost"];

const OWNERS = [
  { id: "u1", name: "Iraj Mukhtar", role: "rep" },
  { id: "u2", name: "Muhammad Ali", role: "rep" },
  { id: "u3", name: "Mazab e Rahmet", role: "manager" },
  { id: "u4", name: "Sara Khan", role: "rep" },
];

const rawDeals = [
  ["Nimbus Retail Co.", "u1", "Negotiation", 48200, "2026-06-28"],
  ["Foundry Metalworks", "u2", "Proposal", 21500, "2026-06-30"],
  ["Basalt Logistics", "u3", "Won", 76000, "2026-06-15"],
  ["Verdant Foods", "u4", "New", 12800, "2026-07-01"],
  ["Cinder Analytics", "u1", "Contacted", 33750, "2026-06-25"],
  ["Harlow & Finch Law", "u2", "Won", 54300, "2026-06-10"],
  ["Pinewood Studios", "u3", "Lost", 18900, "2026-06-20"],
  ["Quartz Health Group", "u4", "Negotiation", 91200, "2026-07-02"],
  ["Solace Wellness", "u1", "Proposal", 27600, "2026-06-27"],
  ["Ridgeline Freight", "u2", "New", 15400, "2026-07-03"],
  ["Amberly Insurance", "u3", "Contacted", 39800, "2026-06-22"],
  ["Tidewater Media", "u4", "Won", 62100, "2026-06-12"],
  ["Copperfield Bank", "u1", "Negotiation", 108500, "2026-07-01"],
  ["Lumen Robotics", "u2", "Lost", 24700, "2026-06-18"],
  ["Greenway Realty", "u3", "New", 17300, "2026-07-04"],
];

const deals = rawDeals.map((d, i) => ({
  id: `D-${1000 + i}`,
  customer: d[0],
  ownerId: d[1],
  stage: d[2],
  value: d[3],
  updated: d[4],
}));

const revenueTrend = [
  { m: "Jan", revenue: 82000, target: 90000 },
  { m: "Feb", revenue: 91000, target: 90000 },
  { m: "Mar", revenue: 87500, target: 95000 },
  { m: "Apr", revenue: 104000, target: 95000 },
  { m: "May", revenue: 112500, target: 100000 },
  { m: "Jun", revenue: 121300, target: 105000 },
];

const stageCounts = STAGES.map((s) => ({
  stage: s,
  count: deals.filter((d) => d.stage === s).length,
}));

const sourceSplit = [
  { name: "Referral", value: 34 },
  { name: "Outbound", value: 27 },
  { name: "Inbound", value: 24 },
  { name: "Partner", value: 15 },
];
const SOURCE_COLORS = ["brand", "accent", "success", "textFaint"];

const notificationsSeed = [
  { id: 1, title: "Deal moved to Negotiation", body: "Copperfield Bank · $108,500", time: "8m ago", read: false, kind: "deal" },
  { id: 2, title: "New comment on Quartz Health Group", body: "Elena Cho left a note", time: "41m ago", read: false, kind: "comment" },
  { id: 3, title: "Task due today", body: "Follow up call with Ridgeline Freight", time: "2h ago", read: false, kind: "task" },
  { id: 4, title: "Deal won 🎉", body: "Tidewater Media · $62,100", time: "1d ago", read: true, kind: "deal" },
  { id: 5, title: "Weekly report ready", body: "Pipeline summary for Jun 24–30", time: "2d ago", read: true, kind: "report" },
];

const stageStyle = {
  New: "textFaint",
  Contacted: "brand",
  Proposal: "accent",
  Negotiation: "accent",
  Won: "success",
  Lost: "danger",
};

const currency = (n) =>
  "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

/* ---------------------------------------------------------------
   NAV CONFIG — role based
----------------------------------------------------------------*/
const NAV_BY_ROLE = {
  admin: [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "pipeline", label: "Pipeline", icon: Kanban },
    { key: "customers", label: "Customers", icon: Building2 },
    { key: "team", label: "Team", icon: Users },
    { key: "reports", label: "Reports", icon: BarChart3 },
    { key: "settings", label: "Settings", icon: Settings },
  ],
  manager: [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "pipeline", label: "Pipeline", icon: Kanban },
    { key: "customers", label: "Customers", icon: Building2 },
    { key: "reports", label: "Reports", icon: BarChart3 },
  ],
  rep: [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "mydeals", label: "My Deals", icon: Kanban },
    { key: "customers", label: "Customers", icon: Building2 },
  ],
};

const ROLE_META = {
  admin: { label: "Administrator", icon: ShieldCheck },
  manager: { label: "Sales Manager", icon: UserCog },
  rep: { label: "Sales Rep", icon: Users },
};

/* ---------------------------------------------------------------
   LOGIN SCREEN
----------------------------------------------------------------*/
function LoginScreen({ onLogin, c }) {
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("jordan@nimbusops.io");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid work email."); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters."); return; }
    setError("");
    onLogin(role, email);
  };

  return (
    <div style={{ background: c.canvas, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}
      className="flex items-center justify-center px-4">
      <div className="w-full max-w-[920px] grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-xl"
        style={{ border: `1px solid ${c.border}` }}>
        {/* Brand panel */}
        <div className="hidden md:flex flex-col justify-between p-10"
          style={{ background: c.brand, color: "#fff" }}>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.16)" }}>
                <Target size={18} />
              </div>
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: 18 }}>Pipeworks</span>
            </div>
            <p className="mt-10 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              Every account, every deal, every quarter — one pipeline that never loses the thread.
            </p>
          </div>
          <div className="space-y-4">
            {[
              ["$1.4M", "pipeline tracked this quarter"],
              ["96%", "renewal rate for accounts on Pipeworks"],
              ["12min", "average time to first response"],
            ].map(([num, label]) => (
              <div key={label} className="flex items-baseline gap-2">
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700, fontSize: 22 }}>{num}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form panel */}
        <div className="p-8 md:p-10" style={{ background: c.surface }}>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", color: c.text, fontWeight: 700 }} className="text-2xl">
            Sign in
          </h1>
          <p className="text-sm mt-1" style={{ color: c.textSub }}>Welcome back. Pick a role to preview the workspace.</p>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {Object.entries(ROLE_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const active = role === key;
              return (
                <button key={key} type="button" onClick={() => setRole(key)}
                  className="flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs transition-colors"
                  style={{
                    border: `1.5px solid ${active ? c.brand : c.border}`,
                    background: active ? c.brandSoft : "transparent",
                    color: active ? c.brand : c.textSub,
                    fontWeight: 500,
                  }}>
                  <Icon size={16} />
                  {meta.label.split(" ")[0]}
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: c.textSub }}>Work email</label>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                style={{ border: `1px solid ${c.border}`, background: c.canvas }}>
                <Mail size={15} color={c.textFaint} />
                <input value={email} onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full" style={{ color: c.text }} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: c.textSub }}>Password</label>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                style={{ border: `1px solid ${c.border}`, background: c.canvas }}>
                <Lock size={15} color={c.textFaint} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="bg-transparent outline-none text-sm w-full" style={{ color: c.text }} />
              </div>
            </div>
            {error && <p className="text-xs" style={{ color: c.danger }}>{error}</p>}
            <button type="submit" className="w-full rounded-lg py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: c.brand, color: "#fff" }}>
              Sign in as {ROLE_META[role].label}
            </button>
          </form>
          <p className="text-xs mt-5 text-center" style={{ color: c.textFaint }}>
            Demo workspace — any email and a 4+ character password will do.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SMALL UI PIECES
----------------------------------------------------------------*/
function Badge({ tone, c, children }) {
  const bgKey = tone + "Soft";
  const bg = c[bgKey] || c.surfaceAlt;
  const fg = c[tone] || c.textSub;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: bg, color: fg, fontFamily: "Inter, sans-serif" }}>
      {children}
    </span>
  );
}

function KpiCard({ label, value, delta, positive, icon: Icon, c }) {
  return (
    <div className="rounded-xl p-4 flex-1 min-w-[180px]" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: c.textSub }}>{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: c.brandSoft }}>
          <Icon size={14} color={c.brand} />
        </div>
      </div>
      <div className="mt-2" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 24, fontWeight: 700, color: c.text }}>
        {value}
      </div>
      <div className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: positive ? c.success : c.danger }}>
        {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        <span style={{ fontFamily: "JetBrains Mono, monospace" }}>{delta}</span>
        <span style={{ color: c.textFaint, fontFamily: "Inter, sans-serif" }}>vs last month</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SIDEBAR
----------------------------------------------------------------*/
function Sidebar({ role, active, setActive, c, theme, collapsed, mobileOpen, setMobileOpen }) {
  const items = NAV_BY_ROLE[role];
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden" style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen flex flex-col transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{
          width: collapsed ? 76 : 232,
          background: c.surface,
          borderRight: `1px solid ${c.border}`,
        }}>
        <div className="flex items-center gap-2 px-5 h-16 shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.brand }}>
            <Target size={15} color="#fff" />
          </div>
          {!collapsed && (
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, color: c.text, fontSize: 16 }}>
              Pipeworks
            </span>
          )}
          <button className="ml-auto md:hidden" onClick={() => setMobileOpen(false)}>
            <X size={18} color={c.textSub} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setActive(item.key); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{
                  background: isActive ? c.brandSoft : "transparent",
                  color: isActive ? c.brand : c.textSub,
                  fontWeight: isActive ? 600 : 500,
                  justifyContent: collapsed ? "center" : "flex-start",
                }}>
                <Icon size={17} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3" style={{ borderTop: `1px solid ${c.border}` }}>
          <div className="rounded-lg px-3 py-2.5 text-xs" style={{ background: c.surfaceAlt, color: c.textSub, display: collapsed ? "none" : "block" }}>
            <span style={{ fontFamily: "Inter, sans-serif" }}>Signed in as</span>
            <div className="font-medium mt-0.5" style={{ color: c.text }}>{ROLE_META[role].label}</div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ---------------------------------------------------------------
   NOTIFICATIONS PANEL
----------------------------------------------------------------*/
function NotificationsPanel({ c, notifications, setNotifications, onClose }) {
  return (
    <div className="absolute right-0 top-12 w-80 rounded-xl shadow-lg overflow-hidden z-50"
      style={{ background: c.surface, border: `1px solid ${c.border}` }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
        <span className="text-sm font-semibold" style={{ color: c.text }}>Notifications</span>
        <button className="text-xs font-medium hover:underline" style={{ color: c.brand }}
          onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}>
          Mark all read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <div key={n.id} className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
            style={{ borderBottom: `1px solid ${c.border}`, background: n.read ? "transparent" : c.brandSoft }}
            onClick={() => setNotifications((list) => list.map((x) => x.id === n.id ? { ...x, read: true } : x))}>
            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.read ? "transparent" : c.accent }} />
            <div>
              <p className="text-sm font-medium" style={{ color: c.text }}>{n.title}</p>
              <p className="text-xs mt-0.5" style={{ color: c.textSub }}>{n.body}</p>
              <p className="text-xs mt-1" style={{ color: c.textFaint, fontFamily: "JetBrains Mono, monospace" }}>{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   TOPBAR
----------------------------------------------------------------*/
function Topbar({ c, theme, setTheme, search, setSearch, user, onLogout, notifications, setNotifications, setMobileOpen, collapsed, setCollapsed }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-3 px-4 md:px-6"
      style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
      <button className="md:hidden" onClick={() => setMobileOpen(true)}>
        <Menu size={20} color={c.textSub} />
      </button>
      <button className="hidden md:flex" onClick={() => setCollapsed((v) => !v)}>
        <Menu size={18} color={c.textSub} />
      </button>

      <div className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color={c.textFaint} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers, deals, people…"
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: c.canvas, border: `1px solid ${c.border}`, color: c.text }}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ border: `1px solid ${c.border}` }}>
          {theme === "light" ? <Moon size={16} color={c.textSub} /> : <Sun size={16} color={c.textSub} />}
        </button>

        <div className="relative">
          <button onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
            className="w-9 h-9 rounded-lg flex items-center justify-center relative"
            style={{ border: `1px solid ${c.border}` }}>
            <Bell size={16} color={c.textSub} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] flex items-center justify-center font-semibold"
                style={{ background: c.danger, color: "#fff", fontFamily: "JetBrains Mono, monospace" }}>
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <NotificationsPanel c={c} notifications={notifications} setNotifications={setNotifications} onClose={() => setNotifOpen(false)} />
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg" style={{ border: `1px solid ${c.border}` }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: c.brand, color: "#fff", fontFamily: "Space Grotesk, sans-serif" }}>
              {user.name.split(" ").map((p) => p[0]).join("")}
            </div>
            <span className="hidden sm:block text-sm font-medium" style={{ color: c.text }}>{user.name.split(" ")[0]}</span>
            <ChevronDown size={14} color={c.textFaint} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 rounded-xl shadow-lg overflow-hidden z-50"
              style={{ background: c.surface, border: `1px solid ${c.border}` }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
                <p className="text-sm font-semibold" style={{ color: c.text }}>{user.name}</p>
                <p className="text-xs mt-0.5" style={{ color: c.textSub }}>{user.email}</p>
                <div className="mt-2"><Badge tone="brand" c={c}>{ROLE_META[user.role].label}</Badge></div>
              </div>
              <button className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:opacity-80"
                style={{ color: c.textSub }}>
                <Settings size={15} /> Account settings
              </button>
              <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:opacity-80"
                style={{ color: c.danger, borderTop: `1px solid ${c.border}` }}>
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------
   CHARTS
----------------------------------------------------------------*/
function ChartCard({ title, subtitle, c, children }) {
  return (
    <div className="rounded-xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
      <p className="text-sm font-semibold" style={{ color: c.text }}>{title}</p>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: c.textSub }}>{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function RevenueChart({ c }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={revenueTrend} margin={{ left: -20, right: 10 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.brand} stopOpacity={0.35} />
            <stop offset="100%" stopColor={c.brand} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={c.border} vertical={false} />
        <XAxis dataKey="m" tick={{ fontSize: 11, fill: c.textSub, fontFamily: "Inter" }} axisLine={{ stroke: c.border }} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: c.textFaint, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `$${v / 1000}k`} />
        <Tooltip
          contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 12, fontFamily: "Inter" }}
          formatter={(v) => [currency(v), ""]} labelStyle={{ color: c.text, fontWeight: 600 }} />
        <Area type="monotone" dataKey="revenue" stroke={c.brand} strokeWidth={2.5} fill="url(#rev)" name="Revenue" />
        <Line type="monotone" dataKey="target" stroke={c.textFaint} strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Target" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StageChart({ c }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={stageCounts} margin={{ left: -20, right: 10 }}>
        <CartesianGrid stroke={c.border} vertical={false} />
        <XAxis dataKey="stage" tick={{ fontSize: 10, fill: c.textSub, fontFamily: "Inter" }} axisLine={{ stroke: c.border }} tickLine={false} interval={0} angle={-15} textAnchor="end" height={45} />
        <YAxis tick={{ fontSize: 10, fill: c.textFaint, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 12, fontFamily: "Inter" }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={c.brand} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function SourceChart({ c }) {
  const colors = SOURCE_COLORS.map((k) => c[k]);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={sourceSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
          {sourceSplit.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, fontSize: 12, fontFamily: "Inter" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ---------------------------------------------------------------
   DYNAMIC TABLE
----------------------------------------------------------------*/
function DealsTable({ c, rows, ownersById }) {
  const [sortKey, setSortKey] = useState("updated");
  const [sortDir, setSortDir] = useState("desc");
  const [stageFilter, setStageFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    let r = rows;
    if (stageFilter !== "All") r = r.filter((d) => d.stage === stageFilter);
    if (ownerFilter !== "All") r = r.filter((d) => d.ownerId === ownerFilter);
    r = [...r].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "updated") { av = new Date(av); bv = new Date(bv); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [rows, stageFilter, ownerFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronsUpDown size={12} color={c.textFaint} />;
    return sortDir === "asc" ? <ChevronUp size={12} color={c.brand} /> : <ChevronDown size={12} color={c.brand} />;
  };

  const cols = [
    { key: "customer", label: "Customer" },
    { key: "ownerId", label: "Owner" },
    { key: "stage", label: "Stage" },
    { key: "value", label: "Value" },
    { key: "updated", label: "Updated" },
  ];

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
      <div className="flex flex-wrap items-center gap-3 p-4" style={{ borderBottom: `1px solid ${c.border}` }}>
        <p className="text-sm font-semibold mr-auto" style={{ color: c.text }}>Deals ({filtered.length})</p>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: c.textSub }}>
          <Filter size={13} />
          Filters
        </div>
        <select value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
          className="text-xs rounded-lg px-2.5 py-1.5 outline-none" style={{ background: c.canvas, border: `1px solid ${c.border}`, color: c.text }}>
          <option>All</option>
          {STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={ownerFilter} onChange={(e) => { setOwnerFilter(e.target.value); setPage(1); }}
          className="text-xs rounded-lg px-2.5 py-1.5 outline-none" style={{ background: c.canvas, border: `1px solid ${c.border}`, color: c.text }}>
          <option value="All">All owners</option>
          {OWNERS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: c.surfaceAlt }}>
              {cols.map((col) => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  className="text-left px-4 py-2.5 text-xs font-medium cursor-pointer select-none whitespace-nowrap"
                  style={{ color: c.textSub }}>
                  <span className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((d) => (
              <tr key={d.id} style={{ borderTop: `1px solid ${c.border}` }}>
                <td className="px-4 py-3" style={{ color: c.text, fontWeight: 500 }}>{d.customer}</td>
                <td className="px-4 py-3" style={{ color: c.textSub }}>{ownersById[d.ownerId]?.name}</td>
                <td className="px-4 py-3"><Badge tone={stageStyle[d.stage]} c={c}>{d.stage}</Badge></td>
                <td className="px-4 py-3" style={{ color: c.text, fontFamily: "JetBrains Mono, monospace" }}>{currency(d.value)}</td>
                <td className="px-4 py-3" style={{ color: c.textFaint, fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{d.updated}</td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: c.textFaint }}>No deals match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${c.border}` }}>
        <span className="text-xs" style={{ color: c.textFaint, fontFamily: "JetBrains Mono, monospace" }}>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            className="text-xs px-2.5 py-1 rounded-lg disabled:opacity-40" style={{ border: `1px solid ${c.border}`, color: c.textSub }}>
            Prev
          </button>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
            className="text-xs px-2.5 py-1 rounded-lg disabled:opacity-40" style={{ border: `1px solid ${c.border}`, color: c.textSub }}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   PAGES
----------------------------------------------------------------*/
function OverviewPage({ c, role, user, visibleDeals, ownersById }) {
  const totalValue = visibleDeals.reduce((s, d) => s + d.value, 0);
  const won = visibleDeals.filter((d) => d.stage === "Won").length;
  const openCount = visibleDeals.filter((d) => !["Won", "Lost"].includes(d.stage)).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", color: c.text, fontWeight: 700 }} className="text-xl">
          {role === "rep" ? `Welcome back, ${user.name.split(" ")[0]}` : "Pipeline overview"}
        </h1>
        <p className="text-sm mt-1" style={{ color: c.textSub }}>Here's what's moving across your accounts this week.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <KpiCard c={c} label="Pipeline value" value={currency(totalValue)} delta="+8.4%" positive icon={Wallet} />
        <KpiCard c={c} label="Open deals" value={openCount} delta="+3" positive icon={Kanban} />
        <KpiCard c={c} label="Won this month" value={won} delta="+2" positive icon={CheckCircle2} />
        <KpiCard c={c} label="Avg. response time" value="12m" delta="-4m" positive icon={Clock} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCard c={c} title="Revenue vs target" subtitle="Last 6 months">
            <RevenueChart c={c} />
          </ChartCard>
        </div>
        <ChartCard c={c} title="Lead sources" subtitle="Share of new deals">
          <SourceChart c={c} />
          <div className="flex flex-wrap gap-3 mt-2">
            {sourceSplit.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs" style={{ color: c.textSub }}>
                <span className="w-2 h-2 rounded-full" style={{ background: c[SOURCE_COLORS[i]] }} />
                {s.name}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard c={c} title="Deals by stage" subtitle="Current pipeline">
          <StageChart c={c} />
        </ChartCard>
        <div className="lg:col-span-2">
          <DealsTable c={c} rows={visibleDeals} ownersById={ownersById} />
        </div>
      </div>
    </div>
  );
}

function SimpleTablePage({ c, title, subtitle, rows, ownersById }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", color: c.text, fontWeight: 700 }} className="text-xl">{title}</h1>
        <p className="text-sm mt-1" style={{ color: c.textSub }}>{subtitle}</p>
      </div>
      <DealsTable c={c} rows={rows} ownersById={ownersById} />
    </div>
  );
}

function CustomersPage({ c, rows, ownersById, search }) {
  const customers = useMemo(() => {
    const map = {};
    rows.forEach((d) => {
      if (!map[d.customer]) map[d.customer] = { name: d.customer, deals: 0, value: 0, owner: d.ownerId, stage: d.stage };
      map[d.customer].deals += 1;
      map[d.customer].value += d.value;
    });
    return Object.values(map).filter((c2) => c2.name.toLowerCase().includes(search.toLowerCase()));
  }, [rows, search]);

  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", color: c.text, fontWeight: 700 }} className="text-xl">Customers</h1>
        <p className="text-sm mt-1" style={{ color: c.textSub }}>{customers.length} accounts in view</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((cu) => (
          <div key={cu.name} className="rounded-xl p-4" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: c.brandSoft }}>
                <Building2 size={16} color={c.brand} />
              </div>
              <Badge tone={stageStyle[cu.stage]} c={c}>{cu.stage}</Badge>
            </div>
            <p className="mt-3 text-sm font-semibold" style={{ color: c.text }}>{cu.name}</p>
            <p className="text-xs mt-0.5" style={{ color: c.textSub }}>Owner: {ownersById[cu.owner]?.name}</p>
            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${c.border}` }}>
              <span className="text-xs" style={{ color: c.textFaint }}>{cu.deals} deal{cu.deals > 1 ? "s" : ""}</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", color: c.text, fontWeight: 600 }} className="text-sm">{currency(cu.value)}</span>
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <p className="text-sm" style={{ color: c.textFaint }}>No customers match "{search}".</p>
        )}
      </div>
    </div>
  );
}

function TeamPage({ c }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", color: c.text, fontWeight: 700 }} className="text-xl">Team</h1>
        <p className="text-sm mt-1" style={{ color: c.textSub }}>Manage roles and access across the workspace.</p>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
        {OWNERS.map((o, i) => (
          <div key={o.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i ? `1px solid ${c.border}` : "none" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: c.brand, color: "#fff", fontFamily: "Space Grotesk, sans-serif" }}>
              {o.name.split(" ").map((p) => p[0]).join("")}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: c.text }}>{o.name}</p>
            </div>
            <Badge tone="brand" c={c}>{ROLE_META[o.role].label}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage({ c, theme, setTheme }) {
  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", color: c.text, fontWeight: 700 }} className="text-xl">Settings</h1>
        <p className="text-sm mt-1" style={{ color: c.textSub }}>Workspace preferences.</p>
      </div>
      <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
        <div>
          <p className="text-sm font-medium" style={{ color: c.text }}>Appearance</p>
          <p className="text-xs mt-0.5" style={{ color: c.textSub }}>Switch between light and dark mode.</p>
        </div>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: c.brand, color: "#fff" }}>
          {theme === "light" ? "Switch to dark" : "Switch to light"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ROOT
----------------------------------------------------------------*/
export default function CRMDashboard() {
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState("admin");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [active, setActive] = useState("overview");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationsSeed);

  const c = palette[theme];
  const ownersById = useMemo(() => Object.fromEntries(OWNERS.map((o) => [o.id, o])), []);

  const handleLogin = (r, email) => {
    const names = { admin: "Jordan Ashwell", manager: "Elena Cho", rep: "Iraj Mukhtar" };
    setRole(r);
    setUser({ name: names[r], email, role: r });
    setActive("overview");
    setAuthed(true);
  };

  const visibleDeals = useMemo(() => {
    let base = deals;
    if (role === "rep" && user) base = base.filter((d) => ownersById[d.ownerId]?.name === user.name);
    if (search) base = base.filter((d) => d.customer.toLowerCase().includes(search.toLowerCase()));
    return base;
  }, [role, user, search, ownersById]);

  if (!authed) {
    return (
      <>
        <link rel="stylesheet" href={FONT_LINK} />
        <LoginScreen onLogin={handleLogin} c={palette.light} />
      </>
    );
  }

  let page;
  if (active === "overview") page = <OverviewPage c={c} role={role} user={user} visibleDeals={visibleDeals} ownersById={ownersById} />;
  else if (active === "pipeline") page = <SimpleTablePage c={c} title="Pipeline" subtitle="Every open and closed deal." rows={visibleDeals} ownersById={ownersById} />;
  else if (active === "mydeals") page = <SimpleTablePage c={c} title="My Deals" subtitle="Deals assigned to you." rows={visibleDeals} ownersById={ownersById} />;
  else if (active === "customers") page = <CustomersPage c={c} rows={visibleDeals} ownersById={ownersById} search={search} />;
  else if (active === "team") page = <TeamPage c={c} />;
  else if (active === "reports") page = <OverviewPage c={c} role={role} user={user} visibleDeals={visibleDeals} ownersById={ownersById} />;
  else if (active === "settings") page = <SettingsPage c={c} theme={theme} setTheme={setTheme} />;

  return (
    <>
      <link rel="stylesheet" href={FONT_LINK} />
      <div style={{ background: c.canvas, minHeight: "100vh", fontFamily: "Inter, sans-serif" }} className="flex">
        <Sidebar role={role} active={active} setActive={setActive} c={c} theme={theme}
          collapsed={collapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar c={c} theme={theme} setTheme={setTheme} search={search} setSearch={setSearch}
            user={user} onLogout={() => { setAuthed(false); setSearch(""); }}
            notifications={notifications} setNotifications={setNotifications}
            setMobileOpen={setMobileOpen} collapsed={collapsed} setCollapsed={setCollapsed} />
          <main className="flex-1 p-4 md:p-6">{page}</main>
        </div>
      </div>
    </>
  );
}