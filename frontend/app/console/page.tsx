"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import {
  Activity,
  ArrowUpRight,
  ArrowRight,
  Bell,
  BrainCircuit,
  ChevronRight,
  Command,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Network,
  Play,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Terminal,
  Users,
  Workflow,
  X,
  Zap,
  RotateCcw,
  Menu,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import Brand from "@/components/brand";
import DataTable from "@/components/data-table";
import IncidentReplay from "@/components/incident-replay";
import { api, post, Incident } from "@/components/api";
const Topology = dynamic(() => import("@/components/topology"), {
  ssr: false,
  loading: () => <p>Loading network graph…</p>,
});
const InvestigationGraph = dynamic(
  () => import("@/components/investigation-graph"),
  { ssr: false },
);
const nav = [
  ["Command Center", LayoutDashboard],
  ["Live Threats", Activity],
  ["Incidents", ShieldAlert],
  ["AI Analyst", BrainCircuit],
  ["Network Map", Network],
  ["Vulnerabilities", Shield],
  ["Asset Inventory", Users],
  ["Response Playbooks", Workflow],
  ["Analytics", SlidersHorizontal],
  ["Reports", FileText],
  ["Detection Rules", Terminal],
  ["Settings", Settings],
] as const;
const useUI = create<{ page: string; setPage: (p: string) => void }>((set) => ({
  page: "Command Center",
  setPage: (page) => set({ page }),
}));
const date = (v: string) =>
  new Date(v).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
