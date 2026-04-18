"use client";
import type { Team } from "@/lib/types";

interface StandingsTableProps {
  teams: Team[];
}

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7c54"]; // gold, silver, bronze
const RANK_LABELS = ["🥇", "🥈", "🥉"];

export default function StandingsTable({ teams }: StandingsTableProps) {
  if (teams.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#64748b" }}>
        <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</p>
        <p style={{ fontWeight: 600 }}>No teams registered yet</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #1e293b" }}>
            {[
              { label: "#", align: "center" },
              { label: "Team", align: "left" },
              { label: "Matches", align: "center" },
              { label: "Runs Scored", align: "center" },
              { label: "Runs Conceded", align: "center" },
              { label: "Diff", align: "center" },
            ].map((h) => (
              <th
                key={h.label}
                style={{
                  padding: "0.75rem 1rem",
                  textAlign: h.align as "center" | "left",
                  color: "#64748b",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => {
            const diff = team.runsFor - team.runsAgainst;
            const isTop3 = i < 3;
            return (
              <tr
                key={team.id}
                className="table-row"
                style={{
                  borderBottom: "1px solid #0f172a",
                  background: isTop3 ? `${RANK_COLORS[i]}08` : undefined,
                }}
              >
                {/* Rank */}
                <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                  {i < 3 ? (
                    <span style={{ fontSize: "1.1rem" }}>{RANK_LABELS[i]}</span>
                  ) : (
                    <span style={{ color: "#475569", fontWeight: 700 }}>{i + 1}</span>
                  )}
                </td>

                {/* Team name */}
                <td style={{ padding: "0.9rem 1rem" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: isTop3 ? RANK_COLORS[i] : "#f1f5f9",
                      fontSize: "0.9rem",
                    }}
                  >
                    {team.name}
                  </span>
                </td>

                {/* Matches */}
                <td style={{ padding: "0.9rem 1rem", textAlign: "center", color: "#94a3b8" }}>
                  {team.matchesPlayed}
                </td>

                {/* Runs Scored — primary metric, highlighted */}
                <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "1.05rem",
                      color: isTop3 ? RANK_COLORS[i] : "#22c55e",
                    }}
                  >
                    {team.runsFor}
                  </span>
                </td>

                {/* Runs Conceded */}
                <td style={{ padding: "0.9rem 1rem", textAlign: "center", color: "#94a3b8" }}>
                  {team.runsAgainst}
                </td>

                {/* Run Diff */}
                <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: diff > 0 ? "#22c55e" : diff < 0 ? "#ef4444" : "#64748b",
                    }}
                  >
                    {diff > 0 ? "+" : ""}
                    {diff}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
