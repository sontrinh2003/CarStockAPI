import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8080";

// ─── Auth context ─────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
function useAuth() { return useContext(AuthCtx); }

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const login = (t) => { localStorage.setItem("token", t); setToken(t); };
  const logout = () => { localStorage.removeItem("token"); setToken(null); };
  return <AuthCtx.Provider value={{ token, login, logout }}>{children}</AuthCtx.Provider>;
}

// ─── API layer ────────────────────────────────────────────────────────────────
function useApi() {
  const { token, logout } = useAuth();

  const req = useCallback(async (method, path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (res.status === 401) { logout(); return null; }
    if (!res.ok) throw new Error(await res.text());
    if (res.status === 204) return null;
    try { return await res.json(); } catch { return null; }
  }, [token, logout]);

  return {
    get:    (path)        => req("GET",    path),
    post:   (path, body)  => req("POST",   path, body),
    put:    (path, body)  => req("PUT",    path, body),
    del:    (path)        => req("DELETE", path),
  };
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0f1117;
    --surface:   #181c25;
    --surface2:  #1e2330;
    --border:    #2a2f3d;
    --border2:   #3a3f50;
    --text:      #e8eaf0;
    --muted:     #7b8096;
    --accent:    #4f8ef7;
    --accent-dk: #3a6fd4;
    --green:     #3ecf8e;
    --amber:     #f5a623;
    --red:       #e5534b;
    --mono:      'DM Mono', monospace;
    --sans:      'Syne', system-ui, sans-serif;
    --radius:    8px;
    --radius-lg: 12px;
    --sidebar-w: 220px;
    --header-h:  56px;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--sans); font-size: 14px; line-height: 1.5; }

  input, select, textarea {
    background: var(--surface2); border: 1px solid var(--border2);
    color: var(--text); border-radius: var(--radius); padding: 8px 12px;
    font-family: var(--sans); font-size: 14px; width: 100%;
    transition: border-color 0.15s;
    outline: none;
  }
  input:focus, select:focus, textarea:focus { border-color: var(--accent); }

  button {
    font-family: var(--sans); font-size: 13px; font-weight: 500;
    cursor: pointer; border: none; border-radius: var(--radius);
    padding: 8px 16px; transition: opacity 0.15s, transform 0.1s;
  }
  button:active { transform: scale(0.97); }

  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 500;
       letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted);
       border-bottom: 1px solid var(--border); }
  td { padding: 11px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--surface2); }

  ::-webkit-scrollbar { width: 6px; } 
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }
`;

// ─── Primitives ───────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", small, style, disabled, type }) {
  const base = {
    background: variant === "primary"   ? "var(--accent)"
               : variant === "secondary" ? "var(--surface2)"
               : "transparent",
    color: variant === "primary" ? "#fff"
          : variant === "danger" ? "var(--red)"
          : variant === "ghost"  ? "var(--muted)"
          :                        "var(--text)",
    border: variant === "secondary" ? "1px solid var(--border2)"
          : variant === "danger"    ? "1px solid var(--red)"
          :                          "none",
    padding: small ? "5px 12px" : "8px 16px",
    fontSize: small ? "12px" : "13px",
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  return (
    <button onClick={onClick} style={base} disabled={disabled} type={type}>
      {children}
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "20px 24px", ...style,
    }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "16px 20px",
    }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent || "var(--text)", fontFamily: "var(--mono)" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Badge({ children, color = "accent" }) {
  const colors = {
    accent: { bg: "rgba(79,142,247,0.15)", fg: "#4f8ef7" },
    green:  { bg: "rgba(62,207,142,0.15)", fg: "#3ecf8e" },
    amber:  { bg: "rgba(245,166,35,0.15)", fg: "#f5a623" },
    red:    { bg: "rgba(229,83,75,0.15)",  fg: "#e5534b" },
    muted:  { bg: "rgba(123,128,150,0.15)",fg: "#7b8096" },
  };
  const c = colors[color] || colors.accent;
  return (
    <span style={{
      background: c.bg, color: c.fg, fontSize: 11, fontWeight: 500,
      padding: "3px 8px", borderRadius: 4, fontFamily: "var(--mono)",
      letterSpacing: "0.03em",
    }}>
      {children}
    </span>
  );
}

function Alert({ msg, type = "error" }) {
  if (!msg) return null;
  const color = type === "error" ? "var(--red)" : type === "success" ? "var(--green)" : "var(--amber)";
  return (
    <div style={{
      padding: "10px 14px", borderRadius: "var(--radius)",
      border: `1px solid ${color}`, color, fontSize: 13,
      background: `${color}18`, marginBottom: 16,
    }}>
      {msg}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, color: "var(--muted)" }}>
      <span style={{ animation: "spin 0.8s linear infinite", display: "inline-block", fontSize: 20 }}>⟳</span>
      &nbsp;Loading…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
      {msg || "No records found."}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "24px 28px", width: "100%",
          maxWidth: 480,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>{title}</h3>
          <Btn variant="ghost" onClick={onClose}>✕</Btn>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 5, fontWeight: 500 }}>
        {label}
      </label>
      {children}
      {error && <div style={{ color: "var(--red)", fontSize: 11, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

// ─── Login page ───────────────────────────────────────────────────────────────
function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 500) {
        const text = await res.text();
        setError(`Server error (500): ${text || "check your backend logs"}`);
        return;
      }
      if (res.status === 401 || res.status === 400) {
        setError("Invalid username or password.");
        return;
      }
      if (!res.ok) {
        setError(`Unexpected error (${res.status})`);
        return;
      }
      const data = await res.json();
      login(data.token);
    } catch {
      setError("Could not reach the server — is it running on port 8080?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <div style={{
            fontSize: 13, fontWeight: 500, letterSpacing: "0.15em",
            textTransform: "uppercase", color: "var(--accent)", marginBottom: 8,
          }}>
            CarStock
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Sign in</h1>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Dealership management platform</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <Alert msg={error} />
            <Field label="Username">
              <input
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="your username"
                autoFocus
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
              />
            </Field>
            <Btn type="submit" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
              {loading ? "Signing in…" : "Sign in"}
            </Btn>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",  label: "Dashboard",  icon: "⊞" },
  { id: "inventory",  label: "Inventory",  icon: "◫" },
  { id: "customers",  label: "Customers",  icon: "◎" },
  { id: "sales",      label: "Sales",      icon: "◈" },
  { id: "analytics",  label: "Analytics",  icon: "◬" },
];

function Sidebar({ page, setPage }) {
  const { logout } = useAuth();
  const [confirming, setConfirming] = useState(false);

  return (
    <aside style={{
      width: "var(--sidebar-w)", flexShrink: 0,
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, bottom: 0,
    }}>
      <div style={{
        padding: "18px 20px 14px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 500, marginBottom: 2 }}>
          CarStock
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>Dealership platform</div>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 12px", borderRadius: "var(--radius)", background: "none",
              color: page === n.id ? "var(--text)" : "var(--muted)",
              fontFamily: "var(--sans)", fontSize: 13, fontWeight: page === n.id ? 600 : 400,
              border: "none", cursor: "pointer", marginBottom: 2,
              background: page === n.id ? "var(--surface2)" : "transparent",
              transition: "background 0.15s, color 0.15s",
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 16, opacity: page === n.id ? 1 : 0.6 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
        {confirming ? (
          <div style={{
            background: "var(--surface2)", border: "1px solid var(--border2)",
            borderRadius: "var(--radius)", padding: "10px 12px",
          }}>
            <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 10 }}>
              Sign out of CarStock?
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={logout}
                style={{
                  flex: 1, padding: "6px 0", borderRadius: "var(--radius)",
                  background: "var(--red)", color: "#fff", border: "none",
                  fontSize: 12, cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 500,
                }}
              >
                Sign out
              </button>
              <button
                onClick={() => setConfirming(false)}
                style={{
                  flex: 1, padding: "6px 0", borderRadius: "var(--radius)",
                  background: "transparent", color: "var(--muted)",
                  border: "1px solid var(--border2)",
                  fontSize: 12, cursor: "pointer", fontFamily: "var(--sans)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "8px 12px", borderRadius: "var(--radius)", background: "none",
              color: "var(--muted)", fontSize: 12, border: "none", cursor: "pointer",
              fontFamily: "var(--sans)", transition: "color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
          >
            ⎋ &nbsp;Sign out
          </button>
        )}
      </div>
    </aside>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
function Page({ title, action, children }) {
  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 19, fontWeight: 700 }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────
function DashboardPage() {
  const api = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/api/dashboard/summary")
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setErr(e.message); setLoading(false); });
  }, []);

  if (loading) return <Page title="Dashboard"><Spinner /></Page>;

  // Fallback: if dashboard endpoint not yet built, show placeholder
  const d = data || {
    totalVehicles: "—", totalStock: "—", lowStockCount: 0,
    totalRevenue: null, lowStockAlerts: [], topBrands: [], recentSales: [],
  };

  return (
    <Page title="Dashboard">
      {err && <Alert msg={`Dashboard endpoint not available yet: ${err}`} type="warning" />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="Total models"    value={d.totalVehicles ?? "—"} />
        <StatCard label="Units in stock"  value={d.totalStock    ?? "—"} />
        <StatCard label="Low stock alerts" value={d.lowStockCount ?? (d.lowStockAlerts?.length ?? "—")} accent="var(--amber)" />
        <StatCard label="Revenue (all time)" value={d.totalRevenue != null ? `$${Number(d.totalRevenue).toLocaleString()}` : "—"} accent="var(--green)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 14 }}>
            Low stock alerts
          </div>
          {!d.lowStockAlerts?.length
            ? <EmptyState msg="All stock levels healthy." />
            : d.lowStockAlerts.map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{a.make} {a.model}</div>
                    <div style={{ color: "var(--muted)", fontSize: 11 }}>{a.message || "Requires restocking"}</div>
                  </div>
                  <Badge color="amber">{a.stock} left</Badge>
                </div>
              ))
          }
        </Card>

        <Card>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 14 }}>
            Top brands
          </div>
          {!d.topBrands?.length
            ? <EmptyState msg="No brand data yet." />
            : d.topBrands.map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                  <span style={{ fontSize: 13 }}>{b.brand || b.make}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)" }}>{b.count}</span>
                </div>
              ))
          }
        </Card>
      </div>

      {d.recentSales?.length > 0 && (
        <Card style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 14 }}>
            Recent sales
          </div>
          <table>
            <thead>
              <tr>
                <th>Customer</th><th>Vehicle</th><th>Amount</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.recentSales.map((s, i) => (
                <tr key={i}>
                  <td>{s.customerName}</td>
                  <td>{s.make} {s.model}</td>
                  <td style={{ fontFamily: "var(--mono)" }}>${Number(s.saleAmount).toLocaleString()}</td>
                  <td style={{ color: "var(--muted)" }}>{new Date(s.saleDate).toLocaleDateString()}</td>
                  <td><Badge color={s.status === "Completed" ? "green" : s.status === "Cancelled" ? "red" : "amber"}>{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Page>
  );
}

// ─── Inventory page ───────────────────────────────────────────────────────────
function InventoryPage() {
  const api = useApi();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false); // subtle indicator during debounce
  const [err, setErr] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [modal, setModal] = useState(null); // "add" | "stock:{id}"
  const [form, setForm] = useState({ make: "", model: "", year: new Date().getFullYear(), price: 0, stock: 0 });
  const [stockVal, setStockVal] = useState(0);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef(null);

  // Core fetch — called on mount and after debounce
  const fetchCars = useCallback(async (searchMake = "", searchModel = "") => {
    setErr("");
    try {
      const q = searchMake || searchModel
        ? `/api/cars/search?make=${encodeURIComponent(searchMake)}&model=${encodeURIComponent(searchModel)}`
        : "/api/cars";
      const data = await api.get(q);
      setCars(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.message); }
    setLoading(false);
    setSearching(false);
  }, []);

  // Initial load
  useEffect(() => { fetchCars(); }, []);

  // Debounced search — fires 300ms after the user stops typing
  function handleSearchChange(field, value) {
    const newMake  = field === "make"  ? value : make;
    const newModel = field === "model" ? value : model;

    if (field === "make")  setMake(value);
    if (field === "model") setModel(value);

    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCars(newMake, newModel);
    }, 300);
  }

  function handleClear() {
    setMake(""); setModel("");
    clearTimeout(debounceRef.current);
    fetchCars("", "");
  }

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true);
    try {
      await api.post("/api/cars", { ...form, year: Number(form.year), price: parseFloat(form.price), stock: Number(form.stock) });
      setModal(null); setForm({ make: "", model: "", year: new Date().getFullYear(), price: 0, stock: 0 });
      fetchCars(make, model);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  }

  async function handleUpdateStock(id) {
    setSaving(true);
    try {
      await api.put(`/api/cars/${id}/stock`, { stock: Number(stockVal) });
      setModal(null); fetchCars(make, model);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Remove this vehicle from inventory?")) return;
    try { await api.del(`/api/cars/${id}`); fetchCars(make, model); }
    catch (e) { setErr(e.message); }
  }

  const hasSearch = make || model;

  return (
    <Page
      title="Inventory"
      action={<Btn onClick={() => setModal("add")}>+ Add vehicle</Btn>}
    >
      <Alert msg={err} />

      {/* Search bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <input
            placeholder="Search make…"
            value={make}
            onChange={e => handleSearchChange("make", e.target.value)}
            style={{ maxWidth: 200, paddingRight: make ? 28 : 12 }}
          />
          {make && (
            <button onClick={() => handleSearchChange("make", "")} style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "var(--muted)", cursor: "pointer",
              fontSize: 14, lineHeight: 1, padding: 0,
            }}>✕</button>
          )}
        </div>
        <div style={{ position: "relative" }}>
          <input
            placeholder="Search model…"
            value={model}
            onChange={e => handleSearchChange("model", e.target.value)}
            style={{ maxWidth: 200, paddingRight: model ? 28 : 12 }}
          />
          {model && (
            <button onClick={() => handleSearchChange("model", "")} style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "var(--muted)", cursor: "pointer",
              fontSize: 14, lineHeight: 1, padding: 0,
            }}>✕</button>
          )}
        </div>
        {searching && (
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Searching…</span>
        )}
        {!searching && hasSearch && (
          <Btn variant="ghost" onClick={handleClear}>Clear all</Btn>
        )}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading ? <Spinner /> : !cars.length
          ? <EmptyState msg={hasSearch ? `No vehicles matching "${[make, model].filter(Boolean).join(" ")}".` : "No vehicles found."} />
          : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Make</th><th>Model</th><th>Year</th><th>Price</th><th>Stock</th><th></th>
              </tr>
            </thead>
            <tbody>
              {cars.map(car => (
                <tr key={car.id}>
                  <td style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 11 }}>{car.id}</td>
                  <td style={{ fontWeight: 500 }}>{car.make}</td>
                  <td>{car.model}</td>
                  <td style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>{car.year}</td>
                  <td style={{ fontFamily: "var(--mono)", color: "var(--green)" }}>
                    {car.price != null ? `$${Number(car.price).toLocaleString()}` : "—"}
                  </td>
                  <td>
                    <Badge color={car.stock === 0 ? "red" : car.stock < 3 ? "amber" : "green"}>
                      {car.stock}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Btn small variant="secondary" onClick={() => { setStockVal(car.stock); setModal(`stock:${car.id}`); }}>
                        Update stock
                      </Btn>
                      <Btn small variant="danger" onClick={() => handleDelete(car.id)}>Remove</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modal === "add" && (
        <Modal title="Add vehicle" onClose={() => setModal(null)}>
          <form onSubmit={handleAdd}>
            <Field label="Make"><input value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} placeholder="e.g. Toyota" required /></Field>
            <Field label="Model"><input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="e.g. Corolla" required /></Field>
            <Field label="Price ($)">
              <input type="number" step="0.01" min="0" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="e.g. 35000" required />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Year"><input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} min="1900" max="2030" /></Field>
              <Field label="Stock"><input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} min="0" /></Field>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn variant="secondary" onClick={() => setModal(null)} type="button">Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? "Saving…" : "Add vehicle"}</Btn>
            </div>
          </form>
        </Modal>
      )}

      {modal?.startsWith("stock:") && (() => {
        const id = Number(modal.split(":")[1]);
        const car = cars.find(c => c.id === id);
        return (
          <Modal title={`Update stock — ${car?.make} ${car?.model}`} onClose={() => setModal(null)}>
            <Field label="New stock level">
              <input type="number" value={stockVal} onChange={e => setStockVal(e.target.value)} min="0" autoFocus />
            </Field>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn onClick={() => handleUpdateStock(id)} disabled={saving}>{saving ? "Saving…" : "Update"}</Btn>
            </div>
          </Modal>
        );
      })()}
    </Page>
  );
}

// ─── Customers page ───────────────────────────────────────────────────────────
function CustomersPage() {
  const api = useApi();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [editTarget, setEditTarget] = useState(null); // customer being edited
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/customers");
      setCustomers(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCustomers(); }, []);

  function openAdd() {
    setForm({ name: "", email: "", phone: "" });
    setEditTarget(null);
    setModal("add");
  }

  function openEdit(c) {
    setForm({ name: c.name, email: c.email, phone: c.phone || "" });
    setEditTarget(c);
    setModal("edit");
  }

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await api.post("/api/customers", form);
      setModal(null); fetchCustomers();
    } catch (e) { setErr(e.message); }
    setSaving(false);
  }

  async function handleEdit(e) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await api.put(`/api/customers/${editTarget.id}`, form);
      // Optimistic update — reflect changes immediately without re-fetch
      setCustomers(prev => prev.map(c =>
        c.id === editTarget.id ? { ...c, ...form } : c
      ));
      setModal(null);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Remove this customer?")) return;
    try { await api.del(`/api/customers/${id}`); fetchCustomers(); }
    catch (e) { setErr(e.message); }
  }

  const CustomerForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit}>
      <Alert msg={err} />
      <Field label="Full name">
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Jane Smith" required autoFocus />
      </Field>
      <Field label="Email">
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="jane@example.com" required />
      </Field>
      <Field label="Phone (optional)">
        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="+61 400 000 000" />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="secondary" onClick={() => setModal(null)} type="button">Cancel</Btn>
        <Btn type="submit" disabled={saving}>{saving ? "Saving…" : submitLabel}</Btn>
      </div>
    </form>
  );

  return (
    <Page title="Customers" action={<Btn onClick={openAdd}>+ New customer</Btn>}>
      <Alert msg={err} />
      <Card style={{ padding: 0 }}>
        {loading ? <Spinner /> : !customers.length ? <EmptyState msg="No customers yet." /> : (
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Since</th><th></th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 11 }}>{c.id}</td>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td style={{ color: "var(--accent)" }}>{c.email}</td>
                  <td style={{ color: "var(--muted)" }}>{c.phone || "—"}</td>
                  <td style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Btn small variant="secondary" onClick={() => openEdit(c)}>Edit</Btn>
                      <Btn small variant="danger" onClick={() => handleDelete(c.id)}>Remove</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modal === "add" && (
        <Modal title="New customer" onClose={() => setModal(null)}>
          <CustomerForm onSubmit={handleAdd} submitLabel="Add customer" />
        </Modal>
      )}

      {modal === "edit" && (
        <Modal title={`Edit — ${editTarget?.name}`} onClose={() => setModal(null)}>
          <CustomerForm onSubmit={handleEdit} submitLabel="Save changes" />
        </Modal>
      )}
    </Page>
  );
}

// ─── Sales page ───────────────────────────────────────────────────────────────
function SalesPage() {
  const api = useApi();
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ customerId: "", carId: "", saleAmount: "" });
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null); // which sale row is being updated

  useEffect(() => {
    Promise.all([
      api.get("/api/sales").catch(() => []),
      api.get("/api/customers").catch(() => []),
      api.get("/api/cars").catch(() => []),
    ]).then(([s, c, ca]) => {
      setSales(Array.isArray(s) ? s : []);
      setCustomers(Array.isArray(c) ? c : []);
      setCars(Array.isArray(ca) ? ca : []);
      setLoading(false);
    });
  }, []);

  const fetchSales = () =>
    api.get("/api/sales").then(d => setSales(Array.isArray(d) ? d : []));

  async function handleCreate(e) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await api.post("/api/sales", {
        customerId: Number(form.customerId),
        carId: Number(form.carId),
        saleAmount: parseFloat(form.saleAmount),
      });
      setModal(false); setForm({ customerId: "", carId: "", saleAmount: "" });
      fetchSales();
    } catch (e) { setErr(e.message); }
    setSaving(false);
  }

  async function handleUpdateStatus(id, newStatus) {
    setUpdatingId(id);
    try {
      await api.put(`/api/sales/${id}/status`, { status: newStatus });
      // Optimistically update local state — no need to re-fetch
      setSales(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (e) { setErr(`Failed to update status: ${e.message}`); }
    setUpdatingId(null);
  }

  const statusColor = s =>
    s === "Completed" ? "green" : s === "Cancelled" ? "red" : "amber";

  // Which actions are available from each status
  const nextActions = {
    Pending:   [{ label: "Mark completed", status: "Completed", color: "var(--green)" },
                { label: "Cancel",          status: "Cancelled", color: "var(--red)"   }],
    Completed: [{ label: "Revert to pending", status: "Pending", color: "var(--amber)" }],
    Cancelled: [{ label: "Revert to pending", status: "Pending", color: "var(--amber)" }],
  };

  return (
    <Page title="Sales" action={<Btn onClick={() => setModal(true)}>+ Record sale</Btn>}>
      <Alert msg={err} />
      <Card style={{ padding: 0 }}>
        {loading ? <Spinner /> : !sales.length ? <EmptyState msg="No sales recorded yet." /> : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Customer</th><th>Vehicle</th>
                <th>Amount</th><th>Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => {
                const currentStatus = s.status || "Pending";
                const actions = nextActions[currentStatus] || [];
                const isUpdating = updatingId === s.id;

                return (
                  <tr key={s.id}>
                    <td style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 11 }}>{s.id}</td>
                    <td style={{ fontWeight: 500 }}>{s.customerName || `#${s.customerId}`}</td>
                    <td>{s.make || ""} {s.model || s.carId}</td>
                    <td style={{ fontFamily: "var(--mono)" }}>${Number(s.saleAmount).toLocaleString()}</td>
                    <td style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>
                      {s.saleDate ? new Date(s.saleDate).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <Badge color={statusColor(currentStatus)}>{currentStatus}</Badge>
                    </td>
                    <td>
                      {isUpdating ? (
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>Saving…</span>
                      ) : (
                        <div style={{ display: "flex", gap: 6 }}>
                          {actions.map(a => (
                            <button
                              key={a.status}
                              onClick={() => handleUpdateStatus(s.id, a.status)}
                              style={{
                                padding: "4px 10px", borderRadius: "var(--radius)",
                                background: "transparent", border: `1px solid ${a.color}`,
                                color: a.color, fontSize: 11, cursor: "pointer",
                                fontFamily: "var(--sans)", fontWeight: 500,
                                transition: "background 0.15s",
                                whiteSpace: "nowrap",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = `${a.color}18`}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {modal && (
        <Modal title="Record sale" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate}>
            <Alert msg={err} />
            <Field label="Customer">
              <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} required>
                <option value="">Select customer…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
              </select>
            </Field>
            <Field label="Vehicle">
              <select value={form.carId} onChange={e => setForm(f => ({ ...f, carId: e.target.value }))} required>
                <option value="">Select vehicle…</option>
                {cars.filter(c => c.stock > 0).map(c => (
                  <option key={c.id} value={c.id}>{c.make} {c.model} ({c.year}) — {c.stock} in stock</option>
                ))}
              </select>
            </Field>
            <Field label="Sale amount ($)">
              <input type="number" step="0.01" value={form.saleAmount}
                onChange={e => setForm(f => ({ ...f, saleAmount: e.target.value }))}
                placeholder="35000.00" required />
            </Field>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn variant="secondary" onClick={() => setModal(false)} type="button">Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? "Saving…" : "Record sale"}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

// ─── Analytics page ───────────────────────────────────────────────────────────
function AnalyticsPage() {
  const api = useApi();

  // Default range: first day of current month → today
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const fmt = d => d.toISOString().slice(0, 10); // YYYY-MM-DD for input[type=date]

  const [from, setFrom] = useState(fmt(firstOfMonth));
  const [to,   setTo]   = useState(fmt(today));
  const [data, setData] = useState({ revenue: null, topBrands: null, stockSummary: null });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchAll = useCallback(async (f, t) => {
    setLoading(true); setErr("");
    try {
      const [revenue, topBrands, stockSummary] = await Promise.all([
        api.get(`/api/analytics/revenue?from=${f}&to=${t}`).catch(() => null),
        api.get("/api/analytics/topBrands").catch(() => null),
        api.get("/api/analytics/stockSummary").catch(() => null),
      ]);
      setData({ revenue, topBrands, stockSummary });
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(from, to); }, []);

  function handleApply() {
    if (from > to) { setErr("'From' date must be before 'To' date."); return; }
    fetchAll(from, to);
  }

  function setPreset(preset) {
    const now = new Date();
    let f, t = fmt(now);
    if (preset === "month") {
      f = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
    } else if (preset === "quarter") {
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      f = fmt(qStart);
    } else if (preset === "year") {
      f = fmt(new Date(now.getFullYear(), 0, 1));
    } else if (preset === "alltime") {
      f = "2000-01-01";
    }
    setFrom(f); setTo(t);
    fetchAll(f, t);
  }

  const rev    = data.revenue;
  const brands = Array.isArray(data.topBrands) ? data.topBrands : [];
  const stock  = data.stockSummary;

  return (
    <Page title="Analytics">
      {/* ── Date range controls ── */}
      <Card style={{ marginBottom: 20, padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              style={{ width: 150 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              style={{ width: 150 }} />
          </div>
          <Btn onClick={handleApply} disabled={loading}>
            {loading ? "Loading…" : "Apply"}
          </Btn>
          <div style={{ display: "flex", gap: 6, marginLeft: 4 }}>
            {[
              { label: "This month",   key: "month"   },
              { label: "This quarter", key: "quarter" },
              { label: "This year",    key: "year"    },
              { label: "All time",     key: "alltime" },
            ].map(p => (
              <button key={p.key} onClick={() => setPreset(p.key)} style={{
                padding: "5px 10px", borderRadius: "var(--radius)",
                background: "var(--surface2)", border: "1px solid var(--border2)",
                color: "var(--muted)", fontSize: 11, cursor: "pointer",
                fontFamily: "var(--sans)", transition: "color 0.15s, border-color 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border2)"; }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {err && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 10 }}>{err}</div>}
      </Card>

      {/* ── Revenue stat cards ── */}
      {loading ? <Spinner /> : rev ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
          <StatCard label="Total revenue"  value={`$${Number(rev.total || 0).toLocaleString()}`}        accent="var(--green)" sub="for selected period" />
          <StatCard label="This month"     value={`$${Number(rev.thisMonth || 0).toLocaleString()}`} />
          <StatCard label="Average sale"   value={`$${Number(rev.averageSale || 0).toLocaleString()}`} />
          <StatCard label="Total sales"    value={rev.totalSales ?? "—"} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
          {["Total revenue", "This month", "Average sale", "Total sales"].map(l => (
            <StatCard key={l} label={l} value="—" />
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 14 }}>
            Top brands by volume
          </div>
          {!brands.length
            ? <EmptyState msg="No brand data yet." />
            : brands.map((b, i) => {
                const max = brands[0]?.count || 1;
                const pct = Math.round((b.count / max) * 100);
                return (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                      <span>{b.brand || b.make}</span>
                      <span style={{ fontFamily: "var(--mono)", color: "var(--accent)" }}>{b.count}</span>
                    </div>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.4s" }} />
                    </div>
                  </div>
                );
              })
          }
        </Card>

        <Card>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 14 }}>
            Stock summary
          </div>
          {!stock
            ? <EmptyState msg="No stock data." />
            : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>Total models</span>
                  <span style={{ fontFamily: "var(--mono)" }}>{stock.totalModels ?? "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>Total units</span>
                  <span style={{ fontFamily: "var(--mono)" }}>{stock.totalUnits ?? "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>Out of stock</span>
                  <Badge color="red">{stock.outOfStockCount ?? "—"}</Badge>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>Inventory value</span>
                  <span style={{ fontFamily: "var(--mono)", color: "var(--green)" }}>
                    {stock.inventoryValue != null ? `$${Number(stock.inventoryValue).toLocaleString()}` : "—"}
                  </span>
                </div>
              </>
            )
          }
        </Card>
      </div>
    </Page>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────
function Shell() {
  const [page, setPage] = useState("dashboard");

  const pages = {
    dashboard: <DashboardPage />,
    inventory:  <InventoryPage />,
    customers:  <CustomersPage />,
    sales:      <SalesPage />,
    analytics:  <AnalyticsPage />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ marginLeft: "var(--sidebar-w)", flex: 1, minHeight: "100vh" }}>
        {pages[page]}
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { token } = useAuth();
  return (
    <>
      <style>{css}</style>
      {token ? <Shell /> : <LoginPage />}
    </>
  );
}

// ─── Entry (wrap with AuthProvider in main.jsx) ───────────────────────────────
export function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}