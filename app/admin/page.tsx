"use client";
// Admin Panel — /admin
// Protected: redirects to /admin/login if not authenticated
// Full team & match management with live scoring controls

import { useState, useEffect, FormEvent } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
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
import type { Team } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [addingTeam, setAddingTeam] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const { match, loading: matchLoading } = useCurrentMatch();
  const celebration = useCelebration(match);

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/admin/login");
      } else {
        setUser(u);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [router]);

  // Teams real-time — sort client-side to avoid needing Firestore index
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teams"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Team);
      data.sort((a, b) => a.name.localeCompare(b.name));
      setTeams(data);
    });
    return () => unsub();
  }, []);

  function showToast(msg: string, type: "success" | "error" | "info" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  // Add team
  async function handleAddTeam(e: FormEvent) {
    e.preventDefault();
    const name = newTeamName.trim();
    if (!name) return;
    // Prevent duplicate names
    if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      showToast("A team with this name already exists.", "error");
      return;
    }
    setAddingTeam(true);
    try {
      await addDoc(collection(db, "teams"), {
        name,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        runsFor: 0,
        runsAgainst: 0,
        points: 0,
      });
      setNewTeamName("");
      showToast(`Team "${name}" added!`);
    } catch (e) {
      showToast("Failed to add team.", "error");
    } finally {
      setAddingTeam(false);
    }
  }

  // Delete team
  async function handleDeleteTeam(id: string, name: string) {
    if (!confirm(`Delete team "${name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "teams", id));
      showToast(`Team "${name}" deleted.`, "info");
    } catch (e) {
      showToast("Failed to delete team.", "error");
    }
  }

  // Start match
  async function handleStartMatch(teamA: Team, teamB: Team) {
    if (match && match.status === "live") {
      showToast("End the current match first.", "error");
      return;
    }
    try {
      // Create match document
      const matchRef = await addDoc(collection(db, "matches"), {
        teamA: teamA.id,
        teamB: teamB.id,
        teamAName: teamA.name,
        teamBName: teamB.name,
        scoreA: 0,
        wicketsA: 0,
        oversA: 0,
        scoreB: 0,
        wicketsB: 0,
        oversB: 0,
        status: "live",
        currentInnings: "A",
        createdAt: serverTimestamp(),
        actionLog: [],
      });
      // Set as current match
      await setDoc(doc(db, "meta", "currentMatch"), { matchId: matchRef.id });
      showToast(`Match started: ${teamA.name} vs ${teamB.name} 🏏`);
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
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
        Verifying access...
      </div>
    );
  }
  if (!user) return null;

  const liveMatch = match && match.status === "live" ? match : null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Celebration overlay */}
      <CelebrationOverlay event={celebration} />
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 900,
              color: "#f1f5f9",
              letterSpacing: "-0.03em",
            }}
          >
            ⚙️ Admin Panel
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.2rem" }}>
            {user.email}
          </p>
        </div>
        <button
          id="sign-out-btn"
          className="btn btn-ghost"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr" }}>
        {/* ── Live Scoring ── */}
        {liveMatch ? (
          <section
            style={{
              background: "#111827",
              border: "1px solid #1e293b",
              borderRadius: 16,
              padding: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#f1f5f9",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  background: "#ef4444",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
                className="live-dot"
              />
              Live Scoring — {liveMatch.teamAName} vs {liveMatch.teamBName}
            </h2>
            <div
              style={{
                display: "grid",
                gap: "1.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              }}
            >
              <Scoreboard match={liveMatch} />
              <AdminControls match={liveMatch} />
            </div>
          </section>
        ) : (
          /* ── Start Match ── */
          <section
            style={{
              background: "#111827",
              border: "1px solid #1e293b",
              borderRadius: 16,
              padding: "1.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#f1f5f9",
                marginBottom: "1.25rem",
              }}
            >
              🏏 Start a New Match
            </h2>
            {matchLoading ? (
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading...</p>
            ) : (
              <TeamSelector
                teams={teams}
                onStart={handleStartMatch}
                disabled={false}
              />
            )}
          </section>
        )}

        {/* ── Team Management ── */}
        <section
          style={{
            background: "#111827",
            border: "1px solid #1e293b",
            borderRadius: 16,
            padding: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#f1f5f9",
              marginBottom: "1.25rem",
            }}
          >
            👥 Team Management
          </h2>

          {/* Add team form */}
          <form
            onSubmit={handleAddTeam}
            style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}
          >
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

          {/* Team list */}
          {teams.length === 0 ? (
            <p style={{ color: "#475569", fontSize: "0.875rem" }}>
              No teams yet. Add the first one above.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {teams.map((team) => (
                <div
                  key={team.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0.9rem",
                    background: "#1a2235",
                    borderRadius: 8,
                    border: "1px solid #1e293b",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: "#f1f5f9", fontSize: "0.9rem" }}>
                      {team.name}
                    </span>
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        fontSize: "0.75rem",
                        color: "#475569",
                      }}
                    >
                      {team.matchesPlayed}P · {team.wins}W · {team.losses}L · {team.points}pts
                    </span>
                  </div>
                  <button
                    id={`delete-team-${team.id}`}
                    className="btn btn-danger"
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
