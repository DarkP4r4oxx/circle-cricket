"use client";
// Hook: useMatchHistory
// Fetches all completed matches in real-time, newest first
// Sorts client-side to avoid needing a Firestore composite index
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import type { Match } from "@/lib/types";

export function useMatchHistory() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all matches, filter + sort client-side (no composite index needed)
    const unsub = onSnapshot(
      collection(db, "matches"),
      (snap) => {
        const data: Match[] = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Match)
          .filter((m) => m.status === "completed")
          .sort((a, b) => {
            // Sort newest first using createdAt timestamp
            const aTime = (a.createdAt as unknown as { seconds: number })?.seconds ?? 0;
            const bTime = (b.createdAt as unknown as { seconds: number })?.seconds ?? 0;
            return bTime - aTime;
          });

        setMatches(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { matches, loading, error };
}
