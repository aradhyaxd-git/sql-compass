import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Show } from "@clerk/react";
import Footer from "@/components/layout/Footer";

const C = {
  void: "#01010a",
  hull: "#090914",
  deck: "#0e0e1c",
  raised: "#141428",
  primary: "#6366f1",
  pLight: "#818cf8",
  pGlow: "rgba(99,102,241,0.18)",
  signal: "#22d3ee",
  sGlow: "rgba(34,211,238,0.12)",
  online: "#10d98a",
  alert: "#fb4469",
  xp: "#fbbf24",
  t1: "#f1f5f9", 
  t2: "#94a3b8",
  t3: "#4a5568", 
  t4: "#1e2a40", 
  border: "rgba(255,255,255,0.07)",
  borderA: "rgba(99,102,241,0.4)",
};
const F = {
  display: "'Plus Jakarta Sans', sans-serif",
  ui: "'JetBrains Mono', monospace",
  sql: "'Courier Prime', 'Courier New', monospace",
  body: "'DM Sans', sans-serif",
};

const Fmono = F.ui;

const Icon = {
  Terminal: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M7 8l4 4-4 4M13 16h4" />
    </svg>
  ),
  Bolt: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Signal: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16" />
    </svg>
  ),
  Map: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  ),
  Chart: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Shield: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Arrow: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Compass: ({ size = 32 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke={C.primary} strokeWidth="1.5" />
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke={C.signal}
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.4"
      />
      <circle cx="24" cy="24" r="3.5" fill={C.primary} />
      <path d="M24 6 L26 21 L24 19 L22 21 Z" fill={C.primary} />
      <path d="M24 42 L22 27 L24 29 L26 27 Z" fill={C.t3} />
      <path d="M42 24 L27 22 L29 24 L27 26 Z" fill={C.t3} />
      <path d="M6 24 L21 26 L19 24 L21 22 Z" fill={C.t3} />
      <circle
        cx="24"
        cy="24"
        r="8"
        stroke={C.pLight}
        strokeWidth="0.5"
        strokeDasharray="2 4"
        opacity="0.5"
      />
    </svg>
  ),
};

function RankBadge({ rank, active }: { rank: number; active: boolean }) {
  const color = active ? C.pLight : C.t4;
  const glowColor = active ? "rgba(91,94,244,0.3)" : "transparent";
  const shapes = [
   
    <polygon
      key={0}
      points="12,2 22,12 12,22 2,12"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />,
   
    <>
      <polygon
        key={0}
        points="12,2 22,12 12,22 2,12"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <circle
        key={1}
        cx="12"
        cy="12"
        r="4"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
    </>,

    <polygon
      key={0}
      points="12,2 20,6.5 20,17.5 12,22 4,17.5 4,6.5"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />,
    
    <>
      <polygon
        key={0}
        points="12,2 20,6.5 20,17.5 12,22 4,17.5 4,6.5"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <polygon
        key={1}
        points="12,5 13.5,10 18,10 14.5,13 15.8,18 12,15 8.2,18 9.5,13 6,10 10.5,10"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
    </>,
   
    <>
      <polygon
        key={0}
        points="12,1 14.5,8.5 22,8.5 16,13 18.5,20.5 12,16 5.5,20.5 8,13 2,8.5 9.5,8.5"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <circle key={1} cx="12" cy="12" r="2.5" fill={color} opacity="0.6" />
    </>,
  ];

  return (
    <div
      style={{
        filter: active ? `drop-shadow(0 0 8px ${glowColor})` : "none",
        transition: "filter 0.3s",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {shapes[rank]}
      </svg>
    </div>
  );
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);

    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.8 + 0.6,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        const dx = n.x - mouse.current.x;
        const dy = n.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          n.x += (dx / dist) * 0.8;
          n.y += (dy / dist) * 0.8;
        }
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(91,94,244,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(91,94,244,${n.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.7,
      }}
    />
  );
}

function NoiseOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity: 0.022,
      }}
    />
  );
}

