# DM Simulator — Claude Code Prompt Sequence

Copy-paste these into Claude Code in order. Each prompt assumes the previous ones ran and the project state matches what they produced. Feed Claude Code the design doc and architecture doc as context for **every** prompt — they're the source of truth.

> **Setup once, before Prompt 1:** put `01_GAME_DESIGN.md` and `02_TECHNICAL_ARCHITECTURE.md` in the repo root. Tell Claude Code: *"Read both design docs in the repo root and treat them as authoritative. Ask before deviating."*

---

## Phase 0 — Bootstrap

### Prompt 0.1 — Project skeleton

```
Set up a new Vite + React + TypeScript project with Tailwind CSS. Match the project structure exactly as defined in /docs/02_TECHNICAL_ARCHITECTURE.md section 2 — create every directory and a placeholder index.ts/tsx in each. Add a .gitignore, README with a one-paragraph project description (read the design doc for tone), and scaffold the empty content pack folder for Curse of Strudel with the manifest.json file shown in the architecture doc.

No game logic yet. Just structure. When done, run a build to confirm the project compiles.
```

---

## Phase 1 — Engine first (no UI)

The engine should run headless before we build a single window. This makes everything testable.

### Prompt 1.1 — State + reducer

```
Implement /src/engine/state.ts and /src/engine/actions.ts based on the GameState type in section 3 of the technical architecture doc. Create a strict TypeScript reducer with discriminated-union actions. Cover at minimum:

- INIT_NEW_CAMPAIGN(slot, dmName, pronouns, campaignId)
- ADVANCE_DAY  (advances meta.day, refills energy, drains burnout/hype as appropriate)
- SPEND_ENERGY(amount)
- POST_CHAT_MESSAGE(channelId, content, authorIsPlayer: boolean)
- ADD_NOTE_DOCUMENT(doc)
- UPDATE_TONE(vector_delta)
- ADD_PENDING_EVENT(event)
- RESOLVE_EVENT(eventId)
- COMPLETE_CHARACTER_CREATION(characterId, sheet)

Write Vitest unit tests covering each action. State should be JSON-serializable and pure — no Date.now() inside the reducer (caller passes timestamps). Include a getInitialState() factory.
```

### Prompt 1.2 — Save system

```
Implement /src/save/schema.ts and /src/save/migrations.ts. Build a Save module that exposes:

- listSlots(): SlotMetadata[]
- loadSlot(n): GameState | null
- saveSlot(n, state): void  // debounced 500ms
- exportSlot(n): string  // JSON
- importSlot(n, json): void
- deleteSlot(n): void

Include a versioned migration system per architecture doc section 7. Initial schemaVersion is 1 — write migrations.ts as a registry keyed by version with a single no-op for v1. Add Vitest tests including a fake migration to prove the migration walker works.

Add quota detection: estimate save size on write, warn (console.warn for now, UI later) if > 2MB. Implement LRU eviction for the llmCache portion when nearing quota.
```

### Prompt 1.3 — Tone Drift + Energy

```
Implement /src/engine/tone.ts and /src/engine/energy.ts.

tone.ts exposes:
- applyDialogueTags(state, tags: Partial<ToneVector>): ToneVector
- applyFreeTextHeuristic(state, text: string): ToneVector  // keyword/sentiment based, see below
- decayPerDay(state): ToneVector
- toneSummaryForPrompt(state): string  // ~30 token English summary for LLM prompts

For applyFreeTextHeuristic in v1: a simple keyword bag + sentiment regex. Build a small word list per tone axis (dark, earnest, horny, cruel, sarcastic, paternal). Keep in /src/engine/tone-config.ts so we can tune without code changes. NO llm call here; this runs locally.

energy.ts exposes:
- maxEnergyForDay(state): number  // 4 baseline, -1 if burnout > 70, +1 if hype > 80
- canSpend(state, amount): boolean
- daySleepStatChanges(state): partial stat deltas to apply on ADVANCE_DAY

Unit-test both modules.
```

### Prompt 1.4 — Event system

