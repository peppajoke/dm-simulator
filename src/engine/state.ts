// Game state shape — see /docs/02_TECHNICAL_ARCHITECTURE.md section 3.
// Stub for prototype; full reducer comes in Phase 1.
export type GamePhase =
  | 'onboarding'
  | 'character-creation'
  | 'campaign-select'
  | 'scheduling'
  | 'prep'
  | 'session'
  | 'credits'
  | 'post-credits';

export interface GameMeta {
  dmName: string;
  pronouns: string;
  campaignId: string;
  day: number;
  phase: GamePhase;
}
