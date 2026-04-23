"use client";
// Admin Panel — /admin
// Protected: redirects to /admin/login if not authenticated

import { useState, useEffect, FormEvent } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useCurrentMatch } from "@/hooks/useCurrentMatch";
import { useCelebration } from "@/hooks/useCelebration";
import TeamSelector from "@/components/TeamSelector";
import AdminControls from "@/components/AdminControls";
import Scoreboard from "@/components/Scoreboard";
import Toast from "@/components/Toast";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import type { Team, Match } from "@/lib/types";

// ── Inline Edit Row for a team's standings numbers ──────────────────────────
function TeamEditRow({
  team,
  onDelete,
  onSave,
}: {
  team: Team;
  onDelete: () => void;
  onSave: (runsFor: number, runsAgainst: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [runsFor, setRunsFor] = useState(String(team.runsFor));
  const [runsAgainst, setRunsAgainst] = useState(String(team.runsAgainst));

  function handleSave() {
    const rf = parseInt(runsFor) || 0;
    const ra = parseInt(runsAgainst) || 0;
    onSave(rf, ra);
    setEditing(false);
  }

  const inputStyle = {
    background: "#0d1525",
    border: "1px solid #334155",
    borderRadius: 6,
    color: "#f1f5f9",
    padding: "0.25rem 0.4rem",
    fontSize: "0.8rem",
    width: 64,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.6rem 0.9rem",
        background: "#1a2235",
        borderRadius: 8,
        border: "1px solid #1e293b",
        gap: "0.5rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.9rem" }}>
          {team.name}
        </span>
        <span style={{ marginLeft: "0.5rem", fontSize: "0.72rem", color: "#475569" }}>
          {team.matchesPlayed}P · {team.wins}W · {team.losses}L · {team.points}pts
        </span>
      </div>

      {editing ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Runs For:</span>
          <input style={inputStyle} type="number" value={runsFor} onChange={(e) => setRunsFor(e.target.value)} />
          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Against:</span>
          <input style={inputStyle} type="number" value={runsAgainst} onChange={(e) => setRunsAgainst(e.target.value)} />
          <button className="btn btn-success" onClick={handleSave} style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}>✓ Save</button>
          <button className="btn btn-ghost" onClick={() => setEditing(false)} style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}>✕</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 700 }}>
            {team.runsFor}R / {team.runsAgainst}A
          </span>
          <button
            id={`edit-team-${team.id}`}
            className="btn btn-ghost"
            onClick={() => setEditing(true)}
            style={{ padding: "0.25rem 0.6rem", fontSize: "0.72rem", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)" }}
          >
            ✏️
          </button>
          <button
            id={`delete-team-${team.id}`}
            className="btn btn-danger"
            onClick={onDelete}
            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
          >
            🗑
          </button>
        </div>
      )}
    </div>
  );
}

// ── Match history row with delete ────────────────────────────────────────────
function MatchHistoryRow({
  match,
  onDelete,
}: {
  match: Match & { id: string };
  onDelete: () => void;
}) {
  const winnerName =
    match.scoreA > match.scoreB
      ? match.teamAName
      : match.scoreB > match.scoreA
      ? match.teamBName
      : null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.55rem 0.9rem",
        background: "#1a2235",
        borderRadius: 8,
        border: "1px solid #1e293b",
        gap: "0.5rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.85rem" }}>
          {match.teamAName} <span style={{ color: "#22c55e" }}>{match.scoreA}</span>
          <span style={{ color: "#475569" }}> vs </span>
          {match.teamBName} <span style={{ color: "#22c55e" }}>{match.scoreB}</span>
        </span>
        {winnerName && (
          <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "#f59e0b" }}>
            🏆 {winnerName}
          </span>
        )}
        {!winnerName && (
          <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "#64748b" }}>Draw</span>
        )}
      </div>
      <button
        className="btn btn-danger"
        onClick={onDelete}
        style={{ padding: "0.25rem 0.6rem", fontSize: "0.72rem" }}
      >
        🗑 Delete
      </button>
    </div>
  );
}

// ── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [completedMatches, setCompletedMatches] = useState<Match[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [addingTeam, setAddingTeam] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const { match, loading: matchLoading } = useCurrentMatch();
  const celebration = useCelebration(match);

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/admin/login");
      else setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, [router]);

  // Teams real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teams"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Team);
      data.sort((a, b) => a.name.localeCompare(b.name));
      setTeams(data);
    });
    return () => unsub();
  }, []);

  // Completed matches real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "matches"), (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Match)
        .filter((m) => m.status === "completed")
        .sort((a, b) => {
          const aT = (a.createdAt as unknown as { seconds: number })?.seconds ?? 0;
          const bT = (b.createdAt as unknown as { seconds: number })?.seconds ?? 0;
          return bT - aT; // newest first
        });
      setCompletedMatches(data);
    });
    return () => unsub();
  }, []);

  function showToast(msg: string, type: "success" | "error" | "info" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  // ── Add team ───────────────────────────────────────────────────────────────
  async function handleAddTeam(e: FormEvent) {
    e.preventDefault();
    const name = newTeamName.trim();
    if (!name) return;
    if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      showToast("A team with this name already exists.", "error");
      return;
    }
    setAddingTeam(true);
    try {
      await addDoc(collection(db, "teams"), {
        name, matchesPlayed: 0, wins: 0, losses: 0, runsFor: 0, runsAgainst: 0, points: 0,
      });
      setNewTeamName("");
      showToast(`Team "${name}" added!`);
    } catch {
      showToast("Failed to add team.", "error");
    } finally {
      setAddingTeam(false);
    }
  }

  // ── Delete team ────────────────────────────────────────────────────────────
  async function handleDeleteTeam(id: string, name: string) {
    try {
      await deleteDoc(doc(db, "teams", id));
      showToast(`Team "${name}" deleted.`, "info");
    } catch {
      showToast("Failed to delete team.", "error");
    }
  }

  // ── Edit team runs manually ────────────────────────────────────────────────
  async function handleEditTeamRuns(id: string, runsFor: number, runsAgainst: number) {
    try {
      await updateDoc(doc(db, "teams", id), { runsFor, runsAgainst });
      showToast("Standings updated ✅");
    } catch {
      showToast("Failed to update standings.", "error");
    }
  }

  // ── Delete match ───────────────────────────────────────────────────────────
  async function handleDeleteMatch(id: string) {
    try {
      await deleteDoc(doc(db, "matches", id));
      showToast("Match deleted.", "info");
    } catch {
      showToast("Failed to delete match.", "error");
    }
  }

  // ── Recalculate standings from match history ───────────────────────────────
  async function recalculateStandings() {
    setAddingTeam(true);
    try {
      const matchSnap = await getDocs(collection(db, "matches"));
      const completed = matchSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Record<string, unknown>))
        .filter((m) => m.status === "completed");

      // Track highest score each team has ever achieved (best performance)
      const bestFor: Record<string, number> = {};
      const latestAgainst: Record<string, number> = {};
      for (const m of completed) {
        const teamA = m.teamA as string;
        const teamB = m.teamB as string;
        const scoreA = (m.scoreA as number) ?? 0;
        const scoreB = (m.scoreB as number) ?? 0;
        bestFor[teamA] = Math.max(bestFor[teamA] ?? 0, scoreA);
        bestFor[teamB] = Math.max(bestFor[teamB] ?? 0, scoreB);
        latestAgainst[teamA] = scoreB;
        latestAgainst[teamB] = scoreA;
      }

      const writes = Object.entries(bestFor).map(([teamId, runs]) =>
        updateDoc(doc(db, "teams", teamId), { runsFor: runs, runsAgainst: latestAgainst[teamId] ?? 0 })
      );
      await Promise.all(writes);
      showToast(`Standings recalculated for ${writes.length} team(s) ✅`);
    } catch {
      showToast("Recalculation failed.", "error");
    } finally {
      setAddingTeam(false);
    }
  }

  // ── Start match ────────────────────────────────────────────────────────────
  async function handleStartMatch(teamA: Team, teamB: Team, maxOvers: number, maxWickets: number) {
    if (match && match.status === "live") {
      showToast("End the current match first.", "error");
      return;
    }
    try {
      const matchRef = await addDoc(collection(db, "matches"), {
        teamA: teamA.id, teamB: teamB.id,
        teamAName: teamA.name, teamBName: teamB.name,
        scoreA: 0, wicketsA: 0, oversA: 0,
        scoreB: 0, wicketsB: 0, oversB: 0,
        status: "live", currentInnings: "A",
        maxOvers, maxWickets,
        createdAt: serverTimestamp(),
        actionLog: [],
      });
      await setDoc(doc(db, "meta", "currentMatch"), { matchId: matchRef.id });
      showToast(`Match started: ${teamA.name} vs ${teamB.name} 🏏 (${maxOvers} overs, ${maxWickets} wickets)`);
    } catch (e) {
      showToast("Failed to start match.", "error");
      console.error(e);
    }
  }

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/admin/login");
  }

  if (authLoading) {
    return <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>Verifying access...</div>;
  }
  if (!user) return null;

  const liveMatch = match && match.status === "live" ? match : null;

  const sectionStyle = {
    background: "#111827",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: "1.5rem",
  };
  const h2Style = {
    fontSize: "1rem", fontWeight: 700, color: "#f1f5f9", marginBottom: "1.25rem",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <CelebrationOverlay event={celebration} />
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
            ⚙️ Admin Panel
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.2rem" }}>{user.email}</p>
        </div>
        <button id="sign-out-btn" className="btn btn-ghost" onClick={handleSignOut}>Sign Out</button>
      </div>

      <div style={{ display: "grid", gap: "1.5rem" }}>

        {/* ── Live Scoring / Start Match ── */}
        {liveMatch ? (
          <section style={sectionStyle}>
            <h2 style={{ ...h2Style, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: 8, height: 8, background: "#ef4444", borderRadius: "50%", display: "inline-block" }} className="live-dot" />
              Live Scoring — {liveMatch.teamAName} vs {liveMatch.teamBName}
            </h2>
            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              <Scoreboard match={liveMatch} />
              <AdminControls match={liveMatch} />
            </div>
          </section>
        ) : (
          <section style={sectionStyle}>
            <h2 style={h2Style}>🏏 Start a New Match</h2>
            {matchLoading ? (
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading...</p>
            ) : (
              <TeamSelector teams={teams} onStart={handleStartMatch} disabled={false} />
            )}
          </section>
        )}

        {/* ── Match History ── */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>📋 Match History</h2>
          {completedMatches.length === 0 ? (
            <p style={{ color: "#475569", fontSize: "0.875rem" }}>No completed matches yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {completedMatches.map((m) => (
                <MatchHistoryRow
                  key={m.id}
                  match={m}
                  onDelete={() => handleDeleteMatch(m.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Team Management ── */}
        <section style={sectionStyle}>
          <h2 style={h2Style}>👥 Team Management</h2>

          {/* Recalculate button */}
          <button
            id="recalculate-standings-btn"
            className="btn btn-ghost"
            onClick={recalculateStandings}
            disabled={addingTeam}
            style={{ marginBottom: "1rem", fontSize: "0.75rem", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.07)", width: "100%" }}
          >
            🔄 Recalculate Standings from Match History
          </button>

          {/* Add team form */}
          <form onSubmit={handleAddTeam} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <input
              id="new-team-input"
              className="input"
              placeholder="Team name..."
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              maxLength={50}
            />
            <button
              id="add-team-btn"
              type="submit"
              className="btn btn-primary"
              disabled={addingTeam || !newTeamName.trim()}
              style={{ whiteSpace: "nowrap" }}
            >
              + Add
            </button>
          </form>

          {/* Team list with inline edit */}
          {teams.length === 0 ? (
            <p style={{ color: "#475569", fontSize: "0.875rem" }}>No teams yet. Add the first one above.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {teams.map((team) => (
                <TeamEditRow
                  key={team.id}
                  team={team}
                  onDelete={() => handleDeleteTeam(team.id, team.name)}
                  onSave={(rf, ra) => handleEditTeamRuns(team.id, rf, ra)}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
