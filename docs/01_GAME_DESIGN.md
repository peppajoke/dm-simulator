# DM Simulator — Game Design Document

**Working title:** *DM Simulator* (placeholder — see naming notes at end)
**Logline:** A satirical browser game where you play a Dungeon Master who never gets to play. Every system real DMs sweat over — encounter balance, NPC voices, scheduling, group drama — is the game. Roll credits the moment your first session begins.

---

## 1. Pillars

1. **The fantasy is always one step away.** Every system promises play and delivers prep.
2. **The group is the world.** The five real people you're herding matter more than any NPC.
3. **Tone follows the player.** What you write, how you treat your players, what you click — the game watches and adjusts.
4. **Time is the antagonist.** Not monsters. Not stats. The session date approaches and you are not ready.

---

## 2. Core Loop

```
MORNING BRIEFING  →  DESKTOP (limited "energy" actions)  →  EVENING WIND-DOWN  →  SLEEP (advance day)
```

- **Energy:** 3–5 actions per day. Forces triage — write the BBEG monologue or answer Brad's homebrew DM?
- **Days advance only when the player sleeps.** Time is fully under player control. There is no real-world clock pressure, only narrative pressure (the session date on the calendar).
- **Each day surfaces overnight events at the morning briefing:** new messages, splinter chats forming, calendar updates, late-night posts in Reddit-likes.

### Macro arc to credits
1. **Onboarding (Days 1–4):** Players agree to play. Character creation across the spectrum — a player who needs full handholding, a player who hands you a 3000-word backstory, a player trying to slip in homebrew, an experienced player who needs nothing, a player who hasn't replied yet.
2. **Campaign selection (Day 4–5):** Choose the campaign (v1: only *Curse of Strudel*).
3. **Scheduling (Days 5–8):** Doodle-poll-likes. The slot exists but Brad picked the one that breaks everything.
4. **Prep death-march (Days 8–N):** Days slip. People reschedule. Splinter chats appear. You write content that will never be seen.
5. **Session 0 / Session 1:** It happens. Credits roll.

### Post-credits (v2 scope — design now, build later)
The *real* game. Long-tail campaign management. Sessions become rare. Players drift. The campaign limps toward an ending that may never come. Designed to be open-ended and meaningfully bittersweet.

---

## 3. Stat Model

Hidden stats. Surfaced through narrative cues, never numbers (except in dev/debug overlay).

| Stat | What it tracks | High effects | Low effects |
|---|---|---|---|
| **Prep Depth** | Total prep content created across encounters/lore/NPCs | Confidence in messaging, players reference your work | NPCs feel flat in recap, players freelance |
| **Group Cohesion** | How players feel about each other and the table | Group chat is fun, fewer splinter chats | Splinter chats multiply, passive-aggressive messages |
| **Burnout** | DM mental state | UI stays bright, options stay generous | UI darkens, fewer dialogue options, internal monologue gets nastier |
| **Hype** | Players' anticipation for next session | Players post fan art, ask great questions | Last-minute cancels, "is this still happening?" |
| **Tone Drift** | Hidden meta-stat: how dark/earnest/horny/bleak the player has steered things | Feeds the LLM's tone for all generated content | (no UI surface — tone is the surface) |

**Tone Drift is the secret sauce.** Tracks signals like:
- Word choice in player-authored text (sentiment + theme classifiers)
- Which dialogue options were picked (each has hidden tone tags: cruel, earnest, horny, sarcastic, paternal, dismissive, etc.)
- How the player handled key drama beats
- Total time spent on each app type (lore vs. encounter vs. social)

The LLM gets a compressed Tone Drift summary in every prompt and mirrors it. Player goes dark → game goes dark. Player stays earnest → NPCs respond earnestly.

---

## 4. The Cast — Player Archetypes

Each archetype = stat block + behavior tendencies + LLM personality seed (generated once per campaign, cached).