const TICKER_ITEMS = [
  "SELECT",
  "FROM",
  "WHERE",
  "JOIN",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "INNER JOIN",
  "LEFT JOIN",
  "WINDOW",
  "OVER",
  "PARTITION BY",
  "CTE",
  "UNION",
  "DISTINCT",
  "COUNT(*)",
  "AVG()",
  "MAX()",
  "MIN()",
  "SUM()",
  "RANK()",
  "ROW_NUMBER()",
  "COALESCE",
  "CASE WHEN",
  "INDEX",
  "EXPLAIN",
];
function SQLTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        padding: "10px 0",
        background: "rgba(8,8,15,0.6)",
      }}
    >
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{
          display: "flex",
          gap: 0,
          whiteSpace: "nowrap",
          width: "max-content",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: F.sql,
              fontSize: 11,
              color: i % 7 === 0 ? C.pLight : i % 5 === 0 ? C.signal : C.t3,
              padding: "0 24px",
              letterSpacing: "0.08em",
              borderRight: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function Pulse({ color = C.online }: { color?: string }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: 8,
        height: 8,
        flexShrink: 0,
      }}
    >
      <motion.span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: color,
          opacity: 0.3,
        }}
        animate={{ scale: [1, 2.2, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          position: "relative",
        }}
      />
    </span>
  );
}

function TiltCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 24 });
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 24 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotX.set(((e.clientY - cy) / rect.height) * -10);
    rotY.set(((e.clientX - cx) / rect.width) * 10);
  };
  const handleLeave = () => {
    rotX.set(0);
    rotY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX: sRotX,
        rotateY: sRotY,
        transformStyle: "preserve-3d",
        transformPerspective: 800,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 54,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 36px",
        background: scrolled ? "rgba(1,1,10,0.92)" : "rgba(1,1,10,0.4)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
        transition: "all 0.4s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <Icon.Compass size={22} />
        <span
          style={{
            fontFamily: F.display,
            fontWeight: 700,
            fontSize: 15,
            color: C.t1,
            letterSpacing: "-0.02em",
          }}
        >
          SQL Compass
        </span>
        <span
          style={{
            fontFamily: F.ui,
            fontSize: 9,
            letterSpacing: "0.12em",
            color: C.online,
            background: "rgba(0,229,160,0.07)",
            border: "1px solid rgba(0,229,160,0.18)",
            padding: "2px 7px",
            borderRadius: 3,
          }}
        >
          BETA
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Pulse />
        <span
          style={{
            fontFamily: F.ui,
            fontSize: 10,
            color: C.t4,
            letterSpacing: "0.08em",
            marginRight: 16,
          }}
        >
          SYS.ONLINE
        </span>
        <Show when="signed-out">
          <Link to="/auth" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ color: C.t1 }}
              style={{
                background: "none",
                border: "none",
                color: C.t2,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: F.body,
                padding: "6px 12px",
              }}
            >
              Sign in
            </motion.button>
          </Link>
          <Link to="/auth" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{
                boxShadow: `0 0 24px ${C.pGlow}`,
                background: "#6668f8",
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: C.primary,
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                padding: "7px 18px",
                borderRadius: 7,
                fontFamily: F.body,
                transition: "background 0.2s",
              }}
            >
              Launch →
            </motion.button>
          </Link>
        </Show>
        <Show when="signed-in">
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ boxShadow: `0 0 24px ${C.pGlow}` }}
              style={{
                background: C.primary,
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                padding: "7px 18px",
                borderRadius: 7,
                fontFamily: F.body,
              }}
            >
              Mission Control →
            </motion.button>
          </Link>
        </Show>
      </div>
    </nav>
  );
}

const TERM_LINES = [
  { t: "sys", v: "[ SQL COMPASS v1.0 ] — MISSION CONTROL INITIALIZING" },
  { t: "sys", v: "Bootstrapping PostgreSQL sandbox cluster..." },
  { t: "ok", v: "OK  Cluster ready  |  3 tables  |  8,420 rows" },
  { t: "sys", v: 'Loading mission: "Revenue by Quarter"' },
  { t: "blank", v: "" },
  { t: "kw", v: "SELECT " },
  { t: "field", v: "  DATE_TRUNC('quarter', order_date) AS quarter," },
  { t: "field", v: "  SUM(total_amount)                 AS revenue," },
  { t: "field", v: "  COUNT(*)                          AS orders" },
  { t: "kw", v: "FROM orders" },
  { t: "kw", v: "GROUP BY 1" },
  { t: "kw", v: "ORDER BY 1;" },
  { t: "blank", v: "" },
  { t: "head", v: "  quarter    │  revenue   │  orders " },
  { t: "div", v: "─────────────┼────────────┼─────────" },
  { t: "row", v: "  2024-Q1    │  $142,840  │    342  " },
  { t: "row", v: "  2024-Q2    │  $189,220  │    451  " },
  { t: "row", v: "  2024-Q3    │  $203,770  │    489  " },
  { t: "blank", v: "" },
  { t: "xp", v: ">>  MISSION COMPLETE  ·  +40 XP  ·  STREAK 12 DAYS" },
];

