"use client";
import LiveBadge from "@/components/LiveBadge";
import type { Match } from "@/lib/types";

interface ScoreboardProps {
  match: Match;
}

function InningsScore({
  teamName,
  score,
  wickets,
  overs,
  isActive,
  isBatting,
  animClass,
}: {
  teamName: string;
  score: number;
  wickets: number;
  overs: number;
  isActive: boolean;
  isBatting: boolean;
  animClass: string;
}) {
  return (
    <div
      className={animClass}
      style={{
        flex: 1,
        textAlign: "center",
        padding: "2rem 1rem",
        borderRadius: 14,
        background: isActive
          ? "linear-gradient(135deg, rgba(34,197,94,0.09) 0%, rgba(34,197,94,0.03) 100%)"
          : "rgba(255,255,255,0.015)",
        border: isActive
          ? "1px solid rgba(34,197,94,0.25)"
          : "1px solid rgba(255,255,255,0.04)",
        position: "relative",
        transition: "all 0.3s ease",
      }}
    >
      {isBatting && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#22c55e",
            background: "rgba(34,197,94,0.12)",
            padding: "2px 8px",
            borderRadius: 999,
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          BATTING
        </div>
      )}

      {/* Team name */}
      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: isActive ? "#94a3b8" : "#475569",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: "0.75rem",
        }}
      >
        {teamName}
      </p>

      {/* Score */}
      <p
        className={isActive ? "score-glow" : ""}
        style={{
          fontSize: "clamp(2.8rem, 9vw, 5rem)",
          fontWeight: 900,
          color: isActive ? "#f1f5f9" : "#334155",
          letterSpacing: "-0.05em",
          lineHeight: 1,
          margin: "0.4rem 0",
          transition: "color 0.3s",
        }}
      >
        {score}
        <span
          style={{
            fontSize: "0.45em",
            color: isActive ? "#64748b" : "#2d3a4f",
            fontWeight: 700,
            letterSpacing: "0",
          }}
        >
          /{wickets}
        </span>
      </p>

      {/* Overs */}
      <p
        style={{
          color: isActive ? "#64748b" : "#2d3a4f",
          fontSize: "0.875rem",
          fontWeight: 600,
          marginTop: "0.5rem",
          transition: "color 0.3s",
        }}
      >
        {overs.toFixed(1)}{" "}
        <span style={{ fontSize: "0.75em", fontWeight: 500 }}>overs</span>
      </p>
    </div>
  );
}

export default function Scoreboard({ match }: ScoreboardProps) {
  const battingA = match.currentInnings === "A";
  const battingB = match.currentInnings === "B";

  let winner: string | null = null;
  if (match.status === "completed") {
    if (match.scoreA > match.scoreB) winner = match.teamAName;
    else if (match.scoreB > match.scoreA) winner = match.teamBName;
    else winner = "Tie";
  }

  return (
    <div
      className={`anim-scale-in ${match.status === "live" ? "glow-card" : ""}`}
      style={{
        background: "linear-gradient(160deg, #0f1829 0%, #0d1423 100%)",
        border: "1px solid #1a2540",
        borderRadius: 18,
        overflow: "hidden",
        maxWidth: 700,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: "0.9rem 1.5rem",
          borderBottom: "1px solid #1a2540",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <p
          style={{
            color: "#475569",
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {match.currentInnings === "A" ? "1st Innings" : "2nd Innings"}
        </p>
        <LiveBadge status={match.status} large />
      </div>

      {/* Score panels */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          padding: "1.25rem",
          alignItems: "stretch",
        }}
      >
        <InningsScore
          teamName={match.teamAName}
          score={match.scoreA}
          wickets={match.wicketsA}
          overs={match.oversA}
          isActive={battingA}
          isBatting={battingA && match.status === "live"}
          animClass="anim-slide-left"
        />

        {/* VS divider */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 0.25rem",
          }}
        >
          <div
            style={{
              width: 1,
              flex: 1,
              background: "linear-gradient(180deg, transparent, #1e2d45, transparent)",
            }}
          />
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 900,
              color: "#243050",
              letterSpacing: "0.05em",
              padding: "0.4rem 0",
            }}
          >
            VS
          </span>
          <div
            style={{
              width: 1,
              flex: 1,
              background: "linear-gradient(180deg, #1e2d45, transparent)",
            }}
          />
        </div>

        <InningsScore
          teamName={match.teamBName}
          score={match.scoreB}
          wickets={match.wicketsB}
          overs={match.oversB}
          isActive={battingB}
          isBatting={battingB && match.status === "live"}
          animClass="anim-slide-right"
        />
      </div>

      {/* Winner banner */}
      {match.status === "completed" && (
        <div
          className="anim-fade-in-up"
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid #1a2540",
            textAlign: "center",
            background: "linear-gradient(90deg, rgba(34,197,94,0.04) 0%, rgba(59,130,246,0.04) 100%)",
          }}
        >
          <p style={{ fontWeight: 800, color: "#22c55e", fontSize: "1rem" }}>
            🏆{" "}
            {winner === "Tie"
              ? "Match Tied!"
              : `${winner} won the match!`}
          </p>
        </div>
      )}
    </div>
  );
}