```
Implement /src/engine/events.ts. The event system queues and resolves GameEvents as defined in the state shape.

Expose:
- onMorning(state): GameEvent[]  // returns events that should fire this morning
- onEvening(state): GameEvent[]
- triggerScheduledEvents(state, day): GameEvent[]
- generateOvernightEvents(state): GameEvent[]  // procedural: chance of late-night DM, splinter formation, reschedule, etc

Procedural rules in v1 (no LLM yet — those come in Phase 3):
- Each player has a per-day chance to send a late-night DM proportional to (engagement * disruption * 0.01)
- A splinter chat formation roll fires when groupCohesion drops below a threshold
- Reschedule requests happen on a poisson-ish curve as session date approaches

Define every probability constant in /src/engine/events-config.ts so it's tuneable. Unit-test with seeded RNG.
```

### Phase 1 checkpoint

After 1.4: there is no UI yet but the engine runs end-to-end. Write a smoke test that runs a 30-day simulation with random inputs and asserts the state stays valid.

```
Write /src/engine/__tests__/simulation.test.ts that runs a 30-day headless simulation with seeded RNG. Each "day" picks 3 random valid actions, advances the day, and asserts that GameState remains valid (no NaN stats, no orphan events, save round-trips through JSON.stringify). Print a summary at the end: final stats, event counts, tone drift.
```

---

## Phase 2 — Faux-OS shell + first apps

### Prompt 2.1 — Desktop shell

```
Build /src/os/Desktop.tsx — the main shell. It should render:
- A wallpaper (start with a flat color tinted by burnout — use stats.burnout to lerp the wallpaper hue toward a bleaker color)
- A taskbar at the bottom with a clock (showing the in-game day, NOT real time), an app launcher, and a tray with notification badges per app
- A windowing system: each app opens in a draggable, resizable window with a titlebar (close, minimize, maximize)
- Z-order management for stacked windows

Use Tailwind. Use plain React state for window positions (no library). Pixel-art aesthetic — 16-bit-ish, low-saturation palette. Reference the architecture doc section 8 for sprite sizing.

The taskbar must read directly from GameState. Wire up a GameStateContext at App.tsx that reads from localStorage on mount via the Save module.
```

### Prompt 2.2 — Slot picker / new game flow

```
Build the entry screen at /src/os/SlotPicker.tsx. Three save slots, each showing: campaign name, day count, dmName, last played. "New Campaign" on an empty slot kicks off the new-game flow:

1. Splash with the game title.
2. DM name + pronoun input.
3. Campaign select — for v1 only Curse of Strudel is selectable; show two greyed-out "coming soon" tiles for Tomb of Implications and Stormwreck Island Starter Set so the modular architecture is visible to the player.
4. Drop into the desktop with the opening hook from the campaign manifest displayed as a pop-up note.

This flow dispatches INIT_NEW_CAMPAIGN with the right params and saves to the chosen slot.
```

### Prompt 2.3 — Discord-like (chat app)

```
Build /src/apps/chat/. Match Discord's general layout:
- Left sidebar: server icon at top (the campaign), channel list (group chat #general at top, splinter chats indented below as they form, DMs section beneath that)
- Main pane: message thread with avatars and timestamps
- Bottom: text input

Messages are PlayerCharacter instances posting (with avatar + archetype-flavored typing indicator) or the player (DM) posting. Read all messages from state.chat.channels. Posting a message dispatches POST_CHAT_MESSAGE.

For v1 wire up to the procedural event system from Phase 1.4 — splinter chats appear in the sidebar when a splinter-form event fires. NPC messages on schedule come from canned content in /src/content/campaigns/curse-of-strudel/canned-chat.json (create that file with ~30 placeholder messages tagged by archetype/situation). LLM hookup comes in Phase 3.

Critical: when the player views a splinter chat they aren't in, show a subtle "you shouldn't be reading this" UI cue (cursor change, slight desaturation). If the player acts on splinter info elsewhere, dispatch a small Cohesion penalty (mechanism TBD in 2.5).
```

