# DM Simulator — Technical Architecture

Companion to `01_GAME_DESIGN.md`. Defines stack, state model, content pack schema, and LLM integration. Written so Claude Code can implement directly.

---

## 1. Stack

- **Frontend:** React + TypeScript + Vite. Function components only. No state management library — `useReducer` + Context for game state, plain hooks for app-local UI state.
- **Styling:** Tailwind CSS. Pixel art rendered via `image-rendering: pixelated`.
- **Build/deploy:** Vite static build. Deployable to any static host (Cloudflare Pages, Vercel, Netlify).
- **LLM proxy:** Cloudflare Workers (or equivalent) endpoint that proxies to Anthropic's API with a server-held key. Rate-limited per session-token.
- **Storage:** `localStorage` only. No backend persistence in v1.

Rationale: this stack is fastest to build, fastest to iterate, and the proxy is the only piece of server we need.

---

## 2. Project structure

```
/src
  /apps                    # Each faux-OS app is a self-contained component
    /chat                  # Discord-like (group chat, DMs, splinter chats)
    /email
    /browser
    /notes
    /encounter-builder
    /calendar
    /music
  /os                      # The desktop shell — windowing, taskbar, wallpaper
  /engine                  # Game logic, no React
    state.ts               # Game state shape + reducer
    actions.ts             # Action types
    selectors.ts           # Derived state
    events.ts              # Event system (overnight events, triggered events)
    tone.ts                # Tone Drift accumulation + summary
    energy.ts              # Daily energy system
  /content                 # Content packs (JSON + assets)
    /campaigns
      /curse-of-strudel
        manifest.json
        npcs.json
        encounters.json
        locations.json
        lore.json
        sprites/
        portraits/
    /archetypes
      archetypes.json      # The 10 archetypes — stat profiles, behavior tendencies
      sprite-base/         # Base sprite + palette swap rules
  /llm                     # Client wrapper for the proxy
    client.ts
    prompts/               # Prompt templates per generation type
      roster-gen.ts
      npc-dialogue.ts
      session-recap.ts
      chat-message.ts
      splinter-event.ts
      lore-reaction.ts
    cache.ts               # Local LLM response cache
  /save                    # localStorage interface + versioning
    schema.ts
    migrations.ts
  /ui                      # Shared UI primitives (buttons, windows, sprites)
  /assets                  # Static images, audio
  main.tsx
  App.tsx

/server                    # Cloudflare Worker (or whatever) — separate deploy
  index.ts                 # /api/llm endpoint, rate limiting, key handling
  rate-limit.ts
  prompts.ts               # System prompts (kept server-side to discourage tampering)

/docs
  01_GAME_DESIGN.md
  02_TECHNICAL_ARCHITECTURE.md
  03_CLAUDE_CODE_PROMPTS.md
```

---

## 3. Game state shape

Single source of truth, serialized to localStorage.

