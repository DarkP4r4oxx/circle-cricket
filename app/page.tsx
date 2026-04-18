"use client";
// Public Live Dashboard — / 
import { useCurrentMatch } from "@/hooks/useCurrentMatch";
import { useCelebration } from "@/hooks/useCelebration";
import Scoreboard from "@/components/Scoreboard";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import Link from "next/link";

export default function HomePage() {
  const { match, loading } = useCurrentMatch();
  const celebration = useCelebration(match);

  return (
    <div className="page-bg" style={{ padding: "2rem 1rem" }}>
      {/* Celebration overlay — fires for all spectators in real-time */}
      <CelebrationOverlay event={celebration} />
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Hero heading */}
        <div className="anim-fade-in-up" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 1rem",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 999,
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#22c55e",
              letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}
          >
            <span
              className="live-dot"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                position: "relative",
              }}
            />
            REAL-TIME UPDATES
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              fontWeight: 900,
              color: "#f1f5f9",
              letterSpacing: "-0.04em",
              marginBottom: "0.5rem",
              lineHeight: 1.1,
            }}
          >
            Live{" "}
            <span className="gradient-text">Scoreboard</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            Updates instantly as the match progresses
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div
            className="anim-scale-in"
            style={{
              background: "#0f1829",
              border: "1px solid #1a2540",
              borderRadius: 18,
              padding: "4rem 2rem",
              textAlign: "center",
            }}
          >
            <div className="spinner" style={{ marginBottom: "1rem" }} />
            <p style={{ color: "#475569", fontSize: "0.875rem" }}>
              Loading match data...
            </p>
          </div>
        ) : match && match.status !== "completed" ? (
          <div className="anim-fade-in-up delay-1">
            <Scoreboard match={match} />
          </div>
        ) : match && match.status === "completed" ? (
          <div className="anim-fade-in-up delay-1">
            <Scoreboard match={match} />
            <p
              style={{
                textAlign: "center",
                marginTop: "1.5rem",
                color: "#475569",
                fontSize: "0.875rem",
              }}
            >
              No live match right now.{" "}
              <Link
                href="/matches"
                style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}
              >
                View match history →
              </Link>
            </p>
          </div>
        ) : (
          /* No match */
          <div
            className="anim-scale-in delay-1"
            style={{
              background: "linear-gradient(160deg, #0f1829 0%, #0d1423 100%)",
              border: "1px solid #1a2540",
              borderRadius: 18,
              padding: "4rem 2rem",
              textAlign: "center",
            }}
          >
            <p className="anim-float" style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>
              🏟️
            </p>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                color: "#94a3b8",
                marginBottom: "0.5rem",
              }}
            >
              No match live right now
            </h2>
            <p
              style={{
                color: "#475569",
                fontSize: "0.875rem",
                marginBottom: "2rem",
                maxWidth: 300,
                margin: "0.5rem auto 2rem",
              }}
            >
              Check back soon, or explore the standings and match history.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/standings" className="btn btn-ghost">
                📋 Standings
              </Link>
              <Link href="/matches" className="btn btn-ghost">
                📁 Match History
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
