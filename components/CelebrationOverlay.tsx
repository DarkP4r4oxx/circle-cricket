"use client";
import type { CelebrationEvent } from "@/lib/types";

// Particle configs
const FOUR_PARTICLES = [
  { px: -80,  py: -110, color: "#f59e0b", size: 12, delay: 0.05, shape: "●" },
  { px: 80,   py: -110, color: "#fbbf24", size: 10, delay: 0.08, shape: "●" },
  { px: -130, py: -60,  color: "#f59e0b", size: 8,  delay: 0.03, shape: "◆" },
  { px: 130,  py: -60,  color: "#fcd34d", size: 8,  delay: 0.1,  shape: "◆" },
  { px: -50,  py: -140, color: "#fbbf24", size: 14, delay: 0,    shape: "★" },
  { px: 50,   py: -140, color: "#f59e0b", size: 14, delay: 0.06, shape: "★" },
  { px: -100, py: -130, color: "#fcd34d", size: 9,  delay: 0.12, shape: "●" },
  { px: 100,  py: -130, color: "#f59e0b", size: 9,  delay: 0.04, shape: "●" },
];

const SIX_PARTICLES = [
  { px: -70,  py: -130, color: "#22c55e", size: 14, delay: 0,    shape: "★" },
  { px: 70,   py: -130, color: "#4ade80", size: 14, delay: 0.04, shape: "★" },
  { px: -140, py: -80,  color: "#22c55e", size: 10, delay: 0.08, shape: "●" },
  { px: 140,  py: -80,  color: "#86efac", size: 10, delay: 0.06, shape: "●" },
  { px: -40,  py: -160, color: "#fbbf24", size: 12, delay: 0.03, shape: "◆" },
  { px: 40,   py: -160, color: "#f59e0b", size: 12, delay: 0.1,  shape: "◆" },
  { px: -110, py: -140, color: "#4ade80", size: 8,  delay: 0.05, shape: "●" },
  { px: 110,  py: -140, color: "#22c55e", size: 8,  delay: 0.09, shape: "●" },
  { px: -160, py: -40,  color: "#fcd34d", size: 11, delay: 0.02, shape: "★" },
  { px: 160,  py: -40,  color: "#22c55e", size: 11, delay: 0.07, shape: "★" },
  { px: -20,  py: -170, color: "#86efac", size: 9,  delay: 0.12, shape: "◆" },
  { px: 20,   py: -170, color: "#4ade80", size: 9,  delay: 0.01, shape: "◆" },
];

const WICKET_STUMPS = [
  { sx: -60,  sr: "-50deg", delay: 0.02, emoji: "🏏" },
  { sx: 0,    sr: "10deg",  delay: 0.05, emoji: "🎯" },
  { sx: 60,   sr: "55deg",  delay: 0,    emoji: "🏏" },
];

const DURATION = 2800; // ms total

interface CelebrationOverlayProps {
  event: CelebrationEvent | null;
}

const CONFIG = {
  FOUR: {
    bg: "rgba(120, 53, 0, 0.82)",
    flash: "rgba(245, 158, 11, 0.18)",
    ring: "#f59e0b",
    emoji: "4️⃣",
    title: "FOUR!",
    sub: "Boundary! 🌊",
    titleColor: "#fbbf24",
    glow: "rgba(245,158,11,0.6)",
  },
  SIX: {
    bg: "rgba(2, 44, 18, 0.85)",
    flash: "rgba(34, 197, 94, 0.2)",
    ring: "#22c55e",
    emoji: "6️⃣",
    title: "SIX!",
    sub: "Maximum! 🚀",
    titleColor: "#4ade80",
    glow: "rgba(34,197,94,0.7)",
  },
  WICKET: {
    bg: "rgba(80, 0, 0, 0.88)",
    flash: "rgba(239, 68, 68, 0.2)",
    ring: "#ef4444",
    emoji: "💀",
    title: "OUT!",
    sub: "Wicket Down! 🎯",
    titleColor: "#f87171",
    glow: "rgba(239,68,68,0.65)",
  },
};

export default function CelebrationOverlay({ event }: CelebrationOverlayProps) {
  if (!event) return null;

  const cfg = CONFIG[event];
  const dur = `${DURATION}ms`;
  const particles = event === "SIX" ? SIX_PARTICLES : event === "FOUR" ? FOUR_PARTICLES : [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: cfg.bg,
        animation: `celebOverlayIn ${dur} ease forwards`,
        pointerEvents: "none",
      }}
    >
      {/* Screen colour flash layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: cfg.flash,
          animation: `screenFlash 0.5s ease forwards`,
        }}
      />

      {/* Ring pulse (expanding circle) */}
      {[0, 0.15, 0.3].map((delay, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: `3px solid ${cfg.ring}`,
            animation: `ringPulse 1.2s ease-out ${delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}

      {/* Particles (FOUR / SIX) */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            // @ts-expect-error CSS custom props
            "--px": `${p.px}px`,
            "--py": `${p.py}px`,
            fontSize: p.size,
            color: p.color,
            animation: `particleOutWide ${DURATION * 0.6}ms ease ${p.delay}s forwards`,
            willChange: "transform, opacity",
          }}
        >
          {p.shape}
        </div>
      ))}

      {/* Wicket stumps flying */}
      {event === "WICKET" &&
        WICKET_STUMPS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              // @ts-expect-error CSS custom props
              "--sx": s.sx + "px",
              "--sr": s.sr,
              fontSize: "2rem",
              animation: `stumpFly 1s ease ${s.delay}s forwards`,
            }}
          >
            {s.emoji}
          </div>
        ))}

      {/* Central card */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {/* Emoji */}
        <div
          style={{
            fontSize: "5rem",
            lineHeight: 1,
            animation:
              event === "WICKET"
                ? `wicketShake ${dur} ease forwards`
                : `celebTextBounce ${dur} ease forwards`,
            filter: `drop-shadow(0 0 24px ${cfg.glow})`,
          }}
        >
          {cfg.emoji}
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: "clamp(3.5rem, 14vw, 7rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: cfg.titleColor,
            lineHeight: 1,
            textShadow: `0 0 60px ${cfg.glow}, 0 0 120px ${cfg.glow}`,
            animation: `celebTextBounce ${dur} ease forwards`,
          }}
        >
          {cfg.title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.05em",
            animation: `celebSubIn ${dur} ease forwards`,
          }}
        >
          {cfg.sub}
        </div>
      </div>
    </div>
  );
}
