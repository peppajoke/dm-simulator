import { useCallback, useState } from 'react';
import { APP_LIST, APPS } from './apps-registry';
import { Taskbar } from './Taskbar';
import { Window } from './Window';
import type { AppId, WindowState } from './types';
import { ChatApp } from '../apps/chat/ChatApp';
import { CalendarApp } from '../apps/calendar/CalendarApp';
import { NotesApp } from '../apps/notes/NotesApp';
import { EncounterBuilderApp } from '../apps/encounter-builder/EncounterBuilderApp';
import { OpeningHookModal } from './OpeningHookModal';

interface Props {
  dmName: string;
  campaignTitle: string;
  openingHook: string;
  day: number;
  onAdvanceDay: () => void;
}

let nextZ = 10;
let nextId = 0;

export function Desktop({ dmName, campaignTitle, openingHook, day, onAdvanceDay }: Props) {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [showHook, setShowHook] = useState(true);
  const [sleeping, setSleeping] = useState(false);

  const launchApp = useCallback((appId: string) => {
    const app = APPS[appId];
    if (!app) return;
    setWindows((prev) => {
      const existing = prev.find((w) => w.appId === appId);
      if (existing) {
        return prev.map((w) =>
          w.id === existing.id ? { ...w, minimized: false, z: ++nextZ } : w,
        );
      }
      const margin = 60;
      const offset = (prev.length % 5) * 28;
      const w: WindowState = {
        id: `win-${++nextId}`,
        appId: app.id,
        title: app.title,
        x: margin + offset,
        y: margin + offset,
        w: app.defaultSize.w,
        h: app.defaultSize.h,
        z: ++nextZ,
        minimized: false,
        maximized: false,
      };
      return [...prev, w];
    });
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, z: ++nextZ, minimized: false } : w)));
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized && w.prev) {
          return { ...w, maximized: false, ...w.prev };
        }
        return {
          ...w,
          maximized: true,
          prev: { x: w.x, y: w.y, w: w.w, h: w.h },
        };
      }),
    );
  }, []);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const resizeWindow = useCallback(
    (id: string, w: number, h: number, x: number, y: number) => {
      setWindows((prev) => prev.map((wn) => (wn.id === id ? { ...wn, w, h, x, y } : wn)));
    },
    [],
  );

  function renderApp(appId: AppId) {
    switch (appId) {
      case 'chat':
        return <ChatApp />;
      case 'calendar':
        return <CalendarApp day={day} />;
      case 'notes':
        return <NotesApp />;
      case 'encounter-builder':
        return <EncounterBuilderApp />;
      case 'email':
      case 'browser':
      case 'music':
      default:
        return (
          <div className="p-6 font-mono text-base text-ink">
            <div className="font-pixel text-[10px] mb-2">{APPS[appId]?.title}</div>
            <div className="text-ink-muted">[ stub — coming soon ]</div>
          </div>
        );
    }
  }

  function handleEndDay() {
    setSleeping(true);
    window.setTimeout(() => {
      onAdvanceDay();
      setSleeping(false);
    }, 1500);
  }

  // Read taskbar app list with current "live" badges (could lerp w/ burnout etc later)
  const taskbarApps = APP_LIST;

  return (
    <div className="absolute inset-0 overflow-hidden bg-bg-desk crt-flicker">
      {/* Wallpaper */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 35%, #4c5e72 0%, #324050 60%, #1f2832 100%)`,
        }}
      >
        {/* Faint pixel grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Branding watermark — game title */}
      <div className="absolute top-6 left-6 text-bg-window/80 pointer-events-none">
        <div className="font-pixel text-xs tracking-widest text-accent-dust">DM SIMULATOR</div>
        <div className="font-mono text-sm text-bg-window/60">— {campaignTitle}</div>
      </div>

      {/* Desktop icons row (decorative) */}
      <div className="absolute top-24 left-6 flex flex-col gap-3 pointer-events-none">
        {APP_LIST.slice(0, 5).map((a) => (
          <div key={a.id} className="flex flex-col items-center w-14">
            <div className="w-10 h-10 bg-accent-slate border border-black/60 flex items-center justify-center font-pixel text-[8px] text-bg-window shadow-pixel">
              {a.icon}
            </div>
            <div className="font-pixel text-[7px] text-bg-window mt-1 text-center">{a.title}</div>
          </div>
        ))}
      </div>

      {/* Windows */}
      {windows.map((w) => (
        <Window
          key={w.id}
          win={w}
          onFocus={() => focusWindow(w.id)}
          onClose={() => closeWindow(w.id)}
          onMinimize={() => minimizeWindow(w.id)}
          onMaximizeToggle={() => toggleMaximize(w.id)}
          onMove={(x, y) => moveWindow(w.id, x, y)}
          onResize={(ww, hh, xx, yy) => resizeWindow(w.id, ww, hh, xx, yy)}
        >
          {renderApp(w.appId)}
        </Window>
      ))}

      {/* Opening hook popup */}
      {showHook && (
        <OpeningHookModal hook={openingHook} dmName={dmName} onClose={() => setShowHook(false)} />
      )}

      {/* Sleeping overlay */}
      {sleeping && (
        <div className="absolute inset-0 bg-black/85 z-[9999] flex items-center justify-center text-bg-window animate-pulse">
          <div className="font-pixel text-xs">going to sleep…</div>
        </div>
      )}

      {/* Taskbar */}
      <Taskbar
        apps={taskbarApps}
        windows={windows}
        day={day}
        dmName={dmName}
        onLaunch={launchApp}
        onTaskbarClick={focusWindow}
        onEndDay={handleEndDay}
      />
    </div>
  );
}