| Archetype | Engagement | Disruption | Cohesion contribution | Signature behaviors |
|---|---|---|---|---|
| **Rules Lawyer** | High | High | Mid | 1am DMs about flanking; cites errata; politely corrects you in front of the group |
| **Main Character** | High | High | Low | Sends 12-page backstories; expects every plot to revolve around them |
| **The Ghost** | Variable | Low | Low | Cancels often; when present, is genuinely incredible |
| **The Murderhobo** | High | Very High | Mid | Solves every problem with violence; gleefully derails plot hooks |
| **The Newbie** | Very High | Mid | High | Asks "what's a d20" in session 4; over-apologizes; brings cookies |
| **The Roleplayer** | High | Mid | Mid | Wants romance subplots with every NPC, including the goblin |
| **The Optimizer** | High | Mid | Low | Multiclass nightmares; breaks every encounter math; emails you spreadsheets |
| **The Snack Bringer** | Low | Low | Very High | Doesn't engage with plot but everyone loves them |
| **The DM-in-Waiting** | High | High | Low | "Well in MY campaign…"; backseat DMs; sends you their homebrew unprompted |
| **The Quiet One** | Low | Low | Mid | Hard to read. Occasional brilliant moments. Roleplays through DMs only |

**Roster generation:**
- Start with 4–5 archetypes drawn weighted-randomly from the pool. No two-of-a-kind in the starting roster.
- Each gets an LLM-generated name, pronouns, sprite variant, speech pattern, and one quirk. Generated once at campaign start in a single batched LLM call. Cached for the whole save.
- Variable roster: ~once every 8–15 days, a roster event fires (a player ghosts out; a friend-of-a-friend wants to join; someone "needs to take a break").

### Character creation as opening

The opening sequence is a microcosm of the whole game. Each player makes their PC differently, and the player (you, the DM) handles them differently:

- **Newbie:** You're filling out the sheet for them. Long DM thread. They keep asking what each stat means.
- **Main Character:** They send you a finished sheet AND a 3000-word backstory. You must read it. They ask if a homebrew subclass is okay.
- **Optimizer:** Sends you a fully optimized multiclass build. Asks a rules clarification you don't know the answer to.
- **Rules Lawyer:** Their sheet is perfect but they want to litigate one feat with you for three messages.
- **Roleplayer:** Their sheet is half-done. They want to talk about their character's ex.
- **The Ghost / Quiet One:** Hasn't responded. Should you nudge them?

Each character creation produces a **PC sheet** (visible in the campaign bible) and updates Cohesion + Tone Drift based on how you handled it.

---

## 5. The Campaign — Curse of Strudel

A pastiche of *Curse of Strahd*. Gothic horror. Castle Ravenstollen looms over the village of Barovino. The vampire Count Strahdel craves only one thing: the perfect strudel. Every NPC has a tragic backstory involving baked goods. The mists never lift.

**Why this campaign as v1:**
- Strong, unmistakable tone — easy to parody and extend.
- Pre-built encounter pool, NPC roster, and lore entries ship in the content pack.
- Player archetypes interact with it differently in legible ways: Roleplayer wants to seduce Strahdel; Murderhobo wants to fight him in session 1; Optimizer wants to solo him with a Coffeelock build; Newbie keeps asking what a vampire is.

