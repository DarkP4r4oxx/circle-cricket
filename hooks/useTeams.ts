"use client";
// Hook: useTeams
// Listens in real-time to all teams in Firestore
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import type { Team } from "@/lib/types";

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "teams"), orderBy("name", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: Team[] = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Team[];
        setTeams(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { teams, loading, error };
}