### Prompt 2.4 — Calendar app + day advance

```
Build /src/apps/calendar/. A monthly calendar view showing:
- Current in-game day highlighted
- The planned session date pinned and styled prominently
- Player availability blocks (each player has a presenceProbability — render rough availability bars)
- Reschedule events as red marks

Pair with an "End Day" button on the desktop (or in the taskbar tray) that dispatches ADVANCE_DAY, runs onEvening + generateOvernightEvents, transitions through a brief "going to sleep" overlay (~1.5s), and lands on a "Morning Briefing" modal that lists the events that fired overnight.
```

### Prompt 2.5 — Notes app

```
Build /src/apps/notes/. Apple Notes-like:
- Sidebar with document list grouped by folder (Campaign Bible, Player Notes, Lore, Encounters Drafts)
- Main pane: rich-ish text editor (start with plain textarea + line breaks, upgrade later)
- Save on blur — dispatches ADD_NOTE_DOCUMENT or UPDATE_NOTE_DOCUMENT

Each document on save runs through tone.applyFreeTextHeuristic and dispatches a UPDATE_TONE. This is the single most important hookup in the game — almost all Tone Drift in v1 will come through here.

Documents have a "read %" stat that's hidden in v1 and surfaces in the post-session recap (Phase 4). Hide for now but track it.
```

### Phase 2 checkpoint

The desktop is real. You can open chat, calendar, notes. Days advance. Procedural events fire. NPCs post canned messages. Tone Drift moves when you write notes.

---

## Phase 3 — LLM integration

### Prompt 3.1 — Server proxy

```
Build /server/ as a Cloudflare Worker (or Node Express equivalent — pick whichever based on the user's existing deploy setup).

Single endpoint: POST /api/llm
Body: { promptKey: string, params: object, gameStateDigest: object }

Maintain a server-side map of promptKey → { systemPrompt, model, schema, maxTokens }. Initial keys to support:
- 'roster-generation'
- 'npc-base-voice'
- 'chat-message-reactive'
- 'session-recap'
- 'splinter-chat-formation'

For each: write the system prompt referencing the design doc's tone pillars. Output is strict JSON validated against the schema; on validation failure retry once with a stricter instruction, then return a `fallback: true` response and let the client use canned content.

Implement rate limiting: 30 requests per hour per session token. Return 429 with a structured retryAfter when over limit.

Use the product-self-knowledge skill to confirm the current Anthropic model strings before hardcoding.
```

### Prompt 3.2 — Client LLM module

```
Build /src/llm/client.ts and /src/llm/cache.ts.

client.ts exposes:
- callLlm(promptKey, params, state): Promise<{ result, fallback: boolean, fromCache: boolean }>

Builds the gameStateDigest from state (compress it — see architecture doc section 5). Checks cache first (cache key = hash of {promptKey, params, digestSlice}). On cache hit return immediately. On miss POST to /api/llm. On 429 or fallback response, return the canned fallback for that promptKey from /src/llm/fallbacks/.

cache.ts persists into state.llmCache (so it survives reload) but also has an LRU layer in memory. Eviction triggered by save quota module from Phase 1.2.

Build /src/llm/fallbacks/ with canned content for every promptKey defined in the server proxy.
```

### Prompt 3.3 — Hook up roster generation

```
Wire roster generation into the new game flow from Prompt 2.2. After campaign selection and before dropping into the desktop:

1. Pick 4-5 archetypes weighted-randomly from /src/content/archetypes/archetypes.json (no duplicates).
2. Make a single batched LLM call with promptKey 'roster-generation', passing archetypes + campaign tone seed.
3. Server returns an array of { name, pronouns, speechPattern, quirk, spriteVariantHint } per archetype.
4. Hydrate PlayerCharacter records, assign sprite variants, save to state.roster.
5. Show a lovely loading state during the call ("the group chat is being created...").

If LLM fails / falls back: use a canned name table in /src/content/archetypes/canned-names.json and procedural quirks. Game must still work without LLM.
```

### Prompt 3.4 — Reactive chat + splinter formation

