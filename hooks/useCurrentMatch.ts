"use client";
// Hook: useCurrentMatch
// Listens in real-time to the current live match via Firestore onSnapshot
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import type { Match } from "@/lib/types";

export function useCurrentMatch() {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to the meta/currentMatch document for the current match ID
    const metaRef = doc(db, "meta", "currentMatch");
    let matchUnsub: (() => void) | null = null;

    const metaUnsub = onSnapshot(
      metaRef,
      async (metaSnap) => {
        if (!metaSnap.exists() || !metaSnap.data()?.matchId) {
          setMatch(null);
          setLoading(false);
          return;
        }

        const matchId = metaSnap.data()!.matchId as string;

        // Unsubscribe from previous match listener if any
        if (matchUnsub) matchUnsub();

        // Subscribe to the actual match document
        const matchRef = doc(db, "matches", matchId);
        matchUnsub = onSnapshot(
          matchRef,
          (matchSnap) => {
            if (!matchSnap.exists()) {
              setMatch(null);
            } else {
              setMatch({ id: matchSnap.id, ...matchSnap.data() } as Match);
            }
            setLoading(false);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
          }
        );
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      metaUnsub();
      if (matchUnsub) matchUnsub();
    };
  }, []);

  return { match, loading, error };
}
