import type { AppDef } from './types';

export const APPS: Record<string, AppDef> = {
  chat: {
    id: 'chat',
    title: 'Discord',
    icon: 'CHAT',
    badge: 7,
    defaultSize: { w: 880, h: 560 },
    minSize: { w: 560, h: 360 },
  },
  calendar: {
    id: 'calendar',
    title: 'Calendar',
    icon: 'CAL',
    defaultSize: { w: 720, h: 560 },
    minSize: { w: 480, h: 400 },
  },
  notes: {
    id: 'notes',
    title: 'Notes',
    icon: 'NOTE',
    badge: 2,
    defaultSize: { w: 760, h: 520 },
    minSize: { w: 520, h: 360 },
  },
  'encounter-builder': {
    id: 'encounter-builder',
    title: 'Encounter Builder',
    icon: 'ENC',
    defaultSize: { w: 820, h: 540 },
    minSize: { w: 600, h: 420 },
  },
  email: {
    id: 'email',
    title: 'Mail',
    icon: 'MAIL',
    badge: 14,
    defaultSize: { w: 720, h: 500 },
    minSize: { w: 480, h: 360 },
  },
  browser: {
    id: 'browser',
    title: 'Browser',
    icon: 'WEB',
    defaultSize: { w: 760, h: 520 },
    minSize: { w: 520, h: 360 },
  },
  music: {
    id: 'music',
    title: 'Music',
    icon: 'MUS',
    defaultSize: { w: 360, h: 240 },
    minSize: { w: 280, h: 200 },
  },
};

export const APP_LIST: AppDef[] = Object.values(APPS);