```
Replace the canned-message scheduler in /src/apps/chat/ with LLM-backed generation:

When a NPC needs to post (procedurally scheduled), call promptKey 'chat-message-reactive' with: speakerId, channelId, recent 10 messages, current Tone Drift summary. Response is { content, toneTags }. Apply toneTags as a small Tone Drift nudge on receive.

When a splinter-form event fires from events.ts: call promptKey 'splinter-chat-formation' with: founder, target-of-frustration, included-participants, recent group-chat digest. Response is { channelName, openingMessages: ChatMessage[] (3-5 messages backfilled), reason }. Create the new channel in state.chat.channels with these messages already populated.

Cache aggressively: same channel + same recent digest + same tone = cache hit.
```

### Prompt 3.5 — Free-text input handling for NPC dialogue authoring

```
Add an "NPC Dialogue Authoring" feature to the Notes app: a special document type where the player writes what an NPC says in a future scene. On save, store as a NoteDocument with kind='npc-dialogue', linked to an NPC, plus apply a Tone Drift update from the heuristic.

This artifact will be referenced later by the session recap prompt — when the player has authored dialogue for an NPC the players engage with, that text goes into the recap prompt and the LLM is instructed to weave it (or pointedly ignore it, per design pillar) into the highlight reel.

For now just store and tag — the recap consumption happens in Phase 4.
```

---

## Phase 4 — The pre-session arc, the session, the credits

### Prompt 4.1 — Character creation opening sequence

```
Implement the opening character-creation flow as described in design doc section 4 ("Character creation as opening"). After the new game flow (Prompt 2.2) lands the player on the desktop, but before the campaign actually begins, the player progresses through ~4-6 days of character creation interactions.

Each roster member triggers one or more chat-based interactions for char creation appropriate to their archetype:
- Newbie: long DM thread where you're filling out their sheet for them, multiple turns
- Main Character: a single DM with a wall-of-text backstory; a Notes-app prompt to "read it"
- Optimizer: a short DM with a multiclass build + a rules question you can't easily answer
- Rules Lawyer: 3-message litigation about a feat
- Roleplayer: half-finished sheet, wants to talk about their character's ex
- Ghost / Quiet One: nothing — but a check-in nudge is a player action that costs energy

Each interaction has 2-4 dialogue choices with hidden tone tags. On completion, dispatch COMPLETE_CHARACTER_CREATION with a generated PcSheet. When all characters are complete, transition meta.phase from 'character-creation' to 'campaign-select' (already done) → 'scheduling'.

Use LLM ('chat-message-reactive') for NPC turn responses; canned fallbacks for v1.
```

### Prompt 4.2 — Scheduling minigame

```
Implement the scheduling phase. In the calendar app, surface a "Doodle poll" — a grid of date/time slots × players, where each player marks availability. Players "fill in" their availability over 1-3 days based on archetype tendencies (the Ghost takes the longest, the Main Character marks all slots and adds notes). The player picks a slot.

The catch: every slot has at least one mild downside ("Brad's slot breaks Sarah's Tuesday game"; "Jeff says yes but his presenceProbability silently drops"). Reveal these in flavor text, never in numbers.

Picking a slot transitions meta.phase to 'prep' and pins meta.sessionDate to a day index ~5-12 days out.
```

### Prompt 4.3 — Encounter Builder app

```
Build /src/apps/encounter-builder/. The most "real tool" in the game — should feel almost legitimate, then reveal its own pointlessness.

Layout:
- Top: encounter name + party size/level (from PC sheets) + computed CR display
- Center: a grid (Roll20-ish) where you drag monster tokens
- Right: monster palette (drag-drop sources). Pull from /src/content/campaigns/curse-of-strudel/encounters.json
- Bottom: hidden "fun" stat that wars with "balanced" — display as a vibes meter ("This feels...")

Saving an encounter creates an EncounterInstance in state.campaign.encounters and adds Prep Depth. The fun-vs-balanced tension means optimizing for CR drains fun, and vice versa — surface this in flavor only.
```

