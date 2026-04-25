import { useState } from 'react';

interface Token {
  id: string;
  cell: number;
  label: string;
  cr: number;
  color: string;
}

interface PaletteItem {
  label: string;
  cr: number;
  color: string;
}

const PALETTE: PaletteItem[] = [
  { label: 'Wolf', cr: 0.25, color: '#7a6a5a' },
  { label: 'Dire Wolf', cr: 1, color: '#5a4a3a' },
  { label: 'Strahdel', cr: 15, color: '#7a5a78' },
  { label: 'Vampire Spawn', cr: 5, color: '#a8674a' },
  { label: 'Goblin (the cute one)', cr: 0.25, color: '#6b8268' },
  { label: 'Strudel-Mimic', cr: 2, color: '#c8b890' },
];

const COLS = 14;
const ROWS = 9;

export function EncounterBuilderApp() {
  const [tokens, setTokens] = useState<Token[]>([
    { id: 't1', cell: 4 * COLS + 6, label: 'Wolf', cr: 0.25, color: '#7a6a5a' },
    { id: 't2', cell: 4 * COLS + 7, label: 'Wolf', cr: 0.25, color: '#7a6a5a' },
    { id: 't3', cell: 5 * COLS + 6, label: 'Dire Wolf', cr: 1, color: '#5a4a3a' },
  ]);
  const [name, setName] = useState('Wolves in the Bakery');
  const [draggingPalette, setDraggingPalette] = useState<PaletteItem | null>(null);

  const totalCR = tokens.reduce((s, t) => s + t.cr, 0);
  // toy "fun" — high when small and varied, low when stacked or one big monster
  const variety = new Set(tokens.map((t) => t.label)).size;
  const fun = Math.max(0, Math.min(100, 50 + variety * 12 - Math.abs(totalCR - 4) * 10));
  const balance = Math.max(0, Math.min(100, 100 - Math.abs(totalCR - 4) * 18));

  function dropOn(cell: number) {
    if (!draggingPalette) return;
    const id = `t${Date.now()}`;
    setTokens((prev) => [
      ...prev,
      { id, cell, label: draggingPalette.label, cr: draggingPalette.cr, color: draggingPalette.color },
    ]);
    setDraggingPalette(null);
  }

  function removeToken(id: string) {
    setTokens((prev) => prev.filter((t) => t.id !== id));
  }

  function vibesText() {
    if (fun > 75 && balance < 50) return 'this feels… fun. dangerously fun.';
    if (fun > 60) return 'this feels… spicy.';
    if (balance > 80) return 'this feels… correct. but no one will remember it.';
    return 'this feels… like prep.';
  }

  return (
    <div className="flex h-full text-ink">
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="px-3 py-2 border-b-2 border-black/40 bg-bg-windowDark/40 flex items-center gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-b border-black/40 px-1 font-pixel text-[10px] text-ink outline-none"
          />
          <div className="font-mono text-base text-ink-muted">party: 5 · level 3</div>
          <div className="ml-auto flex items-center gap-3 font-mono text-base">
            <Stat label="CR" value={totalCR.toFixed(2)} />
            <Stat label="balance" value={`${balance.toFixed(0)}%`} />
            <Stat label="fun" value={`${fun.toFixed(0)}%`} />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 p-3 bg-bg-window overflow-auto">
          <div
            className="inline-grid gap-0.5 bg-black/40 p-0.5"
            style={{ gridTemplateColumns: `repeat(${COLS}, 36px)` }}
          >
            {Array.from({ length: COLS * ROWS }, (_, i) => {
              const tok = tokens.find((t) => t.cell === i);
              return (
                <div
                  key={i}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dropOn(i)}
                  className="w-9 h-9 bg-bg-windowDark border border-black/30 relative"
                >
                  {tok && (
                    <button
                      onClick={() => removeToken(tok.id)}
                      title={`${tok.label} · CR ${tok.cr}`}
                      className="absolute inset-0 flex items-center justify-center font-pixel text-[8px] text-bg-window border border-black/60"
                      style={{ background: tok.color }}
                    >
                      {tok.label.slice(0, 2)}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: vibes */}
        <div className="border-t-2 border-black/40 bg-bg-windowDark/40 px-3 py-2 font-mono text-base text-ink italic">
          {vibesText()}
        </div>
      </div>

      {/* Palette */}
      <div className="w-52 border-l-2 border-black/40 bg-bg-windowDark/50 p-3 space-y-2">
        <div className="font-pixel text-[10px] text-ink mb-1">Monster palette</div>
        {PALETTE.map((p) => (
          <div
            key={p.label}
            draggable
            onDragStart={() => setDraggingPalette(p)}
            onDragEnd={() => setDraggingPalette(null)}
            className="flex items-center gap-2 px-2 py-1 border-2 border-black/60 bg-bg-window cursor-grab active:cursor-grabbing"
          >
            <div className="w-6 h-6 border border-black/60" style={{ background: p.color }} />
            <div className="flex-1">
              <div className="font-pixel text-[8px] text-ink">{p.label}</div>
              <div className="font-mono text-sm text-ink-muted">CR {p.cr}</div>
            </div>
          </div>
        ))}
        <div className="pt-2 mt-2 border-t-2 border-black/30 font-mono text-sm text-ink-muted">
          drag onto grid · click placed token to remove
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-end">
      <div className="font-pixel text-[7px] text-ink-muted">{label.toUpperCase()}</div>
      <div className="font-pixel text-[9px] text-ink">{value}</div>
    </div>
  );
}