function HeroTerminal() {
  const [line, setLine] = useState(0);
  const [char, setChar] = useState(0);

  useEffect(() => {
    if (line >= TERM_LINES.length) return;
    const cur = TERM_LINES[line];
    if (cur.t === "blank") {
      setTimeout(() => {
        setLine((l) => l + 1);
        setChar(0);
      }, 120);
      return;
    }
    if (char >= cur.v.length) {
      const t = setTimeout(() => {
        setLine((l) => l + 1);
        setChar(0);
      }, 60);
      return () => clearTimeout(t);
    }
    const speed =
      cur.t === "sys" ? 18 : cur.t === "kw" || cur.t === "field" ? 28 : 10;
    const t = setTimeout(() => setChar((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [line, char]);

  const colorMap: Record<string, string> = {
    sys: C.t3,
    ok: C.online,
    kw: C.pLight,
    field: C.t2,
    head: C.t3,
    div: C.t4,
    row: C.t1,
    xp: C.xp,
    blank: "transparent",
  };

  return (
    <TiltCard style={{ position: "relative", zIndex: 10 }}>
      <div
        style={{
          background: "rgba(8,8,15,0.85)",
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: `0 0 0 1px rgba(91,94,244,0.08), 0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)`,
          backdropFilter: "blur(24px)",
          transformStyle: "preserve-3d",
        }}
      >
       
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 300,
            height: 200,
            background: `radial-gradient(ellipse, ${C.pGlow} 0%, transparent 70%)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "11px 16px",
            background: "rgba(13,13,24,0.9)",
            borderBottom: `1px solid ${C.border}`,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", gap: 7 }}>
            {["#ff3b30", "#ffcc02", "#28c940"].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: c,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Pulse color={C.online} />
            <span
              style={{
                fontFamily: F.ui,
                fontSize: 11,
                color: C.t4,
                letterSpacing: "0.07em",
              }}
            >
              mission_terminal.sql
            </span>
          </div>
          <span style={{ fontFamily: F.ui, fontSize: 10, color: C.t4 }}>
            ⌘↵ run
          </span>
        </div>

        <div
          style={{
            padding: "18px 22px 22px",
            fontFamily: F.sql,
            fontSize: 12.5,
            lineHeight: 1.85,
            minHeight: 340,
            position: "relative",
            zIndex: 1,
          }}
        >
          {TERM_LINES.slice(0, line).map((l, i) => (
            <div
              key={i}
              style={{ color: colorMap[l.t] || C.t2, whiteSpace: "pre" }}
            >
              {l.v}
            </div>
          ))}
          {line < TERM_LINES.length && (
            <div
              style={{
                color: colorMap[TERM_LINES[line].t] || C.t2,
                whiteSpace: "pre",
              }}
            >
              {TERM_LINES[line].v.slice(0, char)}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.55, repeat: Infinity }}
                style={{ color: C.primary }}
              >
                ▋
              </motion.span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 16px",
            background: "rgba(13,13,24,0.9)",
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <span style={{ fontFamily: F.ui, fontSize: 10, color: C.t4 }}>
            PostgreSQL 16 · sandbox
          </span>
          <span style={{ fontFamily: F.ui, fontSize: 10, color: C.pLight }}>
            EX-01 · Explorer · 0 XP
          </span>
        </div>
      </div>
    </TiltCard>
  );
}

function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 54,
        overflow: "hidden",
      }}
    >
    
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "40%",
          width: "70vw",
          height: "80vh",
          background: `radial-gradient(ellipse at center, rgba(91,94,244,0.06) 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-5%",
          right: "-5%",
          width: "40vw",
          height: "50vh",
          background: `radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 1300,
          margin: "0 auto",
          padding: "80px 48px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr",
            gap: 72,
            alignItems: "center",
          }}
        >
         
          <div>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 28,
              }}
            >
              <Pulse />
              <span
                style={{
                  fontFamily: F.ui,
                  fontSize: 11,
                  color: C.t3,
                  letterSpacing: "0.12em",
                }}
              >
                MISSION CONTROL — ONLINE
              </span>
              <span
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: C.primary,
                  marginLeft: 4,
                }}
              >
                [
                {String(new Date().toISOString().slice(0, 16)).replace(
                  "T",
                  " ",
                )}
                ]
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              style={{
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: "clamp(42px, 5vw, 68px)",
                color: C.t1,
                lineHeight: 1.1,
                letterSpacing: "-0.015em",
                marginBottom: 4,
              }}
            >
              Navigate the
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              style={{
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: "clamp(42px, 5vw, 68px)",
                lineHeight: 1.1,
                letterSpacing: "-0.015em",
                marginBottom: 28,
                backgroundImage: `linear-gradient(110deg, ${C.primary} 0%, ${C.pLight} 40%, ${C.signal} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              world of SQL.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28 }}
              style={{
                fontSize: 15,
                color: C.t2,
                lineHeight: 1.78,
                maxWidth: 400,
                marginBottom: 36,
                fontFamily: F.body,
              }}
            >
              Mission-based SQL training on real PostgreSQL databases. Write
              queries. Get AI signals. Earn your rank. Built for developers who
              learn by doing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.36 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 52,
              }}
            >
              <Show when="signed-out">
                <Link to="/auth" style={{ textDecoration: "none" }}>
                  <motion.button
                    whileHover={{
                      scale: 1.03,
                      boxShadow: `0 0 40px rgba(91,94,244,0.4), 0 0 80px rgba(91,94,244,0.15)`,
                    }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 9,
                      background: `linear-gradient(135deg, ${C.primary} 0%, #7b55f8 100%)`,
                      border: "none",
                      color: "#fff",
                      padding: "12px 26px",
                      borderRadius: 9,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: F.body,
                      letterSpacing: "-0.01em",
                      boxShadow: `0 0 28px rgba(91,94,244,0.25)`,
                    }}
                  >
                    Start Your SQL Journey
                    <motion.span
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Icon.Arrow />
                    </motion.span>
                  </motion.button>
                </Link>
                <Link to="/auth" style={{ textDecoration: "none" }}>
                  <motion.button
                    whileHover={{ borderColor: C.border, color: C.t1 }}
                    style={{
                      background: "none",
                      border: `1px solid ${C.t4}`,
                      color: C.t2,
                      padding: "12px 20px",
                      borderRadius: 9,
                      fontSize: 14,
                      cursor: "pointer",
                      fontFamily: F.body,
                      transition: "all 0.2s",
                    }}
                  >
                    View missions
                  </motion.button>
                </Link>
              </Show>
              <Show when="signed-in">
                <Link to="/dashboard" style={{ textDecoration: "none" }}>
                  <motion.button
                    whileHover={{
                      scale: 1.03,
                      boxShadow: `0 0 40px rgba(91,94,244,0.4)`,
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 9,
                      background: `linear-gradient(135deg, ${C.primary} 0%, #7b55f8 100%)`,
                      border: "none",
                      color: "#fff",
                      padding: "12px 26px",
                      borderRadius: 9,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: F.body,
                    }}
                  >
                    Mission Control <Icon.Arrow />
                  </motion.button>
                </Link>
              </Show>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              style={{
                display: "flex",
                gap: 0,
                borderTop: `1px solid ${C.t4}`,
                paddingTop: 24,
              }}
            >
              {[
                { n: "500+", l: "Operatives" },
                { n: "50+", l: "Missions" },
                { n: "5", l: "SQL Ranks" },
                { n: "∞", l: "Free forever" },
              ].map(({ n, l }, i) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    paddingRight: 24,
                    borderRight: i < 3 ? `1px solid ${C.t4}` : "none",
                    paddingLeft: i > 0 ? 24 : 0,
                  }}
                >
                  <p
                    style={{
                      fontFamily: F.display,
                      fontWeight: 800,
                      fontSize: 26,
                      color: C.t1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {n}
                  </p>
                  <p
                    style={{
                      fontFamily: F.ui,
                      fontSize: 10,
                      color: C.t3,
                      marginTop: 3,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {l.toUpperCase()}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right */}
          <HeroTerminal />
        </div>
      </div>
    </section>
  );
}

const SECTORS = [
  {
    id: "S-01",
    name: "Recon Basics",
    desc: "SELECT, WHERE, LIMIT, ORDER BY",
    count: 10,
    color: C.online,
  },
  {
    id: "S-02",
    name: "Aggregation Zone",
    desc: "COUNT, SUM, AVG, GROUP BY, HAVING",
    count: 12,
    color: C.signal,
  },
  {
    id: "S-03",
    name: "Joins Galaxy",
    desc: "INNER, LEFT, RIGHT, FULL, CROSS",
    count: 14,
    color: C.pLight,
  },
  {
    id: "S-04",
    name: "Subquery Den",
    desc: "Correlated, scalar, EXISTS, IN",
    count: 10,
    color: C.xp,
  },
  {
    id: "S-05",
    name: "Window Functions",
    desc: "RANK, ROW_NUMBER, LAG, LEAD, OVER",
    count: 12,
    color: "#ff6b9d",
  },
];

function MissionPathSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      style={{ padding: "100px 48px", borderTop: `1px solid ${C.border}` }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 64 }}
        >
          <p
            style={{
              fontFamily: F.ui,
              fontSize: 11,
              color: C.t3,
              letterSpacing: "0.12em",
              marginBottom: 14,
            }}
          >
            MISSION SECTORS
          </p>
          <h2
            style={{
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: "clamp(30px, 3.5vw, 48px)",
              color: C.t1,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            A structured path to
            <br />
            SQL mastery
          </h2>
        </motion.div>

        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
          {SECTORS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flex: 1,
                position: "relative",
                padding: "28px 24px",
                background:
                  hovered === i
                    ? `rgba(${s.color === C.online ? "0,229,160" : s.color === C.signal ? "0,212,255" : s.color === C.pLight ? "123,126,248" : s.color === C.xp ? "255,202,40" : "255,107,157"},0.06)`
                    : C.hull,
                border: `1px solid ${hovered === i ? s.color + "44" : C.border}`,
                borderRadius: 12,
                marginRight: i < SECTORS.length - 1 ? -1 : 0,
                transition: "all 0.25s",
                cursor: "default",
                zIndex: hovered === i ? 2 : 1,
              }}
            >
             
              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: s.color,
                  opacity: 0.7,
                  letterSpacing: "0.1em",
                  marginBottom: 14,
                }}
              >
                {s.id}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: s.color,
                    boxShadow: `0 0 10px ${s.color}88`,
                    flexShrink: 0,
                  }}
                />
                {i < SECTORS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: `linear-gradient(90deg, ${s.color}44, transparent)`,
                    }}
                  />
                )}
              </div>

              <h3
                style={{
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: 15,
                  color: C.t1,
                  marginBottom: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.name}
              </h3>
              <p
                style={{
                  fontFamily: F.ui,
                  fontSize: 11,
                  color: C.t3,
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {s.desc}
              </p>
              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: s.color,
                  opacity: 0.6,
                }}
              >
                {s.count} missions
              </div>

              <motion.div
                animate={{
                  opacity: hovered === i ? 1 : 0,
                  y: hovered === i ? 0 : 4,
                }}
                style={{
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: s.color,
                  letterSpacing: "0.06em",
                }}
              >
                {i === 0 ? "UNLOCKED ↗" : "LOCKED"}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Icon.Terminal,
    label: "SQL TERMINAL",
    title: "Real editor.\nReal database.",
    desc: "CodeMirror 6 with SQL syntax, autocomplete, and error highlighting. Runs against a live PostgreSQL cluster. Not a sandbox — a genuine cockpit.",
    wide: true,
    accent: C.pLight,
  },
  {
    icon: Icon.Bolt,
    label: "LIVE EXECUTION",
    title: "Results in milliseconds.",
    desc: "Hit ⌘↵. Your query executes. Structured table output, execution time, row count. Errors pinpoint the exact line.",
    wide: false,
    accent: C.signal,
  },
  {
    icon: Icon.Signal,
    label: "AI SIGNAL",
    title: "Hints, not handouts.",
    desc: "The AI reads your query and the mission brief, then sends a signal — a directional nudge, not the answer.",
    wide: false,
    accent: C.online,
  },
  {
    icon: Icon.Shield,
    label: "SCHEMA INTEL",
    title: "Know before you query.",
    desc: "Full table structure, column types, sample rows — all visible before you write a single character.",
    wide: false,
    accent: C.xp,
  },
  {
    icon: Icon.Chart,
    label: "FLIGHT LOG",
    title: "Progress that's visible.",
    desc: "XP, streaks, attempt history, rank progression. Every query you run is logged. Your growth compounds.",
    wide: false,
    accent: "#ff6b9d",
  },
];

