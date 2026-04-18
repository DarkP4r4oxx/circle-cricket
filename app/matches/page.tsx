"use client";
// Match History Page — /matches
import { useMatchHistory } from "@/hooks/useMatchHistory";
import LiveBadge from "@/components/LiveBadge";

export default function MatchesPage() {
  const { matches, loading, error } = useMatchHistory();

  return (
    <div className="page-bg" style={{ padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Heading */}
        <div className="anim-fade-in-up" style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.25rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              marginBottom: "0.3rem",
            }}
          >
            📁 <span className="gradient-text">Match History</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            All completed matches
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "#ef4444", padding: "3rem" }}>
            {error}
          </div>
        ) : matches.length === 0 ? (
          <div
            className="anim-scale-in"
            style={{
              textAlign: "center", padding: "4rem 2rem",
              background: "#0f1829", border: "1px solid #1a2540",
              borderRadius: 16, color: "#64748b",
            }}
          >
            <p className="anim-float" style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📂</p>
            <p style={{ fontWeight: 700 }}>No completed matches yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {matches.map((match, i) => {
              const winner =
                match.scoreA > match.scoreB ? match.teamAName
                : match.scoreB > match.scoreA ? match.teamBName
                : "Tie";

              const delayClass =
                i === 0 ? "delay-1"
                : i === 1 ? "delay-2"
                : i === 2 ? "delay-3"
                : i === 3 ? "delay-4"
                : "";

              return (
                <div
                  key={match.id}
                  className={`anim-fade-in-up card card-hover ${delayClass}`}
                  style={{
                    background: "linear-gradient(160deg, #0f1829 0%, #0d1423 100%)",
                    borderRadius: 14,
                    padding: "1.25rem 1.5rem",
                    cursor: "default",
                  }}
                >
                  {/* Top row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1rem",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <LiveBadge status="completed" />
                    <span style={{ color: "#334155", fontSize: "0.7rem", fontFamily: "monospace" }}>
                      #{match.id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  {/* Score comparison */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Team A */}
                    <div style={{ flex: 1, textAlign: "center", minWidth: 110 }}>
                      <p style={{ fontWeight: 700, color: winner === match.teamAName ? "#22c55e" : "#64748b", marginBottom: "0.3rem", fontSize: "0.875rem" }}>
                        {match.teamAName}
                      </p>
                      <p
                        style={{
                          fontSize: "2rem",
                          fontWeight: 900,
                          letterSpacing: "-0.04em",
                          color: winner === match.teamAName ? "#f1f5f9" : "#334155",
                        }}
                      >
                        {match.scoreA}
                        <span style={{ fontSize: "0.45em", color: "#475569" }}>/{match.wicketsA}</span>
                      </p>
                      <p style={{ color: "#334155", fontSize: "0.72rem" }}>{match.oversA.toFixed(1)} ov</p>
                    </div>

                    {/* VS */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <div style={{ width: 1, height: 20, background: "#1a2540" }} />
                      <span style={{ fontSize: "0.6rem", fontWeight: 900, color: "#243050", letterSpacing: "0.05em" }}>VS</span>
                      <div style={{ width: 1, height: 20, background: "#1a2540" }} />
                    </div>

                    {/* Team B */}
                    <div style={{ flex: 1, textAlign: "center", minWidth: 110 }}>
                      <p style={{ fontWeight: 700, color: winner === match.teamBName ? "#22c55e" : "#64748b", marginBottom: "0.3rem", fontSize: "0.875rem" }}>
                        {match.teamBName}
                      </p>
                      <p
                        style={{
                          fontSize: "2rem",
                          fontWeight: 900,
                          letterSpacing: "-0.04em",
                          color: winner === match.teamBName ? "#f1f5f9" : "#334155",
                        }}
                      >
                        {match.scoreB}
                        <span style={{ fontSize: "0.45em", color: "#475569" }}>/{match.wicketsB}</span>
                      </p>
                      <p style={{ color: "#334155", fontSize: "0.72rem" }}>{match.oversB.toFixed(1)} ov</p>
                    </div>
                  </div>

                  {/* Winner strip */}
                  <div
                    style={{
                      marginTop: "1rem",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid #1a2540",
                      textAlign: "center",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#22c55e",
                    }}
                  >
                    🏆 {winner === "Tie" ? "Match Tied" : `${winner} won`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
