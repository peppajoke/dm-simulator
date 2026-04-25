import { useState } from 'react';
import { SlotPicker } from './os/SlotPicker';
import { Desktop } from './os/Desktop';
import manifest from './content/campaigns/curse-of-strudel/manifest.json';
import { saveSlot, loadSlot } from './save/schema';

interface ActiveSession {
  slot: 0 | 1 | 2;
  dmName: string;
  pronouns: string;
  campaignId: string;
  campaignTitle: string;
  day: number;
}

function App() {
  const [session, setSession] = useState<ActiveSession | null>(null);

  function handleEnter(slot: 0 | 1 | 2, dmName: string, pronouns: string, campaignId: string, campaignTitle: string) {
    const existing = loadSlot(slot);
    setSession({
      slot,
      dmName,
      pronouns,
      campaignId,
      campaignTitle,
      day: existing?.day ?? 1,
    });
  }

  function advanceDay() {
    if (!session) return;
    const nextDay = session.day + 1;
    setSession({ ...session, day: nextDay });
    const existing = loadSlot(session.slot);
    if (existing) {
      saveSlot(session.slot, { ...existing, day: nextDay, lastPlayedAt: Date.now() });
    }
  }

  if (!session) {
    return <SlotPicker onEnter={handleEnter} />;
  }

  return (
    <Desktop
      dmName={session.dmName}
      campaignTitle={session.campaignTitle}
      openingHook={manifest.openingHook}
      day={session.day}
      onAdvanceDay={advanceDay}
    />
  );
}

export default App;