### Prompt 4.4 — Session highlight reel + credits

```
Implement the session itself when the player reaches meta.sessionDate.

Trigger: on ADVANCE_DAY into meta.sessionDate, transition phase to 'session', open a fullscreen non-desktop scene.

Build /src/scenes/Session.tsx:
1. A "loading the session" pre-game screen (rolling dice animation, ~3s).
2. Call promptKey 'session-recap' with a digest containing: roster present (factor in presenceProbability), prep artifacts (notes, encounters, npc dialogue authored), Tone Drift, campaign context. Server returns 3-4 highlight moments + an "engaged/ignored" tag for each prep artifact referenced.
3. Render the highlight reel as illustrated panels with text crawl and the LLM's narration. Use placeholder pixel art for v1; proper cutscene art is a polish pass.
4. After the reel, render the "deflated prep" view: Notes documents shown with crossed-out text where ignored, highlighted where engaged. The BBEG monologue you wrote last week is shown crossed out.
5. Transition to credits.

Build /src/scenes/Credits.tsx — design doc section 9. The DM screen drops, the five player portraits appear in soft light, one says "So… we begin." Credits scroll over a quiet desktop ambient loop. Set meta.creditsRolled = true.

After credits: return to the desktop, advance to the morning after Session 1, transition phase to 'post-credits'. Post-credits content is v2 — for v1 just return to free-play with no scripted events, the player can keep advancing days and managing the group, but no scripted progression.
```

---

## Phase 5 — Polish

### Prompt 5.1 — Pixel art pass

```
Generate the v1 art set:
- 10 archetype portraits (32x32, palette-swappable)
- 10 archetype chat avatars (16x16)
- Curse of Strudel splash + 6 location stills (256x144)
- 3-5 cutscene panels for the credits sequence
- Wallpaper variants for burnout states (low / mid / high)

Hand-crafted preferred. If using AI generation, run through a paletteizer to enforce the project's tight palette. All pixel art rendered with image-rendering: pixelated.
```

### Prompt 5.2 — Audio + ambient

```
Add a minimal audio layer:
- Curated 4-track playlist of CC-licensed/public-domain ambient music for the in-game music app
- UI sounds: window open/close, message receive, day-advance whoosh, dice roll
- Credits sequence audio cue

All audio files in /src/assets/audio/. Lazy-loaded on first use.
```

### Prompt 5.3 — Burnout UI degradation

```
Implement the visual degradation that mirrors Burnout. As stats.burnout climbs:
- Wallpaper desaturates and shifts cooler
- Window chrome gets slightly more cluttered (more notification dots, unread counts climb)
- Browser app: more open tabs accumulate (canned tabs about D&D advice, hobby forums, etc.)
- Email inbox unread count climbs faster
- A subtle vignette appears on the desktop edges

All driven by stats.burnout via Tailwind classes / CSS variables on the desktop root. No new mechanics — purely visual tone.
```

### Prompt 5.4 — Quality pass + bugs

```
Final pass:
- Run the 30-day simulation test from Phase 1 checkpoint and fix any issues.
- Manually playtest from new-game to credits, twice with different tone drifts. Note where it drags or feels off.
- Fix the 5-10 most pressing issues.
- Add a settings panel: volume, save export/import, "reset save" with confirmation.
- Add an "about" page in the in-game browser referencing the credits, license, etc.
- Production build, deploy.
```

---

## Notes on working with Claude Code on this

- **Always feed both design docs as context.** Tone is the hardest thing to maintain across many sessions; the docs anchor it.
- **Resist scope creep.** If Claude Code wants to add a feature not in the docs, push back or update the docs first.
- **Playtest after every phase.** This is a vibe game. Numbers tell you almost nothing; how it *feels* is the whole product.
- **The LLM proxy is the single biggest unknown cost.** Get rate limiting and caching right early. Test with the proxy fully off — if the game isn't fun without LLM, the LLM is a crutch.
- **Don't build post-credits content in v1.** Resist. It's the most exciting part to design and the most dangerous part to build first. Ship credits first, then expand.
