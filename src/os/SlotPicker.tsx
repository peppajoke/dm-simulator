import { useState } from 'react';
import { listSlots, saveSlot, deleteSlot, type SlotMetadata, SCHEMA_VERSION } from '../save/schema';
import manifest from '../content/campaigns/curse-of-strudel/manifest.json';

interface Props {
  onEnter: (slot: 0 | 1 | 2, dmName: string, pronouns: string, campaignId: string, campaignTitle: string) => void;
}

type Step = 'slots' | 'splash' | 'name' | 'campaign';

const CAMPAIGNS = [
  { id: 'curse-of-strudel', title: manifest.title, blurb: manifest.blurb, available: true },
  {
    id: 'tomb-of-implications',
    title: 'Tomb of Implications',
    blurb: 'Every door is a metaphor. Every trap is unstated. Coming soon.',
    available: false,
  },
  {
    id: 'stormwreck-island',
    title: 'Stormwreck Island Starter Set',
    blurb: 'A bag of holding full of beginner mistakes. Coming soon.',
    available: false,
  },
];

export function SlotPicker({ onEnter }: Props) {
  const [slots, setSlots] = useState<SlotMetadata[]>(() => listSlots());
  const [step, setStep] = useState<Step>('slots');
  const [picked, setPicked] = useState<0 | 1 | 2 | null>(null);
  const [dmName, setDmName] = useState('');
  const [pronouns, setPronouns] = useState('they/them');

  function refresh() {
    setSlots(listSlots());
  }

  function continueExisting(slot: SlotMetadata) {
    if (slot.empty) return;
    onEnter(slot.slot, slot.dmName ?? 'DM', 'they/them', 'curse-of-strudel', slot.campaignTitle ?? manifest.title);
  }

  function startNew(slot: 0 | 1 | 2) {
    setPicked(slot);
    setStep('splash');
  }

  function handleErase(slot: 0 | 1 | 2) {
    if (!confirm(`Erase save slot ${slot + 1}? This cannot be undone.`)) return;
    deleteSlot(slot);
    refresh();
  }

  function commitNewGame(campaignId: string, campaignTitle: string) {
    if (picked === null) return;
    const now = Date.now();
    saveSlot(picked, {
      schemaVersion: SCHEMA_VERSION,
      slot: picked,
      dmName: dmName || 'New DM',
      pronouns,
      campaignId,
      campaignTitle,
      day: 1,
      createdAt: now,
      lastPlayedAt: now,
    });
    onEnter(picked, dmName || 'New DM', pronouns, campaignId, campaignTitle);
  }

  return (
    <div className="absolute inset-0 bg-bg-deskDark flex items-center justify-center crt-flicker">
      {/* faux scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.4) 2px 3px)',
        }}
      />
      <div className="relative z-10 w-[760px] max-w-full px-6">
        {step === 'slots' && (
          <>
            <h1 className="font-pixel text-accent-dust text-xl tracking-widest text-center mb-2">DM SIMULATOR</h1>
            <p className="text-bg-window/60 font-mono text-center mb-8">
              you never get to play. <span className="text-accent-rust">choose a slot.</span>
            </p>
            <div className="grid grid-cols-1 gap-3">
              {slots.map((s) => (
                <SlotRow
                  key={s.slot}
                  slot={s}
                  onContinue={() => continueExisting(s)}
                  onNew={() => startNew(s.slot)}
                  onErase={() => handleErase(s.slot)}
                />
              ))}
            </div>
            <div className="mt-8 text-center text-bg-window/40 font-mono text-sm">
              prototype build · v0.1 · paper towels not included
            </div>
          </>
        )}

        {step === 'splash' && (
          <div className="bg-bg-window border-2 border-black/70 shadow-window p-8 text-center">
            <h1 className="font-pixel text-xl text-ink tracking-widest mb-4">DM SIMULATOR</h1>
            <p className="font-mono text-base text-ink-muted mb-8 italic">
              "It's been a while since the group played. Maybe it's time."
            </p>
            <button
              className="bg-accent-plum text-bg-window px-6 py-3 border-2 border-black/60 font-pixel text-[10px] tracking-widest hover:bg-purple-700"
              onClick={() => setStep('name')}
            >
              roll initiative
            </button>
          </div>
        )}

        {step === 'name' && (
          <div className="bg-bg-window border-2 border-black/70 shadow-window p-8">
            <h2 className="font-pixel text-sm text-ink mb-6">who are you, behind the screen?</h2>
            <div className="space-y-4">
              <label className="block">
                <div className="font-pixel text-[9px] text-ink-muted mb-1">DM NAME</div>
                <input
                  autoFocus
                  className="w-full bg-bg-windowDark/30 border-2 border-black/60 px-3 py-2 font-mono text-lg text-ink"
                  placeholder="e.g. Alex"
                  value={dmName}
                  onChange={(e) => setDmName(e.target.value)}
                />
              </label>
              <label className="block">
                <div className="font-pixel text-[9px] text-ink-muted mb-1">PRONOUNS</div>
                <input
                  className="w-full bg-bg-windowDark/30 border-2 border-black/60 px-3 py-2 font-mono text-lg text-ink"
                  placeholder="they/them"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                />
              </label>
            </div>
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep('slots')}
                className="px-4 py-2 border-2 border-black/60 font-pixel text-[9px] text-ink hover:bg-bg-windowDark/40"
              >
                ← back
              </button>
              <button
                onClick={() => setStep('campaign')}
                disabled={!dmName.trim()}
                className="bg-accent-plum disabled:bg-ink-dim disabled:cursor-not-allowed text-bg-window px-6 py-2 border-2 border-black/60 font-pixel text-[9px] hover:bg-purple-700"
              >
                next →
              </button>
            </div>
          </div>
        )}

        {step === 'campaign' && (
          <div className="bg-bg-window border-2 border-black/70 shadow-window p-8">
            <h2 className="font-pixel text-sm text-ink mb-1">choose a campaign</h2>
            <p className="font-mono text-base text-ink-muted mb-6">
              the players don't actually care which one you pick.
            </p>
            <div className="space-y-3">
              {CAMPAIGNS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => c.available && commitNewGame(c.id, c.title)}
                  disabled={!c.available}
                  className={`w-full text-left p-4 border-2 ${
                    c.available
                      ? 'border-accent-plum bg-bg-windowDark/30 hover:bg-accent-plum/20 cursor-pointer'
                      : 'border-black/30 bg-black/10 cursor-not-allowed opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-pixel text-[10px] text-ink">{c.title}</div>
                    {!c.available && <div className="font-pixel text-[8px] text-ink-muted">COMING SOON</div>}
                  </div>
                  <div className="font-mono text-sm text-ink-muted mt-2">{c.blurb}</div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep('name')}
                className="px-4 py-2 border-2 border-black/60 font-pixel text-[9px] text-ink hover:bg-bg-windowDark/40"
              >
                ← back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SlotRow({
  slot,
  onContinue,
  onNew,
  onErase,
}: {
  slot: SlotMetadata;
  onContinue: () => void;
  onNew: () => void;
  onErase: () => void;
}) {
  return (
    <div className="bg-bg-window border-2 border-black/70 shadow-window flex">
      <div className="w-12 bg-accent-slate text-bg-window flex items-center justify-center font-pixel text-sm border-r-2 border-black/60">
        {slot.slot + 1}
      </div>
      <div className="flex-1 p-3 flex items-center justify-between">
        {slot.empty ? (
          <>
            <div>
              <div className="font-pixel text-[10px] text-ink-muted">— EMPTY SLOT —</div>
              <div className="font-mono text-sm text-ink-dim">never been here</div>
            </div>
            <button
              onClick={onNew}
              className="bg-accent-plum text-bg-window px-4 py-2 border-2 border-black/60 font-pixel text-[9px] hover:bg-purple-700"
            >
              new campaign
            </button>
          </>
        ) : (
          <>
            <div>
              <div className="font-pixel text-[10px] text-ink">{slot.dmName}</div>
              <div className="font-mono text-sm text-ink-muted">
                {slot.campaignTitle} · day {slot.day}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onErase}
                className="bg-accent-rust text-bg-window px-3 py-2 border-2 border-black/60 font-pixel text-[9px] hover:bg-red-700"
              >
                erase
              </button>
              <button
                onClick={onContinue}
                className="bg-accent-moss text-ink px-4 py-2 border-2 border-black/60 font-pixel text-[9px] hover:bg-green-300"
              >
                continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