**Content pack structure** (for modularity — see technical doc):
- Setting bible (markdown, chunked for LLM context)
- 12–18 encounter templates with CR + intended-fun stats
- 8–12 named NPCs with portraits and personality seeds
- 6–10 location entries with art
- A handful of "pre-written prep moments" the player will discover (a published module's railroad they will inevitably go off)

---

## 6. The Faux-OS

Single-screen desktop. Apps are windows. Everything diegetic.

### Core apps (v1)

| App | Role | Notes |
|---|---|---|
| **Discord-like** | Group chat, splinter chats, DMs, voice channels you never use | Central social hub. Most plot beats land here. |
| **Email** | Patreon, Kickstarter, WotC marketing, "is this still happening?" | Comic relief + occasional plot |
| **Browser** | D&D Beyond stand-in, Reddit r/DMAcademy doomscroll, "research" | Time sink. Costs energy if you let yourself doomscroll. |
| **Notes app** | Campaign bible. Player-written lore. NPC voices. | Where most free-text creative work lives |
| **Encounter Builder** | Drag monsters onto a grid. Visible CR. Hidden "fun" stat. | The closest the game ever gets to a "real" tool |
| **Calendar** | The death clock. Session date pinned. Players' availability ghosts. | Single most-checked app |
| **Music player** | Pick session ambiance | Atmospheric. Can affect Burnout. |
| **System tray** | Clock. Wallpaper. Subtly degrades with Burnout. | Mood ring. |

### App polish for v1
- Discord-like: full fidelity. Multiple channels. Splinter chats appear in the sidebar.
- Encounter Builder: full fidelity. Drag-drop, save encounters.
- Notes, Calendar, Email: high fidelity but smaller surface.
- Browser: scripted content (canned subreddit posts, canned D&D Beyond pages); no real web.
- Music: small curated playlist of public-domain/CC tracks; pick-and-play.

### Splinter chats

The killer feature. Group dynamics expressed as DM/sub-channel structure.

- Day 1: One group chat. Everyone in.
- Some days in: An event triggers a splinter (Brad annoyed at Sarah's character → Brad starts a "no Sarah" DM with two others).
- The player sees all of them. The players don't know the player sees all of them.
- Splinter chats are generated/extended by the LLM, seeded by recent player actions and Tone Drift.

**Mechanic:** when you act on info you "shouldn't" have (mentioning something Brad said in his splinter chat), Cohesion takes a hit. The game never forces you. The temptation is the point.

---

## 7. Free-Text Input — Where the LLM Earns Its Keep

Free-text input is reserved for high-leverage moments. Each one feeds Tone Drift and is consumed by future LLM generations.

**Player writes, LLM responds:**
1. **NPC dialogue authoring** — write what an NPC says in a session. The LLM generates how players might react in the recap.
2. **Lore entries** — write worldbuilding into the Notes app. LLM ingests and references later. (Bonus: a "read %" stat per entry shows how much the players actually remembered, decaying over time.)
3. **Responses to player DMs** — when a player messages you with something requiring more than a button reply (homebrew request, real-life cancel, lore question), you type a response. The LLM generates the player's reply in voice.
4. **Group chat posts** — you can post in the group chat. LLM generates reactions.
5. **Session pitch / recaps** — you write what your players "would" experience.

**Token budgeting** (see technical doc): each free-text moment has a budget. Bulk operations (roster generation, splinter chat backfill, session recap) batch into single calls. Cache aggressively.

---

## 8. The Session — Highlight Reel

When a session actually happens, it's a **highlight reel**: 3–4 LLM-narrated moments, illustrated where possible, stitched together. Each moment is generated from:

- Player archetypes present (and absent — "we'll just have Jeff's character follow along quietly")
- Prep Depth in relevant categories (encounter / NPC / lore)
- Tone Drift
- Specific prep artifacts the player created (NPC dialogue, lore entries, encounter setups)

**The deflated-prep mechanic:** prep content is tagged with `engaged` / `ignored` after each session. Visibly crossed-out in the campaign bible afterwards. The BBEG monologue you wrote is shown crossed out. The 30-page Barovino history gets one line: "they didn't visit Barovino."

This is where the satire lands hardest. Make it funny first, sad second.

---

## 9. The Credits Moment

Triggers the moment Session 1 actually begins (after the highlight reel of the pre-game small talk).

**Direction:** Medium-budget cutscene. The desktop fades. The DM screen we've been hiding behind for the whole game is shown from the front for the first time. The five player portraits sit across from us in soft light. One of them says the line: "So… we begin." Cut to credits.

Credits scroll over a quiet desktop ambient loop. After the credits end, the desktop returns — but it's the morning after Session 1. Post-credits begins.

(Credits content can include real-feeling fake credits — "Catering by Nikko's Pizza," "Snacks by The Snack Bringer," etc. — for tone.)

---

## 10. Save System

- localStorage-only.
- Multi-slot saves (3 slots). Each slot is a campaign run.
- Auto-save on every meaningful state change (debounced).
- Manual export/import as JSON for backup and sharing.
- Save schema versioned for forward compatibility (migrations module).

---

## 11. Naming

*DM Simulator* is fine as a placeholder. Stronger candidates to consider:
- **Session Zero**
- **TPK (To Plan Kampaigns)**
- **Roll Initiative (Eventually)**
- **The DM Screen**
- **No Sessions** (in the *No Russian* sense — bleak, single-meaning)
- **Doodle Poll**

Recommend deciding before public reveal; *Session Zero* is the front-runner — it captures the entire premise in two words.

---

## 12. Out of scope for v1 (note them so we don't forget)

- Additional campaigns (Tomb of Implications, Stormwreck Island Starter Set)
- Post-credits long-tail content (designed in v2)
- Audio voice acting
- Achievements / Steam-style meta
- Mod support / user content packs
- Mobile-specific layout (browser-on-desktop only for v1)
- Player-character POV cutscenes (explicitly forbidden by design)
