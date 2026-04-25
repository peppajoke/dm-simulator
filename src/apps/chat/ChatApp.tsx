import { useState } from 'react';

interface Channel {
  id: string;
  name: string;
  kind: 'group' | 'splinter' | 'dm';
  unread?: number;
  splinterHidden?: boolean; // chats you "shouldn't" be reading
}

interface Member {
  id: string;
  name: string;
  archetype: string;
  color: string;
  status: 'online' | 'idle' | 'offline';
}

interface Msg {
  id: string;
  authorId: string;
  ts: string;
  content: string;
  isDm?: boolean;
}

const MEMBERS: Member[] = [
  { id: 'brad', name: 'Brad',     archetype: 'Rules Lawyer',     color: '#7a5a78', status: 'online' },
  { id: 'sarah', name: 'Sarah',   archetype: 'Main Character',   color: '#a8674a', status: 'online' },
  { id: 'jeff', name: 'Jeff',     archetype: 'The Ghost',        color: '#6b8268', status: 'idle' },
  { id: 'nikko', name: 'Nikko',   archetype: 'Murderhobo',       color: '#c8b890', status: 'online' },
  { id: 'mira', name: 'Mira',     archetype: 'The Newbie',       color: '#4a5868', status: 'offline' },
  { id: 'dm', name: 'You',        archetype: 'DM',               color: '#2b2418', status: 'online' },
];

const CHANNELS: Channel[] = [
  { id: 'general', name: '# general',                kind: 'group' },
  { id: 'session-zero', name: '# session-zero',      kind: 'group', unread: 3 },
  { id: 'splinter-no-sarah', name: '# brad-nikko-jeff', kind: 'splinter', unread: 4, splinterHidden: true },
  { id: 'dm-brad', name: '@ Brad',     kind: 'dm', unread: 2 },
  { id: 'dm-sarah', name: '@ Sarah',   kind: 'dm' },
  { id: 'dm-mira', name: '@ Mira',     kind: 'dm', unread: 1 },
];

const MESSAGES: Record<string, Msg[]> = {
  general: [
    { id: 'm1', authorId: 'sarah', ts: 'Mon 14:02', content: "okayyyy so my character has THREE reasons to hate vampires and i need to talk to you about all of them" },
    { id: 'm2', authorId: 'brad',  ts: 'Mon 14:11', content: "@DM quick question — does the Hexblade clause about pact weapons override the standard finesse rule? need to know before tuesday" },
    { id: 'm3', authorId: 'nikko', ts: 'Mon 14:30', content: "I'm bringing a goblin paladin who fights with a stale baguette. don't @ me." },
    { id: 'm4', authorId: 'mira',  ts: 'Mon 14:44', content: "what's a d20 :)" },
    { id: 'm5', authorId: 'dm',    ts: 'Mon 15:12', content: "session zero is tuesday at 7pm. bring snacks. or don't. i don't care." },
    { id: 'm6', authorId: 'jeff',  ts: 'Mon 23:49', content: "going to be late, possibly very late, possibly not at all" },
  ],
  'session-zero': [
    { id: 'sz1', authorId: 'sarah', ts: 'Tue 10:01', content: "i wrote 3000 words about my character's backstory please read carefully there will be a quiz" },
    { id: 'sz2', authorId: 'brad', ts: 'Tue 10:14', content: "Here is a corrected version of the houserules doc. 14 changes. all minor. mostly." },
  ],
  'splinter-no-sarah': [
    { id: 'sp1', authorId: 'brad', ts: 'Mon 22:18', content: "okay i can't be the only one who thinks her backstory is too much" },
    { id: 'sp2', authorId: 'nikko', ts: 'Mon 22:19', content: "lmao no" },
    { id: 'sp3', authorId: 'jeff', ts: 'Mon 22:31', content: "i mean. it is a lot." },
    { id: 'sp4', authorId: 'brad', ts: 'Mon 22:33', content: "i'll talk to alex about it. i don't want to be the bad guy. but somebody has to be." },
  ],
  'dm-brad': [
    { id: 'b1', authorId: 'brad', ts: 'Sun 23:51', content: "hey sorry to bother. real quick. flanking. you using the optional rule or the proper one?" },
    { id: 'b2', authorId: 'brad', ts: 'Sun 23:52', content: "(not a bother thing just want to be ready)" },
  ],
  'dm-sarah': [
    { id: 's1', authorId: 'sarah', ts: 'Mon 09:11', content: "i had ANOTHER idea about my character's mom can we hop on a call" },
  ],
  'dm-mira': [
    { id: 'mi1', authorId: 'mira', ts: 'Mon 18:00', content: "i'm so sorry to ask again — when do i roll the d20 vs the d8" },
  ],
};