```ts
type GameState = {
  schemaVersion: number;            // for migrations
  saveSlot: 0 | 1 | 2;
  meta: {
    createdAt: number;
    lastPlayedAt: number;
    dmName: string;
    pronouns: string;
    campaignId: string;             // 'curse-of-strudel'
    day: number;                    // increments on sleep
    phase: 'onboarding' | 'character-creation' | 'campaign-select'
         | 'scheduling' | 'prep' | 'session' | 'credits' | 'post-credits';
    sessionDate: number | null;     // day index of the planned session
    creditsRolled: boolean;
  };
  energy: {
    current: number;
    max: number;                    // baseline 4, modified by Burnout
  };
  stats: {
    prepDepth: number;              // 0–100, weighted by category
    groupCohesion: number;          // 0–100
    burnout: number;                // 0–100
    hype: number;                   // 0–100
    toneDrift: ToneVector;          // multidimensional, see below
  };
  roster: PlayerCharacter[];        // the NPCs (your D&D players)
  campaign: {
    bible: LoreEntry[];
    npcs: NpcInstance[];            // hydrated from content pack + player additions
    encounters: EncounterInstance[];
    pcSheets: PcSheet[];            // one per roster member who finished char creation
  };
  chat: {
    channels: ChatChannel[];        // group chat, splinters, DMs
    unreadCounts: Record<string, number>;
  };
  email: { messages: EmailMessage[]; };
  browser: { history: BrowserPage[]; openTabs: string[]; };
  calendar: { events: CalendarEvent[]; };
  notes: { documents: NoteDocument[]; };
  music: { currentTrack: string | null; volume: number; };
  pendingEvents: GameEvent[];       // triggered events queued for delivery
  history: HistoryEntry[];          // append-only log for tone analysis + recaps
  llmCache: Record<string, CachedLlmResponse>;
};

type ToneVector = {
  dark: number;       // 0–1
  earnest: number;    // 0–1
  horny: number;      // 0–1
  cruel: number;      // 0–1
  sarcastic: number;  // 0–1
  paternal: number;   // 0–1
  // soft-floating, never sums to 1
};

type PlayerCharacter = {
  id: string;
  archetypeId: ArchetypeId;
  name: string;
  pronouns: string;
  spriteVariant: string;            // palette + accessory key
  personality: {
    seed: string;                   // LLM-generated, used in every prompt
    speechPattern: string;
    quirk: string;
  };
  stats: {
    engagement: number;             // 0–100
    disruption: number;             // 0–100
    cohesionContribution: number;   // 0–100
    presenceProbability: number;    // 0–1, chance they show up to a given session
  };
  status: 'active' | 'on-break' | 'ghosted' | 'returning';
  pcSheet: PcSheet | null;          // null until character creation completed
};

type GameEvent = {
  id: string;
  triggerOn: 'morning' | 'evening' | 'on-action' | 'scheduled';
  triggerDay?: number;
  payload:
    | { kind: 'chat-message'; channelId: string; authorId: string; content: string }
    | { kind: 'email'; from: string; subject: string; body: string }
    | { kind: 'splinter-form'; founderId: string; participants: string[]; reason: string }
    | { kind: 'roster-change'; change: 'leave' | 'join' | 'break'; characterId?: string }
    | { kind: 'reschedule-request'; characterId: string; reason: string }
    | { kind: 'cutscene'; cutsceneId: string };
};
```

All deltas to state go through a single reducer. Side effects (LLM calls, sound, animations) are dispatched separately via an effects layer.

---

## 4. Content pack schema

Content packs are pure JSON + asset folders. Loaded at campaign-select time. **No campaign-specific code lives outside the content pack** — this is the modularity guarantee.

```jsonc
// /src/content/campaigns/curse-of-strudel/manifest.json
{
  "id": "curse-of-strudel",
  "title": "Curse of Strudel",
  "blurb": "Gothic horror in the misty land of Barovino...",
  "tags": ["gothic", "horror", "vampires", "baked-goods"],
  "preferredToneSeed": { "dark": 0.6, "earnest": 0.3 },
  "files": {
    "lore": "lore.json",
    "npcs": "npcs.json",
    "encounters": "encounters.json",
    "locations": "locations.json"
  },
  "assets": {
    "splash": "sprites/strudel-splash.png",
    "music": "audio/barovino-mists.ogg"
  },
  "openingHook": "An invitation, sealed with black wax and smelling faintly of cinnamon, slides under your door.",
  "sessionStructure": {
    "minSessionsToCredits": 1,
    "creditsTrigger": "session-1-begins"
  }
}
```

Adding "Tomb of Implications" later = a new folder under `/content/campaigns/`. Zero code changes.

---

## 5. LLM integration

### Proxy endpoint
- **POST** `/api/llm` — single endpoint, accepts `{ promptKey, params, gameStateDigest }`.
- Server holds the system prompt for each `promptKey`. Client never sees system prompts (discourages prompt-extraction abuse and keeps tone consistent).
- Uses `claude-sonnet-4-6` for most calls, escalates to `claude-opus-4-7` for high-leverage moments (session recap, splinter chat events). Note: confirm exact model strings at build time via `product-self-knowledge` skill.

### Rate limiting
- Per-save-slot token bucket: ~30 LLM-backed actions/hour, refills slowly. Out-of-budget triggers a graceful "your inner monologue goes quiet" UI state and falls back to canned content.
- Server-side rate limit by IP as backstop.

