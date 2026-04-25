export type AppId =
  | 'chat'
  | 'calendar'
  | 'notes'
  | 'encounter-builder'
  | 'email'
  | 'browser'
  | 'music';

export interface AppDef {
  id: AppId;
  title: string;
  icon: string; // emoji or short label for stub icon
  badge?: number; // unread / notification count
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  // saved size/position when maximizing
  prev?: { x: number; y: number; w: number; h: number };
}
