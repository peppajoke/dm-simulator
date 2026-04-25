import { useEffect, useRef, useState, type ReactNode, type PointerEvent as RPointerEvent } from 'react';
import type { WindowState } from './types';

interface Props {
  win: WindowState;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximizeToggle: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (w: number, h: number, x: number, y: number) => void;
  children: ReactNode;
}

const TASKBAR_H = 44;
const MIN_W = 320;
const MIN_H = 220;

export function Window({
  win,
  onFocus,
  onClose,
  onMinimize,
  onMaximizeToggle,
  onMove,
  onResize,
  children,
}: Props) {
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    ow: number;
    oh: number;
    ox: number;
    oy: number;
    edge: string;
  } | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    function onMoveEv(e: PointerEvent) {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const nx = Math.max(0, dragRef.current.ox + dx);
        const ny = Math.max(0, Math.min(window.innerHeight - TASKBAR_H - 30, dragRef.current.oy + dy));
        onMove(nx, ny);
      }
      if (resizeRef.current) {
        const r = resizeRef.current;
        const dx = e.clientX - r.startX;
        const dy = e.clientY - r.startY;
        let w = r.ow;
        let h = r.oh;
        let x = r.ox;
        let y = r.oy;
        if (r.edge.includes('e')) w = Math.max(MIN_W, r.ow + dx);
        if (r.edge.includes('s')) h = Math.max(MIN_H, r.oh + dy);
        if (r.edge.includes('w')) {
          const nw = Math.max(MIN_W, r.ow - dx);
          x = r.ox + (r.ow - nw);
          w = nw;
        }
        if (r.edge.includes('n')) {
          const nh = Math.max(MIN_H, r.oh - dy);
          y = Math.max(0, r.oy + (r.oh - nh));
          h = nh;
        }
        onResize(w, h, x, y);
      }
    }
    function onUp() {
      dragRef.current = null;
      resizeRef.current = null;
      force((n) => n + 1);
    }
    window.addEventListener('pointermove', onMoveEv);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMoveEv);
      window.removeEventListener('pointerup', onUp);
    };
  }, [onMove, onResize]);

  function startDrag(e: RPointerEvent) {
    if (win.maximized) return;
    onFocus();
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: win.x, oy: win.y };
  }

  function startResize(edge: string) {
    return (e: RPointerEvent) => {
      if (win.maximized) return;
      e.stopPropagation();
      onFocus();
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        ow: win.w,
        oh: win.h,
        ox: win.x,
        oy: win.y,
        edge,
      };
    };
  }

  if (win.minimized) return null;

  const style = win.maximized
    ? { left: 0, top: 0, width: '100vw', height: `calc(100vh - ${TASKBAR_H}px)` }
    : { left: win.x, top: win.y, width: win.w, height: win.h };

  return (
    <div
      className="absolute bg-bg-window text-ink shadow-window border-2 border-black/70 flex flex-col select-none"
      style={{ ...style, zIndex: win.z }}
      onPointerDown={onFocus}
    >
      {/* Titlebar */}
      <div
        className="h-7 flex items-center justify-between px-1 bg-accent-slate text-bg-window cursor-grab active:cursor-grabbing border-b-2 border-black/60"
        onPointerDown={startDrag}
        onDoubleClick={onMaximizeToggle}
      >
        <div className="flex items-center gap-1 px-1">
          <span className="font-pixel text-[9px] tracking-wide truncate">{win.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="w-5 h-5 bg-accent-dust text-ink hover:bg-yellow-200 border border-black/60 flex items-center justify-center font-pixel text-[8px]"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onMinimize}
            title="Minimize"
          >
            _
          </button>
          <button
            className="w-5 h-5 bg-accent-moss text-ink hover:bg-green-300 border border-black/60 flex items-center justify-center font-pixel text-[8px]"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onMaximizeToggle}
            title="Maximize"
          >
            {win.maximized ? '·' : '□'}
          </button>
          <button
            className="w-5 h-5 bg-accent-rust text-bg-window hover:bg-red-500 border border-black/60 flex items-center justify-center font-pixel text-[8px]"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onClose}
            title="Close"
          >
            x
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden bg-bg-window">{children}</div>

      {/* Resize edges (skip when maximized) */}
      {!win.maximized && (
        <>
          <div className="absolute -top-1 left-2 right-2 h-2 cursor-ns-resize" onPointerDown={startResize('n')} />
          <div className="absolute -bottom-1 left-2 right-2 h-2 cursor-ns-resize" onPointerDown={startResize('s')} />
          <div className="absolute -left-1 top-2 bottom-2 w-2 cursor-ew-resize" onPointerDown={startResize('w')} />
          <div className="absolute -right-1 top-2 bottom-2 w-2 cursor-ew-resize" onPointerDown={startResize('e')} />
          <div className="absolute -top-1 -left-1 w-3 h-3 cursor-nwse-resize" onPointerDown={startResize('nw')} />
          <div className="absolute -top-1 -right-1 w-3 h-3 cursor-nesw-resize" onPointerDown={startResize('ne')} />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 cursor-nesw-resize" onPointerDown={startResize('sw')} />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 cursor-nwse-resize" onPointerDown={startResize('se')} />
        </>
      )}
    </div>
  );
}
