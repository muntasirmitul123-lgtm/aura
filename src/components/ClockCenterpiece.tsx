import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import { SCENES } from '../data/scenesAndSounds';
import { auraActions, useAuraStore } from '../store/useAuraStore';

const AnimatedDigit: React.FC<{ char: string; className?: string }> = ({ char, className = '' }) => {
  return (
    <span className={`relative inline-flex justify-center overflow-hidden ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: '38%', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-38%', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block tabular-nums"
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

function numberToWords(hours: number, minutes: number): { main: string; sub: string } {
  const ones = [
    'TWELVE',
    'ONE',
    'TWO',
    'THREE',
    'FOUR',
    'FIVE',
    'SIX',
    'SEVEN',
    'EIGHT',
    'NINE',
    'TEN',
    'ELEVEN',
    'TWELVE',
    'THIRTEEN',
    'FOURTEEN',
    'FIFTEEN',
    'SIXTEEN',
    'SEVENTEEN',
    'EIGHTEEN',
    'NINETEEN',
  ];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY'];
  const h12 = hours % 12 || 12;
  const hourWord = ones[h12];

  let minWord = "O'CLOCK";
  if (minutes > 0 && minutes < 20) {
    minWord = minutes < 10 ? `OH ${ones[minutes]}` : ones[minutes];
  } else if (minutes >= 20) {
    const t = Math.floor(minutes / 10);
    const o = minutes % 10;
    minWord = o === 0 ? tens[t] : `${tens[t]} ${ones[o]}`;
  }

  const period =
    hours < 5
      ? 'IN THE QUIET OF NIGHT'
      : hours < 12
      ? 'IN THE MORNING'
      : hours < 17
      ? 'IN THE AFTERNOON'
      : hours < 21
      ? 'IN THE EVENING'
      : 'AT NIGHT';

  return {
    main: `${hourWord} ${minWord}`,
    sub: period,
  };
}

export const ClockCenterpiece: React.FC<{ controlsVisible: boolean }> = ({ controlsVisible }) => {
  const state = useAuraStore();
  const {
    clockConfig,
    isSessionActive,
    isSessionPaused,
    isBreakPhase,
    timerMode,
    workMinutes,
    breakMinutes,
    secondsRemaining,
    stopwatchSeconds,
    isAmbientMode,
    tasks,
    activeTaskId,
    widgets,
    activeSceneId,
    customAccentOverride,
  } = state;

  const [now, setNow] = useState(() => new Date());
  const [editingTask, setEditingTask] = useState(false);
  const [taskDraft, setTaskDraft] = useState('');

  // Wall clock interval
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Focus timer tick interval
  useEffect(() => {
    if (!isSessionActive || isSessionPaused) return;
    const id = window.setInterval(() => {
      auraActions.tickSecond();
    }, 1000);
    return () => window.clearInterval(id);
  }, [isSessionActive, isSessionPaused]);

  const currentScene = SCENES.find((s) => s.id === activeSceneId) || SCENES[0];
  const accentColor = customAccentOverride || currentScene.accentColor;

  // Format wall clock time
  const rawHours = now.getHours();
  const displayHours = clockConfig.is24Hour ? rawHours : rawHours % 12 || 12;
  const hoursStr = String(displayHours).padStart(2, '0');
  const minutesStr = String(now.getMinutes()).padStart(2, '0');
  const secondsStr = String(now.getSeconds()).padStart(2, '0');

  const weekdayStr = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();

  // Format Focus Session time
  const activeSeconds = timerMode === 'stopwatch' ? stopwatchSeconds : secondsRemaining;
  const sessMins = String(Math.floor(activeSeconds / 60)).padStart(2, '0');
  const sessSecs = String(activeSeconds % 60).padStart(2, '0');
  const totalSessionSeconds = (isBreakPhase ? breakMinutes : workMinutes) * 60;
  const progressRatio =
    timerMode === 'stopwatch'
      ? Math.min(1, (stopwatchSeconds % 3600) / 3600)
      : Math.max(0, Math.min(1, 1 - secondsRemaining / Math.max(1, totalSessionSeconds)));

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];

  const weightClass =
    clockConfig.weight === 'light'
      ? 'font-light'
      : clockConfig.weight === 'regular'
      ? 'font-normal'
      : 'font-medium';

  const trackingClass =
    clockConfig.tracking === 'tight'
      ? 'tracking-[-0.04em]'
      : clockConfig.tracking === 'normal'
      ? 'tracking-[-0.01em]'
      : 'tracking-[0.04em]';

  const glowShadow =
    clockConfig.glowIntensity > 0
      ? `0 0 ${Math.round(clockConfig.glowIntensity * 0.65)}px rgba(245, 242, 234, ${(
          clockConfig.glowIntensity / 280
        ).toFixed(2)})`
      : 'none';

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskDraft.trim()) {
      auraActions.addTask(taskDraft.trim());
    }
    setEditingTask(false);
    setTaskDraft('');
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 select-none">
      <AnimatePresence mode="wait">
        {isSessionActive && !isAmbientMode ? (
          /* ACTIVE FOCUS SESSION VIEW — Dramatic architectural simplification */
          <motion.div
            key="focus-session-view"
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center max-w-xl w-full"
          >
            {/* Large Tabular Countdown */}
            <div
              className={`font-clock-mono text-[clamp(4.25rem,11vw,8.25rem)] leading-none ${weightClass} tracking-[-0.04em] text-[#F5F2EA] flex items-center justify-center`}
              style={{
                opacity: clockConfig.opacity,
                textShadow: glowShadow,
                transform: `scale(${clockConfig.scale})`,
              }}
            >
              <AnimatedDigit char={sessMins[0]} />
              <AnimatedDigit char={sessMins[1]} />
              <span className="mx-1.5 opacity-45 animate-pulse">:</span>
              <AnimatedDigit char={sessSecs[0]} />
              <AnimatedDigit char={sessSecs[1]} />
            </div>

            {/* Session Phase Label */}
            <div className="mt-7 text-[11px] tracking-[0.28em] text-[#92949A] uppercase font-medium">
              {isBreakPhase
                ? 'RESTORATIVE BREAK'
                : timerMode === 'pomodoro'
                ? 'POMODORO FOCUS'
                : timerMode === 'deep'
                ? 'DEEP FOCUS'
                : timerMode === 'long'
                ? 'EXTENDED IMMERSION'
                : timerMode === 'stopwatch'
                ? 'OPEN FLOW'
                : 'CUSTOM FOCUS'}
            </div>

            {/* Single Focus Task */}
            {activeTask && (
              <div className="mt-3 text-lg md:text-xl font-light text-[#F5F2EA]/90 tracking-tight max-w-md text-balance">
                {activeTask.title}
              </div>
            )}

            {/* Thin Luminous Progress Line */}
            <div className="mt-8 w-56 md:w-72 h-[1.5px] bg-[#F5F2EA]/12 relative overflow-hidden rounded-full">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  backgroundColor: '#F5F2EA',
                  boxShadow: `0 0 12px ${accentColor}`,
                }}
                animate={{ width: `${Math.max(2, progressRatio * 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>

            {/* Subtle Session Controls */}
            <div
              className={`mt-9 flex items-center gap-6 transition-opacity duration-700 ${
                controlsVisible || isSessionPaused ? 'opacity-100' : 'opacity-25 hover:opacity-100'
              }`}
            >
              <button
                onClick={() => auraActions.togglePauseSession()}
                className="px-5 py-2 text-xs tracking-[0.24em] uppercase text-[#F5F2EA]/80 hover:text-[#F5F2EA] border border-[#F5F2EA]/15 hover:border-[#F5F2EA]/35 rounded-full transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                {isSessionPaused ? 'RESUME' : 'PAUSE'}
              </button>

              {isSessionPaused && (
                <>
                  <button
                    onClick={() => auraActions.completeCurrentSession()}
                    className="px-4 py-2 text-xs tracking-[0.2em] uppercase text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    FINISH EARLY
                  </button>
                  <button
                    onClick={() => auraActions.resetSession()}
                    aria-label="Reset session"
                    className="p-2 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          /* MAIN AMBIENT CLOCK VIEW */
          <motion.div
            key={`clock-${clockConfig.style}`}
            initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
            style={{
              opacity: clockConfig.opacity,
              transform: `scale(${clockConfig.scale})`,
            }}
          >
            {/* Clock Style Variants */}
            {clockConfig.style === 'analog' ? (
              <div className="relative w-52 h-52 md:w-64 md:h-64 flex items-center justify-center my-2">
                <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
                  {/* Outer Architectural Dial Ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke="rgba(245, 242, 234, 0.14)"
                    strokeWidth="1"
                  />
                  {/* 12 Hour Markers */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const angle = (i * 30 * Math.PI) / 180;
                    const r1 = i % 3 === 0 ? 80 : 85;
                    const r2 = 90;
                    return (
                      <line
                        key={i}
                        x1={100 + Math.sin(angle) * r1}
                        y1={100 - Math.cos(angle) * r1}
                        x2={100 + Math.sin(angle) * r2}
                        y2={100 - Math.cos(angle) * r2}
                        stroke={i % 3 === 0 ? 'rgba(245, 242, 234, 0.65)' : 'rgba(245, 242, 234, 0.25)'}
                        strokeWidth={i % 3 === 0 ? '1.5' : '1'}
                      />
                    );
                  })}
                  {/* Hour Hand */}
                  <line
                    x1="100"
                    y1="100"
                    x2={100 + Math.sin(((rawHours % 12 + now.getMinutes() / 60) * 30 * Math.PI) / 180) * 50}
                    y2={100 - Math.cos(((rawHours % 12 + now.getMinutes() / 60) * 30 * Math.PI) / 180) * 50}
                    stroke="#F5F2EA"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Minute Hand */}
                  <line
                    x1="100"
                    y1="100"
                    x2={100 + Math.sin(((now.getMinutes() + now.getSeconds() / 60) * 6 * Math.PI) / 180) * 72}
                    y2={100 - Math.cos(((now.getMinutes() + now.getSeconds() / 60) * 6 * Math.PI) / 180) * 72}
                    stroke="#F5F2EA"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  {/* Second Hand */}
                  {clockConfig.showSeconds && (
                    <line
                      x1="100"
                      y1="108"
                      x2={100 + Math.sin((now.getSeconds() * 6 * Math.PI) / 180) * 78}
                      y2={100 - Math.cos((now.getSeconds() * 6 * Math.PI) / 180) * 78}
                      stroke={accentColor}
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  )}
                  <circle cx="100" cy="100" r="3" fill="#F5F2EA" />
                </svg>
              </div>
            ) : clockConfig.style === 'flip' ? (
              <div className="flex items-center gap-3 md:gap-5 my-1">
                <div className="relative px-5 py-4 md:px-7 md:py-5 bg-[#101114]/80 border border-[#F5F2EA]/10 rounded-xl backdrop-blur-md shadow-2xl">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#08090B]/80 z-10" />
                  <div className={`font-clock-mono text-[clamp(3.2rem,8vw,6.2rem)] leading-none ${weightClass} text-[#F5F2EA]`}>
                    <AnimatedDigit char={hoursStr[0]} />
                    <AnimatedDigit char={hoursStr[1]} />
                  </div>
                </div>
                <div className="relative px-5 py-4 md:px-7 md:py-5 bg-[#101114]/80 border border-[#F5F2EA]/10 rounded-xl backdrop-blur-md shadow-2xl">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#08090B]/80 z-10" />
                  <div className={`font-clock-mono text-[clamp(3.2rem,8vw,6.2rem)] leading-none ${weightClass} text-[#F5F2EA]`}>
                    <AnimatedDigit char={minutesStr[0]} />
                    <AnimatedDigit char={minutesStr[1]} />
                  </div>
                </div>
                {clockConfig.showSeconds && (
                  <div className="hidden sm:flex relative px-3.5 py-3 bg-[#101114]/65 border border-[#F5F2EA]/8 rounded-lg self-end mb-1">
                    <div className="font-clock-mono text-xl md:text-2xl font-light text-[#92949A]">
                      <AnimatedDigit char={secondsStr[0]} />
                      <AnimatedDigit char={secondsStr[1]} />
                    </div>
                  </div>
                )}
              </div>
            ) : clockConfig.style === 'word' ? (
              <div className="max-w-2xl px-4 py-4">
                <div
                  className="font-ui text-[clamp(1.75rem,4vw,3.25rem)] font-light tracking-[0.14em] text-[#F5F2EA] leading-tight uppercase text-balance"
                  style={{ textShadow: glowShadow }}
                >
                  {numberToWords(rawHours, now.getMinutes()).main}
                </div>
                <div className="mt-2 text-xs tracking-[0.32em] text-[#92949A] uppercase">
                  {numberToWords(rawHours, now.getMinutes()).sub}
                </div>
              </div>
            ) : clockConfig.style === 'typography' ? (
              <div className="flex flex-col items-center leading-[0.86]">
                <div
                  className="font-ui text-[clamp(4.5rem,11vw,8.5rem)] font-light tracking-[-0.06em] text-[#F5F2EA]"
                  style={{ textShadow: glowShadow }}
                >
                  <AnimatedDigit char={hoursStr[0]} />
                  <AnimatedDigit char={hoursStr[1]} />
                </div>
                <div
                  className="font-clock-serif italic text-[clamp(4.5rem,11vw,8.5rem)] font-light tracking-[-0.04em] text-[#F5F2EA]/75 -mt-2"
                  style={{ textShadow: glowShadow }}
                >
                  <AnimatedDigit char={minutesStr[0]} />
                  <AnimatedDigit char={minutesStr[1]} />
                </div>
              </div>
            ) : (
              /* Default 'minimal' (Mono/Sans) or 'serif' (Cormorant Garamond) */
              <div
                className={`${
                  clockConfig.style === 'serif' ? 'font-clock-serif' : 'font-clock-mono'
                } text-[clamp(4.5rem,12vw,9.2rem)] leading-none ${weightClass} ${trackingClass} text-[#F5F2EA] flex items-baseline justify-center`}
                style={{ textShadow: glowShadow }}
              >
                <AnimatedDigit char={hoursStr[0]} />
                <AnimatedDigit char={hoursStr[1]} />
                <span className="mx-1.5 opacity-40">:</span>
                <AnimatedDigit char={minutesStr[0]} />
                <AnimatedDigit char={minutesStr[1]} />
                {clockConfig.showSeconds && (
                  <span className="ml-3 text-[clamp(1.25rem,3vw,2.25rem)] text-[#92949A] font-light tracking-normal">
                    <AnimatedDigit char={secondsStr[0]} />
                    <AnimatedDigit char={secondsStr[1]} />
                  </span>
                )}
              </div>
            )}

            {/* Date & Weekday Sub-row */}
            {(clockConfig.showWeekday || clockConfig.showDate) && (
              <div className="mt-5 flex flex-col items-center gap-1">
                {clockConfig.showWeekday && (
                  <span className="text-[11px] md:text-xs tracking-[0.34em] text-[#F5F2EA]/75 font-normal">
                    {weekdayStr}
                  </span>
                )}
                {clockConfig.showDate && (
                  <span className="text-[11px] tracking-[0.26em] text-[#92949A] font-light">
                    {dateStr}
                  </span>
                )}
              </div>
            )}

            {/* Subtle Current Focus State & Quick Start below Clock (Hidden in pure Ambient Mode or when user is inactive) */}
            {!isAmbientMode && widgets.taskPill && (
              <motion.div
                initial={false}
                animate={{
                  opacity: controlsVisible ? 1 : 0,
                  y: controlsVisible ? 0 : 6,
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`mt-9 flex flex-col items-center gap-3.5 ${
                  controlsVisible ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
              >
                {editingTask ? (
                  <form onSubmit={handleTaskSubmit} className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={taskDraft}
                      onChange={(e) => setTaskDraft(e.target.value)}
                      onBlur={() => setEditingTask(false)}
                      placeholder="One moment. One task..."
                      className="bg-[#101114]/85 border border-[#F5F2EA]/20 rounded-lg px-3.5 py-1.5 text-xs text-[#F5F2EA] placeholder-[#92949A] focus:outline-none focus:border-[#F5F2EA]/45 w-64 text-center"
                    />
                  </form>
                ) : (
                  <div className="flex items-center gap-3 text-xs text-[#92949A]">
                    {activeTask ? (
                      <>
                        <button
                          onClick={() => auraActions.toggleTaskComplete(activeTask.id)}
                          aria-label="Complete current task"
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                            activeTask.completed
                              ? 'bg-[#F5F2EA]/20 border-[#F5F2EA]/50 text-[#F5F2EA]'
                              : 'border-[#F5F2EA]/25 hover:border-[#F5F2EA]/60'
                          }`}
                        >
                          {activeTask.completed && <Check className="w-2.5 h-2.5" />}
                        </button>
                        <button
                          onClick={() => {
                            setTaskDraft(activeTask.title);
                            setEditingTask(true);
                          }}
                          className={`hover:text-[#F5F2EA] transition-colors cursor-pointer ${
                            activeTask.completed ? 'line-through opacity-50' : 'text-[#F5F2EA]/85'
                          }`}
                        >
                          {activeTask.title}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingTask(true)}
                        className="flex items-center gap-1.5 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Set one focus intention</span>
                      </button>
                    )}
                    <span aria-hidden="true" className="opacity-35">
                      ·
                    </span>
                    <span className="tabular-nums text-[#92949A]">
                      {timerMode === 'stopwatch' ? 'Stopwatch' : `${workMinutes}m session`}
                    </span>
                  </div>
                )}

                {/* Enter Focus CTA */}
                <button
                  onClick={() => auraActions.startSession()}
                  className="group flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#F5F2EA]/[0.06] hover:bg-[#F5F2EA]/[0.12] border border-[#F5F2EA]/12 hover:border-[#F5F2EA]/28 text-[11px] tracking-[0.24em] uppercase text-[#F5F2EA] transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Play className="w-3 h-3 fill-current opacity-80 group-hover:scale-110 transition-transform" />
                  <span>Start Focus</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
