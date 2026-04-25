import { useState } from 'react';

interface Doc {
  id: string;
  folder: 'Bible' | 'Lore' | 'Encounters' | 'Player Notes';
  title: string;
  body: string;
}

const DOCS: Doc[] = [
  {
    id: 'd1',
    folder: 'Bible',
    title: 'Setting Bible — Barovino',
    body: `Barovino is a small village under permanent twilight. The mists do not lift.\n\nThe villagers speak of a curse, but only obliquely, like one might speak of a relative who got into a pyramid scheme.\n\nThe Castle Ravenstollen sits on the hill above the village. Smoke rises from one of its chimneys, but it never seems to be the same chimney twice.\n\n— central tension: the strudel famine —`,
  },
  {
    id: 'd2',
    folder: 'Bible',
    title: 'Count Strahdel',
    body: `BBEG. Vampire. Connoisseur of pastries.\n\nMotive: he has tasted the Perfect Strudel only once, in his mortal life, and has spent four centuries trying to recreate it.\n\nVoice: tired, polite, oddly apologetic.\n\nWritten dialogue (will not be used in session, probably):\n"You must understand, my dear adventurer — it is not the blood I crave. It is the flake."`,
  },
  {
    id: 'd3',
    folder: 'Lore',
    title: 'House Ravenstollen — family tree',
    body: 'Six generations. Three pastry chefs. One unsolved disappearance involving butter.\n\n(this will probably never come up.)',
  },
  {
    id: 'd4',
    folder: 'Encounters',
    title: 'Wolves in the bakery — draft 3',
    body: 'CR ~2. Three dire wolves and a slightly possessed sourdough starter.\n\nIntended fun: low. Players will probably bypass with diplomacy. Or stealing the starter.',
  },
  {
    id: 'd5',
    folder: 'Player Notes',
    title: "Sarah's character — what i remember",
    body: 'Half-elf cleric. Mother is a baker. Father unknown but "implied to be a god of some kind" (sarah dm 2024-11-15).\n\nThree reasons to hate vampires: 1) the obvious one, 2) something with her aunt, 3) lactose-related.',
  },
  {
    id: 'd6',
    folder: 'Player Notes',
    title: "Brad's homebrew — DO NOT ALLOW",
    body: 'Hexblade/Bladesinger multiclass with a custom feat that effectively gives extra attack at level 3. He insists this is "balanced for a tier-1 game".\n\nDo not allow. Do not allow. Do not allow.',
  },
];

const FOLDERS: Doc['folder'][] = ['Bible', 'Lore', 'Encounters', 'Player Notes'];

export function NotesApp() {
  const [activeId, setActiveId] = useState<string>('d1');
  const [body, setBody] = useState<string>(DOCS.find((d) => d.id === activeId)!.body);

  function pick(id: string) {
    setActiveId(id);
    setBody(DOCS.find((d) => d.id === id)!.body);
  }

  const active = DOCS.find((d) => d.id === activeId)!;

  return (
    <div className="flex h-full text-ink">
      <div className="w-56 border-r-2 border-black/40 bg-bg-windowDark/50 flex flex-col">
        <div className="px-3 py-2 border-b-2 border-black/40 font-pixel text-[10px] text-ink">Notes</div>
        <div className="flex-1 overflow-auto no-scrollbar">
          {FOLDERS.map((f) => (
            <div key={f} className="mb-2">
              <div className="px-3 pt-2 pb-1 font-pixel text-[8px] text-ink-muted">{f.toUpperCase()}</div>
              {DOCS.filter((d) => d.folder === f).map((d) => (
                <button
                  key={d.id}
                  onClick={() => pick(d.id)}
                  className={`w-full text-left px-3 py-1 font-mono text-base ${
                    d.id === activeId ? 'bg-accent-dust text-ink' : 'text-ink-muted hover:bg-bg-windowDark'
                  }`}
                >
                  {d.title}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="px-3 py-2 border-t-2 border-black/40 font-mono text-sm text-ink-muted">
          {DOCS.length} documents
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b-2 border-black/40 bg-bg-window px-4 py-2 flex items-center justify-between">
          <div>
            <div className="font-pixel text-[10px] text-ink">{active.title}</div>
            <div className="font-mono text-sm text-ink-muted">{active.folder}</div>
          </div>
          <div className="font-mono text-sm text-ink-dim italic">unsaved · tone drift listening…</div>
        </div>
        <textarea
          className="flex-1 bg-bg-window text-ink font-mono text-base leading-relaxed p-5 outline-none resize-none border-0"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
