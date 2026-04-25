// Save schema — full implementation in Phase 1.2.
// Prototype uses localStorage with a minimal slot record.
export const SCHEMA_VERSION = 1;

export interface SlotMetadata {
  slot: 0 | 1 | 2;
  empty: boolean;
  dmName?: string;
  campaignTitle?: string;
  day?: number;
  lastPlayedAt?: number;
}

export interface SlotSave {
  schemaVersion: number;
  slot: 0 | 1 | 2;
  dmName: string;
  pronouns: string;
  campaignId: string;
  campaignTitle: string;
  day: number;
  createdAt: number;
  lastPlayedAt: number;
}

const KEY = (slot: number) => `dmsim:save:slot:${slot}`;

export function loadSlot(slot: 0 | 1 | 2): SlotSave | null {
  try {
    const raw = localStorage.getItem(KEY(slot));
    if (!raw) return null;
    return JSON.parse(raw) as SlotSave;
  } catch {
    return null;
  }
}

export function saveSlot(slot: 0 | 1 | 2, data: SlotSave): void {
  localStorage.setItem(KEY(slot), JSON.stringify(data));
}

export function deleteSlot(slot: 0 | 1 | 2): void {
  localStorage.removeItem(KEY(slot));
}

export function listSlots(): SlotMetadata[] {
  return [0, 1, 2].map((s) => {
    const save = loadSlot(s as 0 | 1 | 2);
    if (!save) return { slot: s as 0 | 1 | 2, empty: true };
    return {
      slot: s as 0 | 1 | 2,
      empty: false,
      dmName: save.dmName,
      campaignTitle: save.campaignTitle,
      day: save.day,
      lastPlayedAt: save.lastPlayedAt,
    };
  });
}
