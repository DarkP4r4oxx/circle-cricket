// Shared TypeScript types for the Circle Cricket app

export interface Team {
  id: string;
  name: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  runsFor: number;
  runsAgainst: number;
  points: number;
}

export type CelebrationEvent = "FOUR" | "SIX" | "WICKET";

export interface Match {
  id: string;
  teamA: string; // teamId
  teamB: string; // teamId
  teamAName: string;
  teamBName: string;
  scoreA: number;
  wicketsA: number;
  oversA: number;
  scoreB: number;
  wicketsB: number;
  oversB: number;
  status: "live" | "completed";
  currentInnings: "A" | "B";
  createdAt: Date;
  // Configurable match limits set at match start
  maxOvers: number;   // innings ends automatically after this many overs
  maxWickets: number; // innings ends automatically after this many wickets
  // Action log for undo feature: array of state snapshots
  actionLog?: MatchScore[];
  // Last scoring event — used to trigger celebration overlays on all clients
  lastEvent?: { type: CelebrationEvent; ts: number };
}

export interface MatchScore {
  scoreA: number;
  wicketsA: number;
  oversA: number;
  scoreB: number;
  wicketsB: number;
  oversB: number;
  currentInnings: "A" | "B";
}

export interface CurrentMatchMeta {
  matchId: string;
}
