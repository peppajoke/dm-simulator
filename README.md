# DM Simulator

A satirical browser game where you play a Dungeon Master who never gets to play.
Every system real DMs sweat over — encounter balance, NPC voices, scheduling,
group drama — is the game. Roll credits the moment your first session begins.

This repository is the **visual prototype**: a faux-OS desktop with stub apps,
a slot picker, and a new-campaign flow. No game engine, no LLM integration, no
save state beyond the slot record. The goal is to lock down the visual feel
before any real systems are wired up.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Pure React state (no state library yet)

## Run locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

The `vite.config.ts` defaults `base` to `/dm-simulator/` for GitHub Pages.
For local custom builds:

```bash
VITE_BASE=/ npm run build
```

## Project structure

See `docs/02_TECHNICAL_ARCHITECTURE.md` section 2 — folders are scaffolded to
match. Most of them currently hold placeholders only.

## Design docs

- `docs/01_GAME_DESIGN.md` — game design document
- `docs/02_TECHNICAL_ARCHITECTURE.md` — stack, state model, content packs
- `docs/03_CLAUDE_CODE_PROMPTS.md` — prompt sequence for further build phases

## Deploy

A GitHub Actions workflow deploys `main` to GitHub Pages on every push.
