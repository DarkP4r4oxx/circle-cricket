"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, setDoc, increment } from "firebase/firestore";
import type { Match, MatchScore } from "@/lib/types";
import Toast from "@/components/Toast";

interface AdminControlsProps {
  match: Match;
}

const RUN_BUTTONS = [1, 2, 3, 4, 6];

/**
 * Increment ball count for an innings.
 * Overs are stored as cricket notation: 1 over 3 balls = 1.3
 * After 5 balls (x.5), the next ball completes the over → becomes (x+1).0
 */
function nextOver(currentOvers: number): number {
  const wholeOvers = Math.floor(currentOvers);
  const balls = Math.round((currentOvers - wholeOvers) * 10);
  if (balls >= 5) {
    return wholeOvers + 1;
  } else {
    return parseFloat((wholeOvers + (balls + 1) / 10).toFixed(1));
  }
}

export default function AdminControls({ match }: AdminControlsProps) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const maxOvers = match.maxOvers ?? 999;
  const maxWickets = match.maxWickets ?? 10;

  function showToast(msg: string, type: "success" | "error" | "info" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  function currentSnapshot(): MatchScore {
    return {
      scoreA: match.scoreA,
      wicketsA: match.wicketsA,
      oversA: match.oversA,
      scoreB: match.scoreB,
      wicketsB: match.wicketsB,
      oversB: match.oversB,
      currentInnings: match.currentInnings,
    };
  }

  async function updateMatch(updates: Partial<Match>, toastMsg?: string) {
    if (match.status === "completed") {
      showToast("Match is already completed.", "error");
      return;
    }
    setLoading(true);
    try {
      const matchRef = doc(db, "matches", match.id);
      await updateDoc(matchRef, {
        ...updates,
        actionLog: arrayUnion(currentSnapshot()),
      });
      if (toastMsg) showToast(toastMsg);
    } catch (e) {
      showToast("Update failed. Try again.", "error");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ── Auto-end logic ──────────────────────────────────────────────────────────
  // Called after every ball is recorded. Checks whether the current innings
  // (or the whole match) should end automatically based on maxOvers/maxWickets.

  async function checkAndAutoEnd(
    newOvers: number,
    newWickets: number,
    innings: "A" | "B"
  ) {
    const oversUp = Math.floor(newOvers) >= maxOvers;
    const wicketsUp = newWickets >= maxWickets;

    if (!oversUp && !wicketsUp) return; // nothing to trigger

    if (innings === "A") {
      // End 1st innings, switch to 2nd
      showToast("1st innings over! Switching to 2nd innings 🔄", "info");
      setLoading(true);
      try {
        await updateDoc(doc(db, "matches", match.id), {
          currentInnings: "B",
          actionLog: arrayUnion(currentSnapshot()),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else {
      // End 2nd innings → end match
      showToast("Match limit reached! Ending match… 🏆", "info");
      await endMatch();
    }
  }

  // ── Scoring actions ────────────────────────────────────────────────────────

  async function addRuns(runs: number) {
    const isA = match.currentInnings === "A";
    const scoreField = isA ? "scoreA" : "scoreB";
    const oversField = isA ? "oversA" : "oversB";
    const currentScore = isA ? match.scoreA : match.scoreB;
    const currentOvers = isA ? match.oversA : match.oversB;
    const currentWickets = isA ? match.wicketsA : match.wicketsB;
    const newOvers = nextOver(currentOvers);

    const updates: Partial<Match> = {
      [scoreField]: currentScore + runs,
      [oversField]: newOvers,
    };
    if (runs === 4 || runs === 6) {
      (updates as Record<string, unknown>).lastEvent = {
        type: runs === 6 ? "SIX" : "FOUR",
        ts: Date.now(),
      };
    }

    await updateMatch(updates, `+${runs} ${runs === 1 ? "run" : "runs"}`);
    await checkAndAutoEnd(newOvers, currentWickets, match.currentInnings);
  }

  async function addWicket() {
    const isA = match.currentInnings === "A";
    const wicketsField = isA ? "wicketsA" : "wicketsB";
    const oversField = isA ? "oversA" : "oversB";
    const currentWickets = isA ? match.wicketsA : match.wicketsB;
    const currentOvers = isA ? match.oversA : match.oversB;

    if (currentWickets >= maxWickets) {
      showToast(`Max wickets (${maxWickets}) already reached!`, "error");
      return;
    }
    if (currentWickets >= 10) {
      showToast("Maximum 10 wickets!", "error");
      return;
    }

    const newOvers = nextOver(currentOvers);
    const newWickets = currentWickets + 1;

    await updateMatch(
      {
        [wicketsField]: newWickets,
        [oversField]: newOvers,
        lastEvent: { type: "WICKET", ts: Date.now() },
      } as Partial<Match>,
      "Wicket! 🎯"
    );
    await checkAndAutoEnd(newOvers, newWickets, match.currentInnings);
  }

  async function addDotBall() {
    const isA = match.currentInnings === "A";
    const oversField = isA ? "oversA" : "oversB";
    const currentOvers = isA ? match.oversA : match.oversB;
    const currentWickets = isA ? match.wicketsA : match.wicketsB;
    const newOvers = nextOver(currentOvers);
    await updateMatch({ [oversField]: newOvers } as Partial<Match>, "Dot ball ●");
    await checkAndAutoEnd(newOvers, currentWickets, match.currentInnings);
  }

  async function addExtra(label: string) {
    const isA = match.currentInnings === "A";
    const scoreField = isA ? "scoreA" : "scoreB";
    const currentScore = isA ? match.scoreA : match.scoreB;
    // Extras don't count as a ball — no over increment, no auto-end check
    await updateMatch({ [scoreField]: currentScore + 1 } as Partial<Match>, `${label} (+1 extra)`);
  }

  async function completeOver() {
    const isA = match.currentInnings === "A";
    const oversField = isA ? "oversA" : "oversB";
    const currentOvers = isA ? match.oversA : match.oversB;
    const currentWickets = isA ? match.wicketsA : match.wicketsB;
    const newOvers = Math.floor(currentOvers) + 1;
    await updateMatch({ [oversField]: newOvers } as Partial<Match>, "Over completed");
    await checkAndAutoEnd(newOvers, currentWickets, match.currentInnings);
  }

  async function switchInnings() {
    if (match.currentInnings === "B") {
      showToast("Already in 2nd innings.", "info");
      return;
    }
    await updateMatch({ currentInnings: "B" }, "Switched to 2nd innings");
  }

  async function endMatch() {
    if (match.status === "completed") return;
    setLoading(true);
    try {
      const matchRef = doc(db, "matches", match.id);
      await updateDoc(matchRef, { status: "completed" });
      await setDoc(doc(db, "meta", "currentMatch"), { matchId: null });

      const winner =
        match.scoreA > match.scoreB
          ? match.teamA
          : match.scoreB > match.scoreA
          ? match.teamB
          : null;
      const loser =
        winner === match.teamA
          ? match.teamB
          : winner === match.teamB
          ? match.teamA
          : null;

      // runsFor / runsAgainst are SET to the latest match score (not accumulated)
      const teamAUpdates = {
        matchesPlayed: increment(1),
        runsFor: match.scoreA,
        runsAgainst: match.scoreB,
        wins: winner === match.teamA ? increment(1) : increment(0),
        losses: loser === match.teamA ? increment(1) : increment(0),
        points: winner === match.teamA ? increment(2) : increment(0),
      };
      const teamBUpdates = {
        matchesPlayed: increment(1),
        runsFor: match.scoreB,
        runsAgainst: match.scoreA,
        wins: winner === match.teamB ? increment(1) : increment(0),
        losses: loser === match.teamB ? increment(1) : increment(0),
        points: winner === match.teamB ? increment(2) : increment(0),
      };

      await updateDoc(doc(db, "teams", match.teamA), teamAUpdates);
      await updateDoc(doc(db, "teams", match.teamB), teamBUpdates);

      showToast("Match ended! Standings updated. 🏆", "success");
    } catch (e) {
      showToast("Failed to end match.", "error");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function undoLastAction() {
    const log = match.actionLog;
    if (!log || log.length === 0) {
      showToast("Nothing to undo.", "info");
      return;
    }
    setLoading(true);
    try {
      const lastState = log[log.length - 1];
      const newLog = log.slice(0, -1);
      await updateDoc(doc(db, "matches", match.id), {
        ...lastState,
        actionLog: newLog,
      });
      showToast("Undo successful ↩", "info");
    } catch (e) {
      showToast("Undo failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  const isA = match.currentInnings === "A";
  const currentOvers = isA ? match.oversA : match.oversB;
  const currentWickets = isA ? match.wicketsA : match.wicketsB;
  const ballsInOver = Math.round((currentOvers - Math.floor(currentOvers)) * 10);
  const inningsLabel = isA
    ? `${match.teamAName} (1st Innings)`
    : `${match.teamBName} (2nd Innings)`;
  const isCompleted = match.status === "completed";

  // Overs / wickets progress for current innings
  const oversCompleted = Math.floor(currentOvers);
  const oversPct = maxOvers < 999 ? Math.min(100, (oversCompleted / maxOvers) * 100) : 0;
  const wicketsPct = Math.min(100, (currentWickets / maxWickets) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Match limits banner */}
      {maxOvers < 999 && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            padding: "0.6rem 0.9rem",
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.18)",
            borderRadius: 8,
            fontSize: "0.75rem",
            color: "#94a3b8",
          }}
        >
          <span>⚙️ Limits:</span>
          <span style={{ color: oversCompleted >= maxOvers ? "#ef4444" : "#3b82f6" }}>
            {oversCompleted}/{maxOvers} overs
          </span>
          <span>·</span>
          <span style={{ color: currentWickets >= maxWickets ? "#ef4444" : "#f59e0b" }}>
            {currentWickets}/{maxWickets} wickets
          </span>
        </div>
      )}

      {/* Batting info + ball indicator */}
      <div
        style={{
          padding: "0.75rem 1rem",
          background: "rgba(34, 197, 94, 0.07)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#22c55e" }}>
          🏏 {inningsLabel}
        </span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: i < ballsInOver ? "#22c55e" : "#1e293b",
                border: "1px solid",
                borderColor: i < ballsInOver ? "#22c55e" : "#334155",
                display: "inline-block",
                transition: "background 0.2s",
              }}
            />
          ))}
          <span style={{ fontSize: "0.7rem", color: "#64748b", marginLeft: 4, fontWeight: 600 }}>
            {ballsInOver}/6
          </span>
        </div>
      </div>

      {/* Runs buttons */}
      <div>
        <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
          Runs (auto-counts ball)
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            id="add-dot-btn"
            className="btn"
            onClick={addDotBall}
            disabled={loading || isCompleted}
            style={{ flex: 1, minWidth: 48, fontWeight: 800, background: "rgba(100,116,139,0.15)", border: "1px solid #334155", color: "#94a3b8" }}
          >
            •
          </button>
          {RUN_BUTTONS.map((r) => (
            <button
              key={r}
              id={`add-runs-${r}`}
              className="btn btn-primary"
              onClick={() => addRuns(r)}
              disabled={loading || isCompleted}
              style={{
                flex: 1,
                minWidth: 48,
                fontSize: r === 6 ? "1.1rem" : "0.95rem",
                fontWeight: 800,
                background: r === 4 ? "#f59e0b" : r === 6 ? "#22c55e" : "#3b82f6",
                color: r === 6 ? "#052e16" : "white",
              }}
            >
              +{r}
            </button>
          ))}
        </div>
      </div>

      {/* Extras */}
      <div>
        <p style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
          Extras (no ball count)
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button id="add-wide-btn" className="btn btn-ghost" onClick={() => addExtra("Wide")} disabled={loading || isCompleted} style={{ flex: 1 }}>
            Wide +1
          </button>
          <button id="add-noball-btn" className="btn btn-ghost" onClick={() => addExtra("No Ball")} disabled={loading || isCompleted} style={{ flex: 1 }}>
            No Ball +1
          </button>
        </div>
      </div>

      {/* Wicket & Over controls */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          id="add-wicket-btn"
          className="btn btn-danger"
          onClick={addWicket}
          disabled={loading || isCompleted || currentWickets >= maxWickets}
          style={{ flex: 1 }}
        >
          🎯 Wicket
        </button>
        <button
          id="complete-over-btn"
          className="btn btn-ghost"
          onClick={completeOver}
          disabled={loading || isCompleted || ballsInOver === 0}
          title="Force-complete the current over"
          style={{ flex: 1 }}
        >
          ✓ End Over
        </button>
      </div>

      {/* Switch innings / Undo */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          id="switch-innings-btn"
          className="btn"
          onClick={switchInnings}
          disabled={loading || isCompleted || match.currentInnings === "B"}
          style={{
            flex: 1,
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
            color: "#3b82f6",
            opacity: loading || isCompleted || match.currentInnings === "B" ? 0.4 : 1,
          }}
        >
          ⇄ Switch Innings
        </button>
        <button
          id="undo-btn"
          className="btn btn-ghost"
          onClick={undoLastAction}
          disabled={loading || isCompleted || !match.actionLog?.length}
          style={{ flex: 1 }}
        >
          ↩ Undo
        </button>
      </div>

      {/* End Match */}
      {!isCompleted && (
        <button
          id="end-match-btn"
          className="btn btn-danger"
          onClick={endMatch}
          disabled={loading}
          style={{ width: "100%", padding: "0.75rem" }}
        >
          🔚 End Match
        </button>
      )}

      {isCompleted && (
        <div style={{ textAlign: "center", padding: "0.75rem", color: "#64748b", fontSize: "0.875rem", fontWeight: 600, border: "1px solid #1e293b", borderRadius: 8 }}>
          ✓ Match Completed
        </div>
      )}
    </div>
  );
}
