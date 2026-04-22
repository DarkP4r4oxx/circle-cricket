"use client";
import { useState } from "react";
import type { Team } from "@/lib/types";

interface TeamSelectorProps {
  teams: Team[];
  onStart: (teamA: Team, teamB: Team, maxOvers: number, maxWickets: number) => void;
  disabled?: boolean;
}

export default function TeamSelector({ teams, onStart, disabled }: TeamSelectorProps) {
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [maxOvers, setMaxOvers] = useState(6);
  const [maxWickets, setMaxWickets] = useState(10);

  const teamA = teams.find((t) => t.id === teamAId);
  const teamB = teams.find((t) => t.id === teamBId);
  const canStart = teamA && teamB && teamAId !== teamBId && !disabled;

  function handleStart() {
    if (!teamA || !teamB) return;
    onStart(teamA, teamB, maxOvers, maxWickets);
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

  const inputStyle = {
    background: "#0d1525",
    border: "1px solid #1e293b",
    borderRadius: 8,
    color: "#f1f5f9",
    padding: "0.45rem 0.65rem",
    fontSize: "0.875rem",
    width: "100%",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      {/* Team selectors */}
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

        <span style={{ display: "flex", alignItems: "center", color: "#475569", fontWeight: 700, fontSize: "0.75rem" }}>
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

      {/* Match limits */}
      <div
        style={{
          background: "rgba(59,130,246,0.06)",
          border: "1px solid rgba(59,130,246,0.18)",
          borderRadius: 10,
          padding: "0.75rem 1rem",
        }}
      >
        <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
          ⚙️ Match Settings
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 110 }}>
            <label style={{ fontSize: "0.72rem", color: "#64748b", display: "block", marginBottom: 4 }}>
              Max Overs per innings
            </label>
            <input
              id="max-overs-input"
              type="number"
              min={1}
              max={50}
              value={maxOvers}
              onChange={(e) => setMaxOvers(Math.max(1, parseInt(e.target.value) || 1))}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1, minWidth: 110 }}>
            <label style={{ fontSize: "0.72rem", color: "#64748b", display: "block", marginBottom: 4 }}>
              Max Wickets per innings
            </label>
            <input
              id="max-wickets-input"
              type="number"
              min={1}
              max={10}
              value={maxWickets}
              onChange={(e) => setMaxWickets(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              style={inputStyle}
            />
          </div>
        </div>
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
