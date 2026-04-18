"use client";
// useCelebration — watches match.lastEvent and triggers the overlay
// Uses a ref to avoid re-showing the same event on re-renders
import { useState, useEffect, useRef } from "react";
import type { Match, CelebrationEvent } from "@/lib/types";

const DURATION = 2800;

export function useCelebration(match: Match | null) {
  const [active, setActive] = useState<CelebrationEvent | null>(null);
  const lastTs = useRef<number | null>(null);

  useEffect(() => {
    if (!match?.lastEvent) return;
    const { type, ts } = match.lastEvent;
    // Only fire once per unique timestamp
    if (ts !== lastTs.current) {
      lastTs.current = ts;
      setActive(type);
      const timer = setTimeout(() => setActive(null), DURATION);
      return () => clearTimeout(timer);
    }
  }, [match?.lastEvent?.ts]);

  return active;
}
