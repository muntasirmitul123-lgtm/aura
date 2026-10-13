import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Download, Feather, Plus, Trash2, X } from 'lucide-react';
import { auraActions, useAuraStore } from '../store/useAuraStore';

export const ThoughtStream: React.FC = () => {
  const {
    activeThoughts,
    thoughtArchive,
    thoughtInputOpen,
    thoughtLedgerOpen,
  } = useAuraStore();

  const [inputVal, setInputVal] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredThoughtId, setHoveredThoughtId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-dismiss expired thoughts unless currently hovered
  useEffect(() => {
    if (activeThoughts.length === 0) return;
    const interval = window.setInterval(() => {
      const now = Date.now();
      activeThoughts.forEach((t) => {
        if (hoveredThoughtId !== t.id && now - t.createdAt > t.durationMs) {
          auraActions.dismissThought(t.id);
        }
      });
    }, 1200);
    return () => window.clearInterval(interval);
  }, [activeThoughts, hoveredThoughtId]);

  // Focus input automatically when opened
  useEffect(() => {
    if (thoughtInputOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [thoughtInputOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      auraActions.captureThought(inputVal.trim());
      setInputVal('');
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const convertToTask = (text: string) => {
    auraActions.addTask(text);
  };

  const exportArchiveAsMarkdown = () => {
    if (thoughtArchive.length === 0) return;
    const content = `# AURA Focus Session · Thought Stream Ledger\nExported: ${new Date().toLocaleString()}\n\n` +
      thoughtArchive
        .map(
          (t) =>
            `- [${new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ${t.text}`
        )
        .join('\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AURA-Thoughts-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* 1. EPHEMERAL FADING CANVAS OVERLAYS */}
      <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden select-none">
        <AnimatePresence>
          {activeThoughts.map((thought) => (
            <motion.div
              key={thought.id}
              initial={{
                opacity: 0,
                y: 18,
                scale: 0.94,
                filter: 'blur(8px)',
              }}
              animate={{
                opacity: hoveredThoughtId === thought.id ? 1 : [0, 0.9, 0.85, 0.6, 0],
                y: hoveredThoughtId === thought.id ? 0 : [18, 0, -10, -24, -38],
                scale: hoveredThoughtId === thought.id ? 1 : [0.94, 1, 1, 0.98, 0.92],
                filter:
                  hoveredThoughtId === thought.id
                    ? 'blur(0px)'
                    : ['blur(6px)', 'blur(0px)', 'blur(0px)', 'blur(2px)', 'blur(8px)'],
              }}
              exit={{
                opacity: 0,
                y: -30,
                filter: 'blur(8px)',
              }}
              transition={{
                duration: thought.durationMs / 1000,
                times: [0, 0.08, 0.65, 0.88, 1],
                ease: 'easeInOut',
              }}
              style={{
                left: `${thought.x}%`,
                top: `${thought.y}%`,
              }}
              onMouseEnter={() => setHoveredThoughtId(thought.id)}
              onMouseLeave={() => setHoveredThoughtId(null)}
              className="absolute pointer-events-auto group max-w-md cursor-default"
            >
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#101114]/65 hover:bg-[#101114]/90 border border-[#F5F2EA]/12 hover:border-[#E0A96D]/40 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.65)] text-xs text-[#F5F2EA]/90 hover:text-[#F5F2EA] transition-all">
                <Feather className="w-3.5 h-3.5 text-[#E0A96D] shrink-0" />
                <span className="font-light tracking-wide italic leading-snug">
                  {thought.text}
                </span>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                  <button
                    onClick={() => convertToTask(thought.text)}
                    title="Convert to Focus Task"
                    className="px-2 py-0.5 rounded bg-[#F5F2EA]/10 hover:bg-[#F5F2EA]/20 text-[10px] tracking-wider uppercase text-[#F5F2EA] transition-colors cursor-pointer"
                  >
                    Task
                  </button>
                  <button
                    onClick={() => copyToClipboard(thought.id, thought.text)}
                    title="Copy text"
                    className="p-1 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                  >
                    {copiedId === thought.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => auraActions.dismissThought(thought.id)}
                    aria-label="Dismiss thought"
                    className="p-1 text-[#92949A] hover:text-[#E11D48] transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 2. INSTANT THOUGHT CAPTURE HUD (Triggered by pressing 'J' or dock feather icon) */}
      <AnimatePresence>
        {thoughtInputOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.97, y: 10, filter: 'blur(8px)' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-24 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-50 w-auto md:w-[580px]"
          >
            <form
              onSubmit={handleSubmit}
              className="p-5 rounded-2xl bg-[#101114]/95 border border-[#F5F2EA]/15 backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] space-y-3"
            >
              <div className="flex items-center justify-between text-[11px] tracking-[0.2em] uppercase text-[#92949A]">
                <div className="flex items-center gap-2">
                  <Feather className="w-3.5 h-3.5 text-[#E0A96D]" />
                  <span>Thought Stream · Ephemeral Capture</span>
                </div>
                <button
                  type="button"
                  onClick={() => auraActions.closeThoughtInput()}
                  aria-label="Close thought capture"
                  className="p-1 hover:text-[#F5F2EA] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Capture a fleeting idea, distraction to park, or reflection..."
                  className="w-full bg-[#08090B]/85 border border-[#F5F2EA]/12 rounded-xl px-4 py-3 text-sm text-[#F5F2EA] placeholder-[#92949A]/50 focus:outline-none focus:border-[#E0A96D]/50 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#92949A] pt-1">
                <span className="text-[11px]">
                  Press Enter to release onto canvas · Esc to dismiss
                </span>
                <div className="flex items-center gap-2">
                  {thoughtArchive.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        auraActions.closeThoughtInput();
                        auraActions.toggleThoughtLedger();
                      }}
                      className="hover:text-[#F5F2EA] transition-colors cursor-pointer text-xs"
                    >
                      View Ledger ({thoughtArchive.length})
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-md bg-[#E0A96D]/20 hover:bg-[#E0A96D]/30 text-[#E0A96D] text-[11px] tracking-[0.16em] uppercase cursor-pointer font-medium transition-colors"
                  >
                    Release
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. THOUGHT STREAM ARCHIVE & LEDGER DRAWER */}
      <AnimatePresence>
        {thoughtLedgerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(10px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-40 w-auto md:w-[640px] max-h-[72vh] flex flex-col rounded-2xl bg-[#101114]/95 border border-[#F5F2EA]/10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F2EA]/8">
              <div className="flex items-center gap-2.5">
                <Feather className="w-4 h-4 text-[#E0A96D]" />
                <h2 className="text-xs tracking-[0.24em] uppercase text-[#F5F2EA] font-medium">
                  Thought Stream Ledger
                </h2>
                <span className="text-xs text-[#92949A] tabular-nums">
                  ({thoughtArchive.length} captured)
                </span>
              </div>
              <div className="flex items-center gap-3">
                {thoughtArchive.length > 0 && (
                  <>
                    <button
                      onClick={exportArchiveAsMarkdown}
                      title="Export thoughts as Markdown notes"
                      className="flex items-center gap-1.5 text-[11px] text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={() => auraActions.clearThoughtArchive()}
                      className="text-[11px] text-[#92949A] hover:text-[#E11D48] transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </>
                )}
                <button
                  onClick={() => auraActions.setThoughtLedger(false)}
                  aria-label="Close thought ledger"
                  className="p-1.5 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {thoughtArchive.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#92949A]">
                  No captured thoughts yet. Press{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-[#16181C] border border-[#F5F2EA]/15 font-mono text-[10px] text-[#E0A96D]">
                    J
                  </kbd>{' '}
                  anytime during your session to jot down a fleeting thought.
                </div>
              ) : (
                thoughtArchive.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#08090B]/60 border border-[#F5F2EA]/8 hover:border-[#F5F2EA]/20 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#F5F2EA] font-light leading-relaxed">
                        {item.text}
                      </p>
                      <span className="text-[10px] text-[#92949A] font-mono mt-1 block">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => convertToTask(item.text)}
                        title="Convert to Focus Task"
                        className="px-2.5 py-1 rounded-md bg-[#F5F2EA]/8 hover:bg-[#F5F2EA]/16 text-[10px] tracking-[0.12em] uppercase text-[#F5F2EA] transition-colors cursor-pointer"
                      >
                        Add to Tasks
                      </button>
                      <button
                        onClick={() => copyToClipboard(item.id, item.text)}
                        title="Copy thought text"
                        className="p-1 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => auraActions.deleteArchivedThought(item.id)}
                        title="Delete thought"
                        className="p-1 text-[#92949A]/60 hover:text-[#E11D48] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
