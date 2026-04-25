interface Props {
  hook: string;
  dmName: string;
  onClose: () => void;
}

export function OpeningHookModal({ hook, dmName, onClose }: Props) {
  return (
    <div className="absolute inset-0 z-[9000] bg-black/40 flex items-center justify-center">
      <div className="w-[420px] bg-bg-window border-2 border-black/70 shadow-window">
        <div className="h-7 bg-accent-plum text-bg-window px-2 flex items-center justify-between border-b-2 border-black/60">
          <span className="font-pixel text-[9px]">A Sealed Letter</span>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-accent-rust text-bg-window border border-black/60 flex items-center justify-center font-pixel text-[8px]"
          >
            x
          </button>
        </div>
        <div className="p-5 text-ink font-mono text-base leading-relaxed">
          <p className="mb-3 italic">{hook}</p>
          <p className="text-ink-muted text-sm">
            — addressed to <span className="text-ink font-semibold">{dmName}</span>
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full bg-accent-slate hover:bg-accent-plum text-bg-window border border-black/60 py-2 font-pixel text-[9px]"
          >
            Open the letter
          </button>
        </div>
      </div>
    </div>
  );
}