const Badge = ({ value }: { value: string }) => (
  <span className={`badge ${value.toLowerCase().replaceAll(" ", "-")}`}>
    {value}
  </span>
);
export default function Console() {
  const qc = useQueryClient();
  const reducedMotion = useReducedMotion();
  const { page, setPage } = useUI();
  const [auth, setAuth] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [palette, setPalette] = useState(false);
  const [search, setSearch] = useState("");
  const [mobile, setMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [hours, setHours] = useState(24);
  const [question, setQuestion] = useState(
    "Explain the detection evidence and recommend next steps.",
  );
  const [analysis, setAnalysis] = useState<any>(null);
  const [graphInfo, setGraphInfo] = useState("");
  const [asset, setAsset] = useState<any>(null);
  const [note, setNote] = useState("");
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    api("/auth/me")
      .then(setAuth)
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
      if (e.key === "Escape") {
        setPalette(false);
        setSelected(null);
        setAsset(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (selected === null && !asset && !palette) return;
    const previous = document.activeElement as HTMLElement | null;
    const id = setTimeout(() => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      dialog
        ?.querySelector<HTMLElement>("button,input,textarea,a[href]")
        ?.focus();
    }, 0);
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      const items = Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input,textarea,select,[tabindex="0"]',
        ) || [],
      );
      const first = items[0],
        last = items[items.length - 1];
      if (!first) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      clearTimeout(id);
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [selected, asset, palette]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (!auth) return;
    let ws: WebSocket;
    let retry: ReturnType<typeof setTimeout>;
    let stopped = false;
    const open = () => {
      const url =
        process.env.NEXT_PUBLIC_WS_URL ||
        `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:8000/ws`;
      ws = new WebSocket(url);
      ws.onopen = () => setConnected(true);
      ws.onmessage = (e) => {
        if (JSON.parse(e.data).type !== "heartbeat") qc.invalidateQueries();
      };
      ws.onclose = () => {
        setConnected(false);
        if (!stopped) retry = setTimeout(open, 5000);
      };
    };
    open();
    const ping = setInterval(() => {
      if (ws?.readyState === 1) ws.send("ping");
    }, 20000);
    return () => {
      stopped = true;
      clearTimeout(retry);
      clearInterval(ping);
      ws?.close();
    };
  }, [auth, qc]);
  const query = (key: string, path: string) =>
    useQuery<any>({
      queryKey: [key, path],
      queryFn: () => api(path),
      enabled: !!auth,
      refetchInterval: connected ? false : 10000,
    });
  const metrics = query("analytics", `/analytics?hours=${hours}`);
  const incidents = query("incidents", "/incidents");
  const events = query("events", "/events");
  const assets = query("assets", "/assets");
  const rules = query("rules", "/rules");
  const playbooks = query("playbooks", "/playbooks");
  const findings = query("findings", "/vulnerabilities");
  const audit = query("audit", "/audit");
  const health = query("health", "/health");
  const detail = useQuery<Incident>({
    queryKey: ["detail", selected],
    queryFn: () => api(`/incidents/${selected}`),
    enabled: !!auth && selected !== null,
  });
  const list: Incident[] = incidents.data || [];
  const ev: any[] = events.data || [];
  const m = metrics.data;
  const a: any[] = assets.data || [];
  async function action(fn: () => Promise<any>, message: string) {
    setBusy(true);
    setError("");
    try {
      const result = await fn();
      setToast(message);
      await qc.invalidateQueries();
      return result;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await action(async () => {
      const u = await post("/auth/login", {
        username: form.get("username"),
        password: form.get("password"),
      });
      setAuth(u);
    }, "Session established");
  }
  async function runDemo() {
    const r = await action(
      () => post("/demo/run"),
      "AgriShield events processed. Detection evidence is ready.",
    );
    if (r) {
      setSelected(r.incident_ids[r.incident_ids.length - 1]);
      setAnalysis(null);
    }
  }
  function openIncident(id: number) {
    setAsset(null);
    setSelected(id);
    setAnalysis(null);
    setGraphInfo("");
  }
  const incidentTable = (items: Incident[]) => (
    <DataTable
      rows={items}
      label="Incidents"
      onOpen={(i) => openIncident(i.id)}
      columns={[
        {
          key: "title",
          label: "INCIDENT / DETECTION",
          value: (i) => i.title,
          render: (i) => (
            <>
              <small>
                AX-{String(i.id).padStart(4, "0")} · {i.rule_id}
              </small>
              {i.title}
            </>
          ),
        },
        {
          key: "severity",
          label: "SEVERITY",
          value: (i) => i.severity,
          render: (i) => <Badge value={i.severity} />,
        },
        { key: "hostname", label: "ASSET", value: (i) => i.hostname },
        {
          key: "status",
          label: "STATUS",
          value: (i) => i.status,
          render: (i) => <Badge value={i.status} />,
        },
      ]}
      empty={
        <Empty
          title="No incidents in your queue"
          text="Run the AgriShield demo to send synthetic events through the detection pipeline."
        />
      }
    />
  );
  const feed = (
    <DataTable
      rows={ev.slice(0, page === "Command Center" ? 8 : 100)}
      label="Events"
      columns={[
        {
          key: "timestamp",
          label: "TIME / UTC",
          value: (e) => e.timestamp,
          render: (e) => (
            <span className="mono">
              {new Date(e.timestamp).toISOString().slice(11, 19)}
            </span>
          ),
        },
        { key: "source_ip", label: "SOURCE IP", value: (e) => e.source_ip },
        { key: "hostname", label: "DESTINATION", value: (e) => e.hostname },
        {
          key: "event_type",
          label: "EVENT",
          value: (e) => e.event_type,
          render: (e) => (
            <span className="event-type">
              {e.synthetic && <span className="tiny-dot" />}
              {e.event_type}
            </span>
          ),
        },
        {
          key: "outcome",
          label: "OUTCOME",
          value: (e) => e.outcome,
          render: (e) => <Badge value={e.outcome} />,
        },
      ]}
      details={(e) => (
        <div className="event-details">
          <span className="eyebrow">
            EVT-{e.id} / {e.synthetic ? "SYNTHETIC" : "IMPORTED"} TELEMETRY
          </span>
          <p>
            {e.username} · {e.source} · {new Date(e.timestamp).toLocaleString()}
          </p>
          <pre>{JSON.stringify(e.payload, null, 2)}</pre>
        </div>
      )}
      empty={
        <Empty
          title="Waiting for telemetry"
          text="No live collectors are connected. Run a labeled synthetic scenario to begin."
        />
      }
    />
  );
  if (checking)
    return (
      <div className="login">
        <Loader2 className="spin" /> Restoring session…
      </div>
    );
  if (!auth)
    return (
      <div className="login">
        <div className="login-panel">
          <Brand />
          <div className="eyebrow">YOUR COMMAND CENTER AWAITS</div>
          <h1>
            Welcome back,
            <br />
            <span className="dim">defender.</span>
          </h1>
          <p>Sign in to your secure operations workspace.</p>
          <form onSubmit={login}>
            <label>
              Username
              <input
                name="username"
                autoComplete="username"
                required
                defaultValue="analyst"
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            {error && (
              <div className="error" role="alert">
                {error}
              </div>
            )}
            <button className="button" disabled={busy}>
              {busy ? (
                <Loader2 className="spin" size={17} />
              ) : (
                <ShieldCheck size={17} />
              )}{" "}
              Authenticate <ArrowRight size={16} />
            </button>
          </form>
          <p className="login-note">
            Demo accounts are created from server environment configuration. No
            credentials are embedded in the application.
          </p>
          <a className="text-link" href="/">
            ← Back to AEGIS-X
          </a>
        </div>
        <div className="login-visual">
          <span className="eyebrow">THE AEGIS-X WORKSPACE</span>
          <div className="login-monogram">
            AX<span>—01</span>
          </div>
          <h2>
            THE ART OF
            <br />
            <span>STAYING AHEAD.</span>
          </h2>
          <p>
            Independent detection.
            <br />
            Evidence-grounded decisions.
            <br />
            The human stays in control.
          </p>
          <span className="login-spec">
            SYNTHETIC ENVIRONMENT / REAL CORRELATION
          </span>
        </div>
      </div>
    );
  return (
    <div className={`app-shell ${collapsed ? "rail-collapsed" : ""}`}>
      <aside
        inert={selected !== null || !!asset || palette}
        className={`sidebar ${mobile ? "open" : ""}`}
      >
        <Brand />
        <div className="workspace">
          <span className="workspace-icon">A</span>
          <div>
            AgriShield Enterprise<small>Fictional demonstration network</small>
          </div>
          <Badge value="Demo" />
        </div>
        <small className="nav-caption">OPERATIONS WORKSPACE</small>
        <nav>
          {nav.map(([name, Icon], i) => (
            <button
              key={name}
              aria-label={name}
              title={collapsed ? name : undefined}
              className={page === name ? "active" : ""}
              onClick={() => {
                setPage(name);
                setMobile(false);
                setSearch("");
              }}
            >
              <Icon size={17} />
              <span>{name}</span>
              {name === "Incidents" && list.length > 0 && (
                <em>{list.filter((i) => i.status !== "Resolved").length}</em>
              )}
              {i === 2 && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <button
          className="rail-toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            "→"
          ) : (
            <>
              ← <span>Collapse navigation</span>
            </>
          )}
        </button>
        <div className="sidebar-bottom">
          <div className="system-card">
            <span className="live-dot" />{" "}
            {health.data ? "System operational" : "Checking backend…"}
            <small>Built-in containment is simulated</small>
          </div>
          <div className="user-row">
            <span className="avatar">
              {auth.username.slice(0, 2).toUpperCase()}
            </span>
            <div>
              {auth.username}
              <small>{auth.role}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={() =>
                action(async () => {
                  await post("/auth/logout");
                  setAuth(null);
                  qc.clear();
                }, "Signed out")
              }
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div
        className="main-shell"
        inert={selected !== null || !!asset || palette}
      >
        <header className="app-header">
          <button
            className="icon-button mobile-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMobile(!mobile)}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumbs">
            Workspace <ChevronRight size={13} /> <span>{page}</span>
          </div>
          <button className="search-trigger" onClick={() => setPalette(true)}>
            <Search size={15} />
            <span>Search workspace…</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="header-right">
            <span className="connection">
              <i className={connected ? "online" : ""} />
              {connected ? "Live stream" : "Polling · 10s"}
            </span>
            <span className="demo-tag">DEMO DATA</span>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={18} />
              {audit.data?.length > 0 && <span className="notification-dot" />}
            </button>
            <span className="avatar small">
              {auth.username.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="console-content" key={page}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">AEGIS-X / SECURITY OPERATIONS</div>
              <h1>
                {page}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {page === "Command Center"
                  ? "Your entire security posture. One intelligent view."
                  : "Evidence-driven operations across your demonstration environment."}
              </p>
            </div>
            <div className="heading-actions">
              <select
                aria-label="Analytics time range"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
              >
                <option value={24}>Last 24 hours</option>
                <option value={168}>Last 7 days</option>
                <option value={720}>Last 30 days</option>
              </select>
              <button
                className="button small"
                disabled={busy || auth.role !== "administrator"}
                onClick={runDemo}
              >
                {busy ? (
                  <Loader2 size={15} className="spin" />
                ) : (
                  <Play size={14} />
                )}{" "}
                Run AgriShield demo
              </button>
            </div>
          </div>
          {error && (
            <div className="error" role="alert">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={15} />
              </button>
            </div>
          )}
          {[metrics, incidents, events, assets].some((q) => q.isError) && (
            <div className="error" role="alert">
              Unable to refresh security records. Check backend connectivity and
              session status.
              <button onClick={() => qc.invalidateQueries()}>Retry</button>
            </div>
          )}
          {page === "Command Center" && (
            <>
              <div className="demo-banner">
                <span className="banner-icon">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <strong>Your environment is ready for investigation.</strong>
                  <p>
                    AgriShield is a fictional enterprise. Generate synthetic
                    telemetry to see real correlation and incident creation.
                  </p>
                </div>
                <span className="tag">SAFE SIMULATION</span>
              </div>
              <div className="metrics-grid">
                {[
                  [
                    "Security events",
                    m?.events,
                    Activity,
                    "In selected time window",
                  ],
                  [
                    "Active incidents",
                    m?.active_incidents,
                    ShieldAlert,
                    "Awaiting analyst response",
                  ],
                  [
                    "Critical alerts",
                    m?.critical,
                    Zap,
                    "Open critical incidents",
                  ],
                  [
                    "Monitored assets",
                    m?.assets,
                    Network,
                    "Fictional enterprise inventory",
                  ],
                ].map(([title, value, Icon, sub], i) => {
                  const I = Icon as typeof Activity;
                  return (
                    <div className="metric-card" key={String(title)}>
                      <div>
                        <span>{String(title)}</span>
                        <I size={17} />
                      </div>
                      <strong
                        className={i === 2 && Number(value) > 0 ? "red" : ""}
                      >
                        {value === undefined ? "—" : String(value)}
                      </strong>
                      <small>{String(sub)}</small>
                    </div>
                  );
                })}
              </div>
              <div className="dashboard-charts">
                <section className="panel">
                  <PanelHeader
                    title="Threat activity"
                    subtitle="Hourly stored event volume · UTC"
                    extra={
                      <span className="legend">
                        <i /> Security events
                      </span>
                    }
                  />
                  <div className="chart-body">
                    {m?.series.length ? (
                      <ResponsiveContainer width="100%" height={230}>
                        <AreaChart data={m.series}>
                          <CartesianGrid stroke="#282b30" vertical={false} />
                          <XAxis
                            dataKey="time"
                            tick={{ fill: "#96999f", fontSize: 10 }}
                            tickFormatter={(v) => v.slice(11)}
                            axisLine={false}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fill: "#96999f", fontSize: 10 }}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#17191d",
                              border: "1px solid #35383e",
                              borderRadius: 2,
                            }}
                          />
                          <Area
                            isAnimationActive={!reducedMotion}
                            type="monotone"
                            dataKey="events"
                            stroke="#d6d8d3"
                            fill="#d6d8d309"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <Empty
                        title="The next signal starts here"
                        text="Activity charts populate from ingested events. No illustrative metrics are mixed into your dashboard."
                      />
                    )}
                  </div>
                  <div className="chart-footer">
                    <span>DETERMINISTIC DETECTION</span>
                    <span>{rules.data?.length ?? "—"} rules enabled</span>
                  </div>
                </section>
                <section className="panel posture">
                  <PanelHeader
                    title="Exposure overview"
                    subtitle="Incident severity and asset status"
                  />
                  <div className="severity-overview">
                    <span className="eyebrow">INCIDENT SEVERITY</span>
                    {Object.entries(m?.severities || {}).map(
                      ([severity, count]) => (
                        <div key={severity}>
                          <span className={`severity-tick ${severity}`} />
                          <span>{severity}</span>
                          <div className="severity-track">
                            <i
                              className={severity}
                              style={{
                                width: `${
                                  (Number(count) /
                                    Math.max(
                                      1,
                                      Object.values(
                                        m?.severities || {},
                                      ).reduce<number>(
                                        (sum, n) => sum + Number(n),
                                        0,
                                      ),
                                    )) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <strong>{String(count)}</strong>
                        </div>
                      ),
                    )}
                  </div>
                  <div className="asset-security-list">
                    {a.slice(0, 3).map((item) => (
                      <button key={item.id} onClick={() => setAsset(item)}>
                        <span
                          className={`asset-state ${item.risk ? "risk" : ""}`}
                        />
                        <span>{item.hostname}</span>
                        <small>
                          {item.risk ? `RISK ${item.risk}` : "CLEAR"}
                        </small>
                      </button>
                    ))}
                  </div>
                  <div className="posture-row">
                    <span>Open vulnerabilities</span>
                    <strong>{m?.open_vulnerabilities ?? "—"}</strong>
                  </div>
                  <div className="posture-row">
                    <span>Response executions</span>
                    <strong>{m?.response_executions ?? "—"}</strong>
                  </div>
                  <div className="posture-row">
                    <span>Mean response time</span>
                    <strong>
                      {m?.mean_time_to_respond_seconds == null
                        ? "Not measured"
                        : `${Math.round(m.mean_time_to_respond_seconds)}s`}
                    </strong>
                  </div>
                </section>
              </div>
              <section className="panel">
                <PanelHeader
                  title="Live security feed"
                  subtitle="Normalized events · synthetic records carry a lime indicator"
                  extra={
                    <button
                      className="text-link"
                      onClick={() => setPage("Live Threats")}
                    >
                      View all events <ArrowUpRight size={14} />
                    </button>
                  }
                />
                {feed}
              </section>
              <section className="panel">
                <PanelHeader
                  title="Recent incidents"
                  subtitle="Correlated signals, ready for investigation"
                  extra={
                    <button
                      className="text-link"
                      onClick={() => setPage("Incidents")}
                    >
                      View incidents <ArrowUpRight size={14} />
                    </button>
                  }
                />
                {incidentTable(list.slice(0, 5))}
              </section>
            </>
          )}
          {page === "Live Threats" && (
            <section className="panel">
              <PanelHeader
                title="Event stream"
                subtitle="Latest 100 stored records · lime marks synthetic telemetry"
              />
              {feed}
            </section>
          )}
          {["Incidents", "Reports", "AI Analyst"].includes(page) && (
            <section className="panel">
              <PanelHeader
                title={
                  page === "Reports"
                    ? "Select an incident to generate its PDF"
                    : page === "AI Analyst"
                      ? "Select an incident for an evidence-grounded investigation"
                      : "Investigation queue"
                }
                subtitle="Open a record to review evidence, response history, and MITRE ATT&CK context"
              />
              {incidentTable(list)}
            </section>
          )}
          {page === "Network Map" && (
            <section className="panel">
              <PanelHeader
                title="AgriShield network topology"
                subtitle="Fictional enterprise links · red indicates an asset with active incidents"
              />
              <Topology assets={a} onSelect={setAsset} />
              <div className="chart-footer">
                Illustrative network links · asset risk is derived from stored
                incidents
              </div>
            </section>
          )}
          {page === "Asset Inventory" && (
            <section className="panel">
              <PanelHeader
                title="Enterprise assets"
                subtitle="Click an asset to inspect its stored relationships"
              />
              <div className="asset-grid">
                {a.map((v) => (
                  <button
                    key={v.id}
                    className="asset-card"
                    onClick={() => setAsset(v)}
                  >
                    <Network size={26} />
                    <Badge value={v.risk ? "At risk" : "No incidents"} />
                    <h3>{v.hostname}</h3>
                    <span className="mono">{v.ip}</span>
                    <div>
                      <span>{v.kind}</span>
                      <strong>
                        {v.incidents} incidents · {v.events} events
                      </strong>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
          {page === "Vulnerabilities" && (
            <section className="panel">
              <PanelHeader
                title="Vulnerability inventory"
                subtitle="Import structured JSON findings. No live scanner is connected."
                extra={
                  <>
                    <input
                      ref={file}
                      type="file"
                      accept="application/json,.json"
                      hidden
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f)
                          await action(async () => {
                            if (f.size > 500000)
                              throw new Error("File exceeds 500 KB");
                            const body = JSON.parse(await f.text());
                            return post("/vulnerabilities/import", body);
                          }, "Findings imported");
                        e.target.value = "";
                      }}
                    />
                    <button
                      className="button small outline"
                      disabled={auth.role !== "administrator"}
                      onClick={() => file.current?.click()}
                    >
                      Import findings <ArrowUpRight size={14} />
                    </button>
                  </>
                }
              />
              <DataTable<any>
                rows={findings.data || []}
                label="Vulnerabilities"
                columns={[
                  {
                    key: "cve",
                    label: "CVE / SOFTWARE",
                    value: (v) => v.cve,
                    render: (v) => (
                      <>
                        <strong>{v.cve}</strong>
                        <small>
                          {v.software}
                          {v.synthetic ? " · SYNTHETIC" : ""}
                        </small>
                      </>
                    ),
                  },
                  { key: "hostname", label: "ASSET", value: (v) => v.hostname },
                  {
                    key: "cvss",
                    label: "CVSS",
                    value: (v) => v.cvss,
                    render: (v) => (
                      <>
                        <Badge
                          value={
                            v.cvss >= 9
                              ? "critical"
                              : v.cvss >= 7
                                ? "high"
                                : "medium"
                          }
                        />
                        <span> {v.cvss}</span>
                      </>
                    ),
                  },
                  {
                    key: "status",
                    label: "STATUS",
                    value: (v) => v.status,
                    render: (v) => (
                      <button
                        className="text-link"
                        disabled={v.status === "Verified" || busy}
                        onClick={() => {
                          const stages = [
                            "Discovered",
                            "Triaged",
                            "In Progress",
                            "Mitigated",
                            "Verified",
                          ];
                          action(
                            () =>
                              api(`/vulnerabilities/${v.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({
                                  status: stages[stages.indexOf(v.status) + 1],
                                }),
                              }),
                            "Remediation status updated",
                          );
                        }}
                      >
                        {v.status}
                        <ChevronRight size={13} />
                      </button>
                    ),
                  },
                  {
                    key: "remediation",
                    label: "REMEDIATION",
                    value: (v) => v.remediation,
                  },
                ]}
                details={(v) => (
                  <div className="event-details">
                    <span className="eyebrow">
                      {v.synthetic ? "SYNTHETIC FINDING" : "IMPORTED FINDING"} /{" "}
                      {v.cve}
                    </span>
                    <p>
                      {v.software} on {v.hostname}
                    </p>
                    <p>{v.remediation}</p>
                  </div>
                )}
                empty={
                  <Empty
                    title="No findings imported"
                    text="Use samples/vulnerabilities.json for clearly labeled synthetic findings, or import your authorized assessment results."
                  />
                }
              />
            </section>
          )}
          {page === "Response Playbooks" && (
            <>
              <div className="info-banner">
                <ShieldCheck size={20} /> Default mode: Approval Required. Open
                an incident to execute a playbook. Built-in containment never
                modifies a real firewall or endpoint.
              </div>
              <div className="playbook-grid">
                {playbooks.data?.map((p: any) => (
                  <article className="panel playbook-card" key={p.id}>
                    <Workflow size={26} className="cyan" />
                    <Badge value="Approval required" />
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <button
                      className="text-link"
                      onClick={() => setPage("Incidents")}
                    >
                      Select incident <ArrowRight size={15} />
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
          {page === "Analytics" && (
            <>
              <div className="metrics-grid">
                {[
                  ["Events", m?.events],
                  ["Resolved incidents", m?.resolved],
                  ["Open vulnerabilities", m?.open_vulnerabilities],
                  ["Response executions", m?.response_executions],
                ].map(([t, v]) => (
                  <div className="metric-card" key={t}>
                    <span>{t}</span>
                    <strong>{v ?? "—"}</strong>
                  </div>
                ))}
              </div>
              <div className="analytics-grid">
                {[
                  ["Severity distribution", m?.severities],
                  ["Detection rule matches", m?.rules],
                  ["Most targeted assets", m?.targeted_assets],
                  ["Event source distribution", m?.sources],
                  ["Event categories", m?.categories],
                ].map(([title, values]) => (
                  <section className="panel" key={String(title)}>
                    <PanelHeader
                      title={String(title)}
                      subtitle="Derived from stored records in the selected window"
                    />
                    <div className="chart-body">
                      {values &&
                      Object.values(values).some((v) => Number(v) > 0) ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart
                            data={Object.entries(values).map(
                              ([name, value]) => ({ name, value }),
                            )}
                          >
                            <CartesianGrid stroke="#282b30" vertical={false} />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: "#96999f", fontSize: 10 }}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fill: "#96999f", fontSize: 10 }}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#17191d",
                                border: "1px solid #35383e",
                              }}
                            />
                            <Bar
                              isAnimationActive={!reducedMotion}
                              dataKey="value"
                              fill="#aeb3a7"
                              radius={[1, 1, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <Empty
                          title="No activity in this window"
                          text="Generate or import records to populate this chart."
                        />
                      )}
                    </div>
                  </section>
                ))}
              </div>
              <p className="subtle">
                Vulnerability history and MTTD are not yet measured. Current
                vulnerability counts are inventory totals.
              </p>
            </>
          )}
          {page === "Detection Rules" && (
            <section className="panel">
              <PanelHeader
                title="Correlation rule library"
                subtitle="Sigma-inspired deterministic rules · five-minute event windows"
              />
              <div className="rule-list">
                {rules.data?.map((r: any) => (
                  <article key={r.id}>
                    <div className="rule-icon">
                      <Terminal size={20} />
                    </div>
                    <div>
                      <small className="cyan mono">
                        {r.id} · MITRE ATT&CK {r.technique}
                      </small>
                      <h3>{r.title}</h3>
                      <p>{r.description}</p>
                    </div>
                    <Badge value={r.severity} />
                  </article>
                ))}
              </div>
            </section>
          )}
          {page === "Settings" && (
            <>
              <section className="panel settings-panel">
                <PanelHeader
                  title="Security engineering configuration"
                  subtitle="Read-only runtime status · configure integrations on the server"
                />
                <dl>
                  <dt>Environment</dt>
                  <dd>AgriShield · fictional demonstration enterprise</dd>
                  <dt>Investigation engine</dt>
                  <dd>{health.data?.ai || "Checking…"}</dd>
                  <dt>Response mode</dt>
                  <dd>
                    Approval Required by default · simulated containment only
                  </dd>
                  <dt>Authentication</dt>
                  <dd>
                    Argon2 password hashing · HTTP-only session cookies ·{" "}
                    {auth.role}
                  </dd>
                  <dt>Wazuh / VirusTotal / Nmap</dt>
                  <dd>
                    Not connected. See integration requirements in
                    documentation.
                  </dd>
                  <dt>Event delivery</dt>
                  <dd>
                    {connected
                      ? "Authenticated WebSocket"
                      : "10-second polling fallback; check WebSocket URL for remote hosts"}
                  </dd>
                </dl>
                <button
                  className="button danger small"
                  disabled={busy || auth.role !== "administrator"}
                  onClick={() => {
                    if (
                      confirm(
                        "Delete synthetic events and incidents? Imported records and audit history are retained.",
                      )
                    )
                      action(
                        () => post("/demo/reset", { confirmed: true }),
                        "Synthetic scenario reset",
                      );
                  }}
                >
                  <RotateCcw size={14} /> Reset demo
                </button>
              </section>
              <section className="panel">
                <PanelHeader
                  title="Security audit trail"
                  subtitle="Persisted authentication, investigations, transitions, and responses"
                />
                <AuditRows records={audit.data || []} />
              </section>
            </>
          )}
          <div className="console-footer">
            <span>
              <ShieldCheck size={12} /> AEGIS-X · The Art of Staying Ahead.
            </span>
            <span>SYNTHETIC ENVIRONMENT / EVIDENCE-BASED OPERATIONS</span>
          </div>
        </main>
      </div>
      {selected !== null && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="incident-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Incident investigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top">
              <span className="eyebrow">
                INVESTIGATION WORKSPACE / AX-{selected}
              </span>
              <button
                className="icon-button"
                aria-label="Close investigation"
                onClick={() => setSelected(null)}
              >
                <X />
              </button>
            </div>
            {detail.isLoading ? (
              <Empty
                title="Retrieving evidence…"
                text="Loading the stored incident record."
              />
            ) : detail.isError ? (
              <div className="error">
                Unable to load incident.{" "}
                <button onClick={() => detail.refetch()}>Retry</button>
              </div>
            ) : (
              detail.data && (
                <>
                  <div className="incident-heading">
                    <Badge value={detail.data.severity} />
                    <span className="tag">
                      {detail.data.synthetic
                        ? "SYNTHETIC DEMO"
                        : "IMPORTED TELEMETRY"}
                    </span>
                    <h2>{detail.data.title}</h2>
                    <p>
                      {detail.data.hostname} · {detail.data.source_ip} ·{" "}
                      {detail.data.rule?.technique} · Risk {detail.data.score}
                      /100
                    </p>
                  </div>
                  <div className="incident-actions">
                    <Badge value={detail.data.status} />
                    {detail.data.status !== "Resolved" && (
                      <button
                        className="button small outline"
                        disabled={busy}
                        onClick={() => {
                          const next = (
                            {
                              New: "Investigating",
                              Investigating: "Contained",
                              Contained: "Resolved",
                            } as any
                          )[detail.data!.status];
                          if (
                            confirm(
                              `Move incident to ${next}? This updates the investigation record only.`,
                            )
                          )
                            action(
                              () =>
                                api(`/incidents/${selected}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    status: next,
                                    confirmed: true,
                                  }),
                                }),
                              "Incident updated",
                            );
                        }}
                      >
                        Advance investigation <ArrowRight size={14} />
                      </button>
                    )}
                    <a
                      className="button small outline"
                      href={`/api/incidents/${selected}/report`}
                      download
                    >
                      <Download size={14} /> Download PDF
                    </a>
                  </div>
                  <IncidentReplay incident={detail.data} />
                  <div className="evidence-layout">
                    <section>
                      <h3>Detection evidence</h3>
                      <p className="subtle">{detail.data.rule?.description}</p>
                      <div className="timeline">
                        {detail.data.events?.map((e: any) => (
                          <div key={e.id}>
                            <span className="timeline-dot" />
                            <small className="mono">
                              {date(e.timestamp)} · EVT-{e.id}
                            </small>
                            <strong>
                              {e.event_type} <Badge value={e.outcome} />
                            </strong>
                            <p>
                              {e.username} → {e.hostname}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="analyst-panel">
                      <h3>
                        <BrainCircuit size={20} /> AEGIS INTELLIGENCE
                      </h3>
                      <p>Evidence-grounded analysis. No autonomous commands.</p>
                      <textarea
                        aria-label="Investigation question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        maxLength={2000}
                      />
                      <button
                        className="button small"
                        disabled={busy}
                        onClick={() =>
                          action(async () => {
                            const r = await post(
                              `/incidents/${selected}/investigate`,
                              { question },
                            );
                            setAnalysis(r);
                          }, "Investigation prepared")
                        }
                      >
                        Investigate evidence <ArrowUpRight size={14} />
                      </button>
                      {analysis && (
                        <div className="analysis-result">
                          <Badge value={analysis.mode} />
                          <p>{analysis.summary}</p>
                          <small className="cyan">
                            Evidence: {analysis.evidence.join(", ")}
                          </small>
                          <ul>
                            {analysis.recommendations.map(
                              (r: string, i: number) => (
                                <li key={i}>{r}</li>
                              ),
                            )}
                          </ul>
                          {analysis.notice && <p>{analysis.notice}</p>}
                        </div>
                      )}
                    </section>
                  </div>
                  <h3>Connected evidence</h3>
                  <InvestigationGraph
                    incident={detail.data}
                    onSelect={setGraphInfo}
                  />
                  {graphInfo && <p className="info-banner">{graphInfo}</p>}
                  <h3>Defensive response</h3>
                  <p className="subtle">
                    Approval required. All built-in response actions are local
                    or simulated.
                  </p>
                  <div className="response-buttons">
                    {playbooks.data?.map((p: any) => (
                      <button
                        className="button small outline"
                        key={p.id}
                        disabled={busy}
                        onClick={() => {
                          if (
                            confirm(
                              `Approve: ${p.title}? No real infrastructure will be modified.`,
                            )
                          )
                            action(
                              () =>
                                post(`/incidents/${selected}/respond`, {
                                  playbook_id: p.id,
                                  mode: "approval_required",
                                  confirmed: true,
                                }),
                              "Response recorded in audit history",
                            );
                        }}
                      >
                        {p.title}
                      </button>
                    ))}
                  </div>
                  <div className="response-history">
                    {detail.data.responses?.map((r: any) => (
                      <p key={r.id}>
                        <CheckCircle2 size={14} />
                        {r.result}
                        <small>
                          {r.actor} · {date(r.created_at)}
                        </small>
                      </p>
                    ))}
                  </div>
                  <h3>Investigation notes</h3>
                  {detail.data.notes?.map((n: any) => (
                    <div className="note" key={n.id}>
                      <small>
                        {n.actor} · {date(n.created_at)}
                      </small>
                      <p>{n.text}</p>
                    </div>
                  ))}
                  <form
                    className="note-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      action(async () => {
                        await post(`/incidents/${selected}/notes`, {
                          text: note,
                        });
                        setNote("");
                      }, "Note saved");
                    }}
                  >
                    <input
                      aria-label="Investigation note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      required
                      maxLength={4000}
                      placeholder="Add an evidence-based investigation note…"
                    />
                    <button className="button small" disabled={busy}>
                      Save note
                    </button>
                  </form>
                </>
              )
            )}
          </section>
        </div>
      )}
      {asset && (
        <div className="modal-backdrop" onClick={() => setAsset(null)}>
          <section
            className="asset-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Asset details"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button close"
              onClick={() => setAsset(null)}
              aria-label="Close asset"
            >
              <X />
            </button>
            <Network size={35} className="cyan" />
            <h2>{asset.hostname}</h2>
            <p className="mono">
              {asset.ip} · {asset.kind}
            </p>
            <div className="info-banner">
              Risk {asset.risk}/100 · {asset.events} stored events ·{" "}
              {asset.incidents} active incidents
            </div>
            <h3>Related incidents</h3>
            {incidentTable(list.filter((i) => i.hostname === asset.hostname))}
            <h3>Recent events</h3>
            {ev
              .filter((e) => e.hostname === asset.hostname)
              .slice(0, 8)
              .map((e) => (
                <p key={e.id} className="subtle">
                  EVT-{e.id} · {e.event_type} · {e.outcome} ·{" "}
                  {date(e.timestamp)}
                </p>
              ))}
            <h3>Vulnerability findings</h3>
            {findings.data
              ?.filter((v: any) => v.hostname === asset.hostname)
              .map((v: any) => (
                <p key={v.id}>
                  {v.cve} · CVSS {v.cvss} · {v.status}
                </p>
              ))}
            {!findings.data?.some(
              (v: any) => v.hostname === asset.hostname,
            ) && <p className="subtle">No findings imported for this asset.</p>}
          </section>
        </div>
      )}
      {palette && (
        <div className="modal-backdrop" onClick={() => setPalette(false)}>
          <section
            className="command-palette"
            role="dialog"
            aria-modal="true"
            aria-label="Search workspace"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <Search size={20} />
              <input
                autoFocus
                placeholder="Search pages, incidents, assets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button onClick={() => setPalette(false)}>
                <kbd>ESC</kbd>
              </button>
            </div>
            <small>NAVIGATION</small>
            {nav
              .filter(([n]) => n.toLowerCase().includes(search.toLowerCase()))
              .map(([n, I]) => (
                <button
                  key={n}
                  onClick={() => {
                    setPage(n);
                    setPalette(false);
                  }}
                >
                  <I size={17} />
                  {n}
                  <ArrowUpRight size={14} />
                </button>
              ))}
            {search &&
              list
                .filter((i) =>
                  `${i.title} ${i.hostname} AX-${i.id}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((i) => (
                  <button
                    key={i.id}
                    onClick={() => {
                      openIncident(i.id);
                      setPalette(false);
                    }}
                  >
                    <ShieldAlert size={16} />
                    AX-{i.id} · {i.title}
                  </button>
                ))}
            {search &&
              a
                .filter((v) => v.hostname.includes(search.toLowerCase()))
                .map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setAsset(v);
                      setPalette(false);
                    }}
                  >
                    <Network size={16} />
                    {v.hostname}
                  </button>
                ))}
          </section>
        </div>
      )}
      {notifications && (
        <section className="notifications">
          <div className="modal-top">
            <h3>Activity center</h3>
            <button
              className="icon-button"
              aria-label="Close notifications"
              onClick={() => setNotifications(false)}
            >
              <X size={18} />
            </button>
          </div>
          <AuditRows records={(audit.data || []).slice(0, 8)} />
        </section>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
function PanelHeader({
  title,
  subtitle,
  extra,
}: {
  title: string;
  subtitle: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="panel-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {extra}
    </div>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <span className="empty-cross">＋</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
function AuditRows({ records }: { records: any[] }) {
  return (
    <div className="audit-rows">
      {records.map((r) => (
        <div key={r.id}>
          <span className="tiny-dot" />
          <div>
            <strong>{r.action.replaceAll("_", " ")}</strong>
            <p>{r.detail}</p>
            <small>
              {r.actor} · {new Date(r.created_at).toLocaleString()}
            </small>
          </div>
        </div>
      ))}
      {!records.length && <p className="subtle">No audit entries recorded.</p>}
    </div>
  );
}
