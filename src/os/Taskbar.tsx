import type { AppDef, WindowState } from './types';

interface Props {
  apps: AppDef[];
  windows: WindowState[];
  day: number;
  dmName: string;
  onLaunch: (appId: string) => void;
  onTaskbarClick: (winId: string) => void;
  onEndDay: () => void;
}

export function Taskbar({ apps, windows, day, dmName, onLaunch, onTaskbarClick, onEndDay }: Props) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-11 bg-bg-taskbar border-t-2 border-black/70 flex items-center px-2 gap-2 text-bg-window">
      {/* Start / DM badge */}
      <div className="flex items-center gap-2 pr-2 border-r border-white/10">
        <div className="w-7 h-7 bg-accent-plum border border-black/60 flex items-center justify-center font-pixel text-[8px] text-bg-window">
          DM
        </div>
        <span className="font-pixel text-[9px] tracking-wide hidden sm:inline">{dmName || 'DM'}</span>
      </div>

      {/* App launchers */}
      <div className="flex items-center gap-1">
        {apps.map((app) => {
          const open = windows.find((w) => w.appId === app.id);
          return (
            <button
              key={app.id}
              onClick={() => (open ? onTaskbarClick(open.id) : onLaunch(app.id))}
              className={`relative h-8 px-2 border border-black/60 font-pixel text-[8px] flex items-center gap-1 ${
                open
                  ? 'bg-accent-dust text-ink'
                  : 'bg-bg-deskDark text-bg-window hover:bg-accent-slate'
              }`}
              title={app.title}
            >
              <span>{app.icon}</span>
              <span className="hidden md:inline">{app.title}</span>
              {app.badge && app.badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-accent-rust text-bg-window border border-black/70 font-pixel text-[8px] flex items-center justify-center">
                  {app.badge > 99 ? '99' : app.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* End Day */}
      <button
        onClick={onEndDay}
        className="h-8 px-3 bg-accent-plum hover:bg-purple-700 text-bg-window border border-black/60 font-pixel text-[8px]"
        title="Sleep — advance to next day"
      >
        Sleep ▸
      </button>

      {/* Tray / Clock */}
      <div className="flex items-center gap-2 pl-2 border-l border-white/10 pr-1">
        <span className="w-2 h-2 bg-accent-moss border border-black/60" title="LLM proxy: stub" />
        <span className="w-2 h-2 bg-accent-dust border border-black/60" title="Save: ok" />
        <div className="bg-black/40 border border-white/10 px-2 h-8 flex items-center font-pixel text-[9px]">
          Day {day}
        </div>
      </div>
    </div>
  );
}
