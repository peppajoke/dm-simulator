interface Props {
  day: number;
}

const SESSION_DAY = 12;

interface CellEvent {
  kind: 'session' | 'reschedule' | 'avail-good' | 'avail-bad' | 'note';
  label: string;
}

function eventsForDay(d: number): CellEvent[] {
  const events: CellEvent[] = [];
  if (d === SESSION_DAY) events.push({ kind: 'session', label: 'SESSION 1' });
  if (d === 7) events.push({ kind: 'reschedule', label: 'Brad ?' });
  if (d === 9) events.push({ kind: 'reschedule', label: 'Jeff cancel' });
  if (d === 4) events.push({ kind: 'note', label: 'char gen' });
  if (d === 6) events.push({ kind: 'note', label: 'doodle poll' });
  return events;
}

const DAYS = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

export function CalendarApp({ day }: Props) {
  const cells = Array.from({ length: 35 }, (_, i) => i + 1);

  return (
    <div className="h-full flex text-ink">
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-2 border-b-2 border-black/40 bg-bg-windowDark/40 flex items-center justify-between">
          <div className="font-pixel text-[10px]">Month of Mists · Year 1</div>
          <div className="font-mono text-base text-ink-muted">today: day {day}</div>
        </div>

        <div className="grid grid-cols-7 border-b-2 border-black/40 bg-bg-windowDark/30">
          {DAYS.map((d) => (
            <div key={d} className="px-2 py-1 font-pixel text-[8px] text-ink-muted text-center">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-5 flex-1">
          {cells.map((d) => {
            const isToday = d === day;
            const isFuture = d > day;
            const isSession = d === SESSION_DAY;
            const events = eventsForDay(d);
            return (
              <div
                key={d}
                className={`border-r border-b border-black/30 p-1 relative text-xs overflow-hidden ${
                  isToday ? 'bg-accent-plum/30' : isFuture ? 'bg-bg-window' : 'bg-bg-windowDark/40 text-ink-muted'
                } ${isSession ? 'ring-2 ring-accent-rust ring-inset' : ''}`}
              >
                <div className={`font-pixel text-[9px] ${isToday ? 'text-accent-rust' : ''}`}>{d}</div>
                <div className="space-y-0.5 mt-1">
                  {events.map((e, i) => (
                    <div
                      key={i}
                      className={`font-mono text-xs leading-tight px-1 ${
                        e.kind === 'session'
                          ? 'bg-accent-rust text-bg-window font-pixel text-[7px]'
                          : e.kind === 'reschedule'
                          ? 'text-accent-rust'
                          : 'text-ink-muted'
                      }`}
                    >
                      {e.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right rail: availability bars */}
      <div className="w-56 border-l-2 border-black/40 bg-bg-windowDark/40 p-3 space-y-3">
        <div className="font-pixel text-[10px] text-ink">Player availability</div>
        {[
          { name: 'Brad', avail: 0.85, note: 'Tue–Wed' },
          { name: 'Sarah', avail: 0.72, note: 'flexible' },
          { name: 'Jeff', avail: 0.34, note: 'maybe' },
          { name: 'Nikko', avail: 0.91, note: 'always' },
          { name: 'Mira', avail: 0.55, note: 'school' },
        ].map((p) => (
          <div key={p.name}>
            <div className="flex justify-between font-mono text-base text-ink">
              <span>{p.name}</span>
              <span className="text-ink-muted">{p.note}</span>
            </div>
            <div className="h-2 bg-black/30 border border-black/60 mt-1">
              <div
                className={`h-full ${p.avail > 0.7 ? 'bg-accent-moss' : p.avail > 0.4 ? 'bg-accent-dust' : 'bg-accent-rust'}`}
                style={{ width: `${p.avail * 100}%` }}
              />
            </div>
          </div>
        ))}
        <div className="pt-2 mt-2 border-t-2 border-black/30 font-mono text-sm text-ink-muted">
          countdown: <span className="text-accent-rust font-pixel text-[9px]">{Math.max(0, SESSION_DAY - day)}</span> days to Session 1
        </div>
      </div>
    </div>
  );
}
