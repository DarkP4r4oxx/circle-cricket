"use client";
// Hook: useStandings
// Listens in real-time to teams, sorted client-side by points (no composite index needed)
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import type { Team } from "@/lib/types";

export function useStandings() {
  const [standings, setStandings] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all teams and sort client-side — avoids needing a Firestore composite index
    const unsub = onSnapshot(
      collection(db, "teams"),
      (snap) => {
        const data: Team[] = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Team[];

        // Sort by total runs scored (highest first). Tiebreaker: fewer matches played = better
        data.sort((a, b) => {
          if (b.runsFor !== a.runsFor) return b.runsFor - a.runsFor;
          return a.matchesPlayed - b.matchesPlayed;
        });

        setStandings(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { standings, loading, error };
}