### Caching strategy
- **Roster personalities:** generated once at campaign start, never re-generated.
- **NPC base voices:** generated once when an NPC first appears in the player's view.
- **Splinter chat backfill:** generated as a single batched call when the splinter forms; subsequent messages in that splinter are cheaper because the seed is already in cache.
- **Session recap:** single call, takes a digest of the prep + roster + Tone Drift.
- **Reactive chat replies:** small, frequent. These are the budget hogs. Use streaming and aggressive caching keyed on `(channelId, recentDigest, toneDrift)`.

### Prompt template anatomy

Every prompt sent to the proxy includes:
1. **Compressed game digest** (~200 tokens): day, campaign, roster summary, tone drift summary, recent events.
2. **Specific context** (~varies): the relevant chat thread, NPC seed, prep artifact.
3. **Tone instruction:** derived from Tone Drift vector — explicit instruction to mirror the player's register.
4. **Output schema:** strict JSON schema. Server validates. On failure, retry once, then fall back to canned.

### Fallback content
Every LLM-backed feature has canned fallback content. The game is fully playable (less dynamic, but playable) with the LLM proxy completely down.

---

## 6. Tone Drift implementation

A small set of input → vector mappings:

- **Dialogue option tags:** every multiple-choice option has hidden tone tags. Picking a `cruel:0.3` option nudges Tone Drift's `cruel` axis +0.03 (clamped 0–1, decays slowly).
- **Free-text classification:** when the player writes free text, send it through a lightweight on-device classifier (small JSON-based heuristic for v1: keyword + sentiment match) OR a single low-cost LLM call. v1 starts heuristic, can be upgraded to LLM later.
- **Behavior signals:** opening certain apps a lot, ignoring messages, taking actions on splinter-chat info — all small Tone Drift nudges.
- **Decay:** all Tone Drift axes decay 1–2% per day so recent behavior dominates.

**Surfacing:** the player never sees Tone Drift directly. They feel it in NPC voices, chat tone, and (in post-credits) in subtle UI shifts.

---

## 7. Save system

### Versioning
- `schemaVersion` integer in every save.
- Migration functions in `/save/migrations.ts` keyed by version.
- On load: walk migrations from saved version → current version. Fail loudly if no path.

### Slots
- 3 slots. Slot picker on app launch.
- Each slot stores under `dmsim:save:slot:{n}` key.
- Settings (volume, etc.) stored separately under `dmsim:settings`.

### Export/import
- Button in settings to download save as JSON.
- Drag-and-drop import on slot picker.
- Useful for sharing weird playthroughs and for player-side backups.

### Quota safety
- Estimate save size on write. Warn if >2MB. Hard-cap LLM cache portion of save (LRU eviction).

---

## 8. Pixel art pipeline

- Base sprite size: 32×32 for portraits, 16×16 for chat avatars.
- Palette swaps + accessory layers for archetype variation.
- Generate base sprites and palettes by hand (or AI-assisted, then cleaned). Compose at runtime in canvas or pre-composite at build time — start with pre-composited.
- Locations and cutscene art: 256×144 base, scaled with `image-rendering: pixelated`.

---

## 9. What we are explicitly not building in v1

- Backend persistence (cloud saves, accounts).
- Real-time multiplayer or shared campaigns.
- A real-feeling browser (the in-game browser is scripted pages only).
- Audio voice acting or TTS.
- Mobile layout. Game assumes ≥1280px width.
- An achievement system.
- Mod / content-pack tooling for end users.

---

## 10. Risk register

| Risk | Mitigation |
|---|---|
| LLM cost spikes | Per-slot rate limiting, aggressive caching, canned fallbacks for everything |
| Save corruption | Versioned schema, migrations, manual export, warn before quota |
| Tone Drift feels random or unfun | Tunable decay + magnitude constants in a single `tone-config.ts`; iterate by playtesting |
| Splinter chats feel fake | Generate them as batched LLM calls seeded on real roster relationships and recent events; cache so they stay coherent |
| Pixel art bottleneck | Start with a tight palette + small base sprite set; archetype variation via palette swap, not new art |
| "Highlight reel" sessions feel hollow | Heavily reference player-authored prep artifacts in the recap prompt; the more the player wrote, the more the recap can ignore — making the joke land harder |