function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      style={{
        padding: "100px 48px",
        borderTop: `1px solid ${C.border}`,
        background: C.hull,
      }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{ marginBottom: 56 }}
        >
          <p
            style={{
              fontFamily: F.ui,
              fontSize: 11,
              color: C.t3,
              letterSpacing: "0.12em",
              marginBottom: 14,
            }}
          >
            SYSTEM CAPABILITIES
          </p>
          <h2
            style={{
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: "clamp(30px, 3.5vw, 48px)",
              color: C.t1,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Everything in the cockpit.
            <br />
            Nothing you don't need.
          </h2>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gridTemplateRows: "auto auto",
            gap: 10,
          }}
        >
        
          <TiltCard style={{ gridColumn: "1 / 5", gridRow: "1 / 2" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 }}
              style={{
                padding: "36px 36px",
                background: C.hull,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                height: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 200,
                  height: 200,
                  background: `radial-gradient(circle at top right, ${FEATURES[0].accent}18, transparent 60%)`,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <div style={{ color: FEATURES[0].accent }}>
                  <Icon.Terminal />
                </div>
                <span
                  style={{
                    fontFamily: F.ui,
                    fontSize: 10,
                    color: C.t3,
                    letterSpacing: "0.1em",
                  }}
                >
                  {FEATURES[0].label}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: F.display,
                  fontWeight: 800,
                  fontSize: 28,
                  color: C.t1,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  marginBottom: 14,
                  whiteSpace: "pre-line",
                }}
              >
                {FEATURES[0].title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: C.t2,
                  lineHeight: 1.7,
                  fontFamily: F.body,
                  maxWidth: 440,
                }}
              >
                {FEATURES[0].desc}
              </p>
              {/* Mini editor mockup */}
              <div
                style={{
                  marginTop: 24,
                  background: C.deck,
                  borderRadius: 8,
                  padding: "14px 16px",
                  fontFamily: F.sql,
                  fontSize: 12,
                  color: C.pLight,
                  border: `1px solid ${C.border}`,
                }}
              >
                <span style={{ color: C.pLight }}>SELECT</span>
                <span style={{ color: C.t2 }}> id, name, score </span>
                <span style={{ color: C.pLight }}>FROM</span>
                <span style={{ color: C.t2 }}> missions </span>
                <span style={{ color: C.pLight }}>WHERE</span>
                <span style={{ color: C.online }}> completed </span>
                <span style={{ color: C.pLight }}>=</span>
                <span style={{ color: C.xp }}> true</span>
                <span style={{ color: C.t3 }}>;</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  style={{ color: C.primary }}
                >
                  ▋
                </motion.span>
              </div>
            </motion.div>
          </TiltCard>

          <TiltCard style={{ gridColumn: "5 / 7", gridRow: "1 / 3" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              style={{
                padding: "32px",
                background: C.hull,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                height: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  background: `linear-gradient(0deg, ${FEATURES[1].accent}10, transparent)`,
                  pointerEvents: "none",
                }}
              />
              <div style={{ color: FEATURES[1].accent, marginBottom: 14 }}>
                <Icon.Bolt />
              </div>
              <span
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: C.t3,
                  letterSpacing: "0.1em",
                }}
              >
                {FEATURES[1].label}
              </span>
              <h3
                style={{
                  fontFamily: F.display,
                  fontWeight: 800,
                  fontSize: 22,
                  color: C.t1,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                  marginTop: 14,
                  marginBottom: 12,
                }}
              >
                {FEATURES[1].title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: C.t2,
                  lineHeight: 1.7,
                  fontFamily: F.body,
                }}
              >
                {FEATURES[1].desc}
              </p>
              
              <div
                style={{
                  marginTop: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{ fontFamily: F.sql, fontSize: 11, color: C.online }}
                >
                  ✓ 342 rows · 38ms
                </div>
                {[
                  ["Q1", "$142k"],
                  ["Q2", "$189k"],
                  ["Q3", "$204k"],
                ].map(([q, v]) => (
                  <div
                    key={q}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: F.ui,
                      fontSize: 11,
                    }}
                  >
                    <span style={{ color: C.t2 }}>{q}</span>
                    <span style={{ color: C.signal }}>{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </TiltCard>

          {FEATURES.slice(2).map((f, i) => (
            <TiltCard
              key={f.label}
              style={{
                gridColumn: `${i * 2 + 1} / ${i * 2 + 3}`,
                gridRow: "2 / 3",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.06 }}
                style={{
                  padding: "26px 24px",
                  background: C.hull,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background: `radial-gradient(circle at top right, ${f.accent}14, transparent 60%)`,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ color: f.accent, marginBottom: 12 }}>
                  <f.icon />
                </div>
                <span
                  style={{
                    fontFamily: F.ui,
                    fontSize: 10,
                    color: C.t3,
                    letterSpacing: "0.1em",
                  }}
                >
                  {f.label}
                </span>
                <h3
                  style={{
                    fontFamily: F.display,
                    fontWeight: 700,
                    fontSize: 16,
                    color: C.t1,
                    letterSpacing: "-0.02em",
                    marginTop: 10,
                    marginBottom: 9,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 12.5,
                    color: C.t2,
                    lineHeight: 1.65,
                    fontFamily: F.body,
                  }}
                >
                  {f.desc}
                </p>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}


const RANKS_DATA = [
  {
    name: "Explorer",
    xp: "0",
    desc: "Just landed. First queries. Getting oriented.",
    color: C.online,
  },
  {
    name: "Navigator",
    xp: "500",
    desc: "Aggregations mastered. Joins in progress.",
    color: C.signal,
  },
  {
    name: "Query Architect",
    xp: "1,500",
    desc: "Subqueries, CTEs, complex logic.",
    color: C.pLight,
  },
  {
    name: "Data Commander",
    xp: "3,000",
    desc: "Window functions. Optimization. Deep queries.",
    color: C.xp,
  },
  {
    name: "SQL Grandmaster",
    xp: "6,000",
    desc: "The apex. Every SQL concept conquered.",
    color: "#ff6b9d",
  },
];

function RanksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      style={{
        padding: "100px 48px",
        borderTop: `1px solid ${C.border}`,
        background: `linear-gradient(180deg, ${C.void} 0%, ${C.hull} 50%, ${C.void} 100%)`,
      }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{ marginBottom: 56 }}
        >
          <p
            style={{
              fontFamily: F.ui,
              fontSize: 11,
              color: C.t3,
              letterSpacing: "0.12em",
              marginBottom: 14,
            }}
          >
            RANK PROGRESSION
          </p>
          <h2
            style={{
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: "clamp(30px, 3.5vw, 48px)",
              color: C.t1,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Five ranks.
            <br />
            One destination.
          </h2>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 10,
          }}
        >
          {RANKS_DATA.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: "28px 22px",
                background: hovered === i ? C.deck : C.hull,
                border: `1px solid ${hovered === i ? r.color + "44" : C.border}`,
                borderRadius: 12,
                transition: "all 0.25s",
                cursor: "default",
                position: "relative",
                overflow: "hidden",
              }}
            >
            
              <motion.div
                animate={{ opacity: hovered === i ? 1 : 0 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: r.color,
                  transition: "opacity 0.25s",
                }}
              />

              <div style={{ marginBottom: 16 }}>
                <RankBadge rank={i} active={hovered === i || i === 0} />
              </div>

              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: r.color,
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                  opacity: hovered === i ? 1 : 0.5,
                }}
              >
                RANK {String(i + 1).padStart(2, "0")}
              </div>

              <h3
                style={{
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: 15,
                  color: C.t1,
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                  lineHeight: 1.2,
                }}
              >
                {r.name}
              </h3>

              <p
                style={{
                  fontFamily: F.body,
                  fontSize: 12,
                  color: C.t3,
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {r.desc}
              </p>

             
              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 11,
                  color: r.color,
                  opacity: hovered === i ? 1 : 0.4,
                }}
              >
                {r.xp} XP
              </div>

              <div
                style={{
                  marginTop: 12,
                  height: 2,
                  background: C.t4,
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  animate={{
                    width: hovered === i ? "100%" : i === 0 ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: r.color,
                    borderRadius: 999,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    text: "Finally a SQL tool that doesn't hold your hand. The AI hints nudge without spoiling. Went from zero to Query Architect in 3 weeks.",
    author: "Backend dev, 2 YoE",
  },
  {
    text: "The mission structure made it feel like a game. I genuinely looked forward to doing SQL problems.",
    author: "Data analyst @ fintech",
  },
  {
    text: "Real PostgreSQL, real errors, real learning. Every other platform felt like training wheels after this.",
    author: "CS student, final year",
  },
];

function SocialProofSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      style={{
        padding: "100px 48px",
        borderTop: `1px solid ${C.border}`,
        background: C.hull,
      }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          style={{
            fontFamily: F.ui,
            fontSize: 11,
            color: C.t3,
            letterSpacing: "0.12em",
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          OPERATIVE DEBRIEF
        </motion.p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: "28px 26px",
                background: C.hull,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                position: "relative",
              }}
            >
              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 24,
                  color: C.primary,
                  lineHeight: 1,
                  marginBottom: 14,
                  opacity: 0.4,
                }}
              >
                "
              </div>
              <p
                style={{
                  fontFamily: F.body,
                  fontSize: 14,
                  color: C.t2,
                  lineHeight: 1.75,
                  marginBottom: 20,
                }}
              >
                {t.text}
              </p>
              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: C.t3,
                  letterSpacing: "0.06em",
                }}
              >
                — {t.author}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      style={{ padding: "80px 48px 120px", borderTop: `1px solid ${C.border}` }}
    >
      <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{
            position: "relative",
            padding: "72px 56px",
            borderRadius: 20,
            border: `1px solid rgba(91,94,244,0.2)`,
            background: `radial-gradient(ellipse at 50% 0%, rgba(91,94,244,0.08) 0%, transparent 70%), ${C.hull}`,
            overflow: "hidden",
          }}
        >
          {/* HUD corners */}
          {(["tl", "tr", "bl", "br"] as const).map((pos) => {
            const isTop = pos[0] === "t",
              isLeft = pos[1] === "l";
            return (
              <div
                key={pos}
                style={{
                  position: "absolute",
                  [isTop ? "top" : "bottom"]: 0,
                  [isLeft ? "left" : "right"]: 0,
                  width: 20,
                  height: 20,
                  borderTop: isTop ? `1px solid ${C.borderA}` : "none",
                  borderBottom: !isTop ? `1px solid ${C.borderA}` : "none",
                  borderLeft: isLeft ? `1px solid ${C.borderA}` : "none",
                  borderRight: !isLeft ? `1px solid ${C.borderA}` : "none",
                }}
              />
            );
          })}

          {/* Animated scan line */}
          <motion.div
            animate={{ top: ["-2px", "102%"] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2,
            }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.pLight}, transparent)`,
              opacity: 0.4,
              pointerEvents: "none",
            }}
          />

          <p
            style={{
              fontFamily: F.ui,
              fontSize: 11,
              color: C.t3,
              letterSpacing: "0.12em",
              marginBottom: 20,
            }}
          >
            MISSION BRIEFING
          </p>
          <h2
            style={{
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: "clamp(32px, 4vw, 52px)",
              color: C.t1,
              letterSpacing: "-0.02em",
              marginBottom: 16,
              lineHeight: 1.05,
            }}
          >
            Ready to begin
            <br />
            your mission?
          </h2>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 15,
              color: C.t2,
              lineHeight: 1.75,
              marginBottom: 36,
              maxWidth: 480,
              margin: "0 auto 36px",
            }}
          >
            500+ operatives already training. No credit card. No setup. Real
            PostgreSQL. Real progress. Your rank is waiting.
          </p>
          <Show when="signed-out">
            <Link to="/auth" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: `0 0 60px rgba(91,94,244,0.5), 0 0 100px rgba(91,94,244,0.15)`,
                }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: `linear-gradient(135deg, ${C.primary} 0%, #7b55f8 100%)`,
                  border: "none",
                  color: "#fff",
                  padding: "14px 32px",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: F.body,
                  letterSpacing: "-0.01em",
                  boxShadow: `0 0 32px rgba(91,94,244,0.3)`,
                }}
              >
                Begin Mission
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Icon.Arrow />
                </motion.span>
              </motion.button>
            </Link>
          </Show>
          <Show when="signed-in">
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: `0 0 60px rgba(91,94,244,0.5)`,
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: `linear-gradient(135deg, ${C.primary} 0%, #7b55f8 100%)`,
                  border: "none",
                  color: "#fff",
                  padding: "14px 32px",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: F.body,
                }}
              >
                Mission Control <Icon.Arrow />
              </motion.button>
            </Link>
          </Show>
        </motion.div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div
      style={{ background: C.void, minHeight: "100vh", position: "relative" }}
    >
      <ParticleCanvas />
      <NoiseOverlay />
      <LandingNav />
      <HeroSection />
      <SQLTicker />
      <MissionPathSection />
      <FeaturesSection />
      <RanksSection />
      <SocialProofSection />
      <CTASection />
      <Footer />
    </div>
  );
}
