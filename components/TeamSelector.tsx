"use client";
import { useState } from "react";
import type { Team } from "@/lib/types";

interface TeamSelectorProps {
  teams: Team[];
  onStart: (teamA: Team, teamB: Team) => void;
  disabled?: boolean;
}

export default function TeamSelector({
  teams,
  onStart,
  disabled,
}: TeamSelectorProps) {
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");

  const teamA = teams.find((t) => t.id === teamAId);
  const teamB = teams.find((t) => t.id === teamBId);

  const canStart =
    teamA &&
    teamB &&
    teamAId !== teamBId &&
    !disabled;

  function handleStart() {
    if (!teamA || !teamB) return;
    onStart(teamA, teamB);
    setTeamAId("");
    setTeamBId("");
  }

  if (teams.length < 2) {
    return (
      <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
        Add at least 2 teams to start a match.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <select
          id="team-a-select"
          className="input"
          value={teamAId}
          onChange={(e) => setTeamAId(e.target.value)}
          style={{ flex: 1, minWidth: 140 }}
        >
          <option value="">Select Team A</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id} disabled={t.id === teamBId}>
              {t.name}
            </option>
          ))}
        </select>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            color: "#475569",
            fontWeight: 700,
            fontSize: "0.75rem",
          }}
        >
          VS
        </span>

        <select
          id="team-b-select"
          className="input"
          value={teamBId}
          onChange={(e) => setTeamBId(e.target.value)}
          style={{ flex: 1, minWidth: 140 }}
        >
          <option value="">Select Team B</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id} disabled={t.id === teamAId}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <button
        id="start-match-btn"
        className="btn btn-success"
        disabled={!canStart}
        onClick={handleStart}
        style={{ opacity: canStart ? 1 : 0.4, cursor: canStart ? "pointer" : "not-allowed" }}
      >
        🏏 Start Match
      </button>
    </div>
  );
}
