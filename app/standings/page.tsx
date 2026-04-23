"use client";
// Standings Page — /standings
import { useStandings } from "@/hooks/useStandings";
import StandingsTable from "@/components/StandingsTable";
import type { Team } from "@/lib/types";

const PODIUM = [
  { rank: 1, label: "1st", emoji: "🥇", height: 110, color: "#f59e0b", glow: "rgba(245,158,11,0.22)", order: 1 },
  { rank: 2, label: "2nd", emoji: "🥈", height: 78,  color: "#94a3b8", glow: "rgba(148,163,184,0.15)", order: 0 },
  { rank: 3, label: "3rd", emoji: "🥉", height: 56,  color: "#cd7c54", glow: "rgba(205,124,84,0.15)", order: 2 },
];

function PodiumCard({
  team, rank, label, emoji, height, color, glow, order,
}: {
  team: Team | undefined;
  rank: number; label: string; emoji: string;
  height: number; color: string; glow: string; order: number;
}) {
  const delayClass = rank === 1 ? "delay-1" : rank === 2 ? "delay-2" : "delay-3";
  return (
    <div
      style={{
        order,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: rank === 1 ? "0 0 36%" : "0 0 27%",
      }}
    >
      {/* Info card above block */}
      <div
        className={`anim-fade-in-up ${delayClass}`}
        style={{
          background: "rgba(15,24,41,0.9)",
          border: `1px solid ${color}35`,
          borderRadius: 14,
          padding: rank === 1 ? "1rem 1rem" : "0.75rem 0.75rem",
          textAlign: "center",
          marginBottom: 8,
          width: "100%",
          boxShadow: `0 8px 32px ${glow}, 0 0 0 1px ${color}15`,
          backdropFilter: "blur(8px)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 48px ${glow}, 0 0 0 1px ${color}30`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${glow}, 0 0 0 1px ${color}15`;
        }}
      >
        <p style={{ fontSize: rank === 1 ? "1.75rem" : "1.4rem", marginBottom: "0.3rem" }}>
          {emoji}
        </p>
        <p
          style={{
            fontWeight: 800,
            color,
            fontSize: rank === 1 ? "0.95rem" : "0.8rem",
            marginBottom: "0.3rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {team?.name ?? "—"}
        </p>
        {team ? (
          <p style={{ fontSize: rank === 1 ? "1.75rem" : "1.3rem", fontWeight: 900, color, letterSpacing: "-0.03em" }}>
            {team.runsFor}
            <span style={{ fontSize: "0.4em", color: "#64748b", fontWeight: 600 }}> best</span>
          </p>
        ) : (
          <p style={{ color: "#334155", fontSize: "0.75rem" }}>No data</p>
        )}
      </div>

      {/* Podium block with rise animation */}
      <div
        className={`anim-fade-in-up ${delayClass}`}
        style={{
          width: "100%",
          height,
          background: `linear-gradient(180deg, ${color}18 0%, ${color}06 100%)`,
          border: `1px solid ${color}25`,
          borderBottom: "none",
          borderRadius: "8px 8px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontWeight: 900, fontSize: rank === 1 ? "1.75rem" : "1.25rem", color: `${color}50` }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default function StandingsPage() {
  const { standings, loading, error } = useStandings();
  const top3 = standings.slice(0, 3);

  return (
    <div className="page-bg" style={{ padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Heading */}
        <div className="anim-fade-in-up" style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
              fontWeight: 900,
              color: "#f1f5f9",
              letterSpacing: "-0.04em",
              marginBottom: "0.3rem",
            }}
          >
            🏆 <span className="gradient-text">Standings</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Ranked by highest score achieved
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "#ef4444", padding: "3rem" }}>
            Failed to load: {error}
          </div>
        ) : standings.length === 0 ? (
          <div
            className="anim-scale-in"
            style={{
              textAlign: "center", padding: "4rem 2rem",
              background: "#0f1829", border: "1px solid #1a2540",
              borderRadius: 16, color: "#64748b",
            }}
          >
            <p className="anim-float" style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📋</p>
            <p style={{ fontWeight: 700 }}>No teams yet</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {standings.length >= 2 && (
              <div
                className="anim-fade-in delay-1"
                style={{
                  marginBottom: "1.5rem",
                  background: "linear-gradient(160deg, #0d1525 0%, #080e1c 100%)",
                  border: "1px solid #1a2540",
                  borderRadius: 18,
                  padding: "1.5rem 1rem 0",
                  overflow: "hidden",
                }}
              >
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    color: "#334155",
                    textTransform: "uppercase",
                    marginBottom: "1.25rem",
                  }}
                >
                  ✦ Top Performers ✦
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {PODIUM.map((p) => (
                    <PodiumCard key={p.rank} team={top3[p.rank - 1]} {...p} />
                  ))}
                </div>
              </div>
            )}

            {/* Table */}
            <div
              className="anim-fade-in-up delay-2"
              style={{
                background: "#0f1829",
                border: "1px solid #1a2540",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "0.9rem 1.25rem",
                  borderBottom: "1px solid #1a2540",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <p style={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Full Rankings — {standings.length} teams
                </p>
              </div>
              <StandingsTable teams={standings} />
            </div>

            {/* Legend */}
            <div className="anim-fade-in delay-3" style={{ marginTop: "0.75rem", display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.7rem", color: "#334155" }}>
              <span>Matches = Games played</span>
              <span>Diff = Runs scored − conceded</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