const memberById = (id: string) => MEMBERS.find((m) => m.id === id) ?? MEMBERS[0];

export function ChatApp() {
  const [activeId, setActiveId] = useState<string>('general');
  const [draft, setDraft] = useState('');
  const channel = CHANNELS.find((c) => c.id === activeId)!;
  const messages = MESSAGES[activeId] ?? [];
  const isHidden = channel.splinterHidden;

  return (
    <div className="flex h-full text-ink">
      {/* Left: server + channels */}
      <div className="w-14 bg-accent-slate flex flex-col items-center pt-2 gap-2 border-r-2 border-black/60">
        <div className="w-10 h-10 bg-accent-plum border border-black/60 flex items-center justify-center text-bg-window font-pixel text-[9px]">
          CoS
        </div>
        <div className="w-10 h-1 bg-black/40 my-1" />
        <div className="w-10 h-10 bg-bg-windowDark border border-black/60 flex items-center justify-center text-ink font-pixel text-[8px]">
          +
        </div>
      </div>

      <div className="w-52 bg-bg-windowDark/60 border-r-2 border-black/60 flex flex-col">
        <div className="px-3 py-2 border-b-2 border-black/40 font-pixel text-[10px] text-ink">curse-of-strudel</div>
        <div className="px-2 py-2 text-ink-muted font-pixel text-[8px] tracking-wider">CHANNELS</div>
        {CHANNELS.filter((c) => c.kind !== 'dm').map((c) => (
          <ChannelRow key={c.id} channel={c} active={c.id === activeId} onClick={() => setActiveId(c.id)} />
        ))}
        <div className="px-2 py-2 text-ink-muted font-pixel text-[8px] tracking-wider">DIRECT MESSAGES</div>
        {CHANNELS.filter((c) => c.kind === 'dm').map((c) => (
          <ChannelRow key={c.id} channel={c} active={c.id === activeId} onClick={() => setActiveId(c.id)} />
        ))}

        <div className="mt-auto px-3 py-2 border-t-2 border-black/40 bg-bg-windowDark text-ink font-mono text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent-moss" />
            you (DM)
          </div>
        </div>
      </div>

      {/* Right: messages + input */}
      <div className={`flex-1 flex flex-col ${isHidden ? 'saturate-50' : ''}`} style={isHidden ? { cursor: 'not-allowed' } : undefined}>
        <div className="h-9 px-3 flex items-center justify-between border-b-2 border-black/40 bg-bg-window">
          <div className="font-pixel text-[10px] text-ink">{channel.name}</div>
          {isHidden && (
            <div className="font-pixel text-[8px] text-accent-rust">you shouldn't be reading this</div>
          )}
        </div>

        <div className="flex-1 overflow-auto no-scrollbar p-3 space-y-3 bg-bg-window">
          {messages.map((m) => {
            const u = memberById(m.authorId);
            return (
              <div key={m.id} className="flex gap-3">
                <div
                  className="w-9 h-9 flex-shrink-0 border border-black/60 flex items-center justify-center font-pixel text-[8px] text-bg-window"
                  style={{ background: u.color }}
                >
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-pixel text-[10px] text-ink">{u.name}</span>
                    <span className="font-mono text-xs text-ink-muted">{u.archetype}</span>
                    <span className="font-mono text-xs text-ink-dim">{m.ts}</span>
                  </div>
                  <div className="font-mono text-base text-ink leading-snug">{m.content}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t-2 border-black/40 p-2 bg-bg-window">
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={isHidden ? "this isn't your channel" : `message ${channel.name}`}
              className="flex-1 bg-bg-windowDark/40 border-2 border-black/60 px-2 py-1 font-mono text-base text-ink"
              disabled={isHidden}
            />
            <button
              onClick={() => setDraft('')}
              disabled={isHidden || !draft.trim()}
              className="bg-accent-plum disabled:bg-ink-dim text-bg-window px-3 border-2 border-black/60 font-pixel text-[9px]"
            >
              send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelRow({ channel, active, onClick }: { channel: Channel; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between text-left px-3 py-1 font-mono text-base ${
        active ? 'bg-accent-plum text-bg-window' : 'text-ink-muted hover:bg-bg-windowDark'
      } ${channel.splinterHidden ? 'italic opacity-80' : ''}`}
    >
      <span>{channel.name}</span>
      {channel.unread ? (
        <span className="bg-accent-rust text-bg-window font-pixel text-[8px] px-1 border border-black/60">
          {channel.unread}
        </span>
      ) : null}
    </button>
  );
}
