import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, Compass, Play, Sparkles, Wand2, X } from 'lucide-react';
import { ClockStyle, SCENES, SceneId, SOUND_CHANNELS } from '../../data/scenesAndSounds';
import { auraActions, useAuraStore } from '../../store/useAuraStore';

interface DirectorConfigResult {
  title: string;
  taskName: string;
  sessionsCount: number;
  workMinutes: number;
  breakMinutes: number;
  sceneId: SceneId;
  soundMix: Array<{ soundId: string; volume: number }>;
  visualIntensity: string;
  clockStyle: ClockStyle;
  directorNote: string;
}

interface AtmosphereResult {
  name: string;
  subtitle: string;
  baseSceneId: SceneId;
  accentColor: string;
  fogIntensity: number;
  particleIntensity: number;
  lightWarmth: number;
  clockStyle: ClockStyle;
  soundMix: Array<{ soundId: string; volume: number }>;
}

interface PlannerResult {
  planTitle: string;
  totalDurationLabel: string;
  blocks: Array<{
    timeRange: string;
    label: string;
    type: 'focus' | 'break' | string;
    durationMinutes: number;
    recommendedSceneId: SceneId;
  }>;
}

export const AIDirectorPanel: React.FC = () => {
  const { sessionsHistory } = useAuraStore();
  const [mode, setMode] = useState<'director' | 'atmosphere' | 'planner'>('director');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [directorResult, setDirectorResult] = useState<DirectorConfigResult | null>(null);
  const [atmosphereResult, setAtmosphereResult] = useState<AtmosphereResult | null>(null);
  const [plannerResult, setPlannerResult] = useState<PlannerResult | null>(null);

  // Adaptive Focus calculation based on user's session history
  const usualMinutes =
    sessionsHistory.length > 0
      ? Math.round(
          sessionsHistory.reduce((acc, s) => acc + s.durationMinutes, 0) / sessionsHistory.length
        )
      : 50;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'GOOD MORNING.' : hour < 18 ? 'GOOD AFTERNOON.' : 'GOOD EVENING.';

  const handleGenerate = async (customPrompt?: string) => {
    const query = (customPrompt ?? prompt).trim();
    if (!query) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const endpoint =
        mode === 'director'
          ? '/api/aura/director'
          : mode === 'atmosphere'
          ? '/api/aura/atmosphere'
          : '/api/aura/planner';

      const nowStr = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, currentTime: nowStr }),
      });

      if (!res.ok) {
        throw new Error('Unable to reach AURA configuration service.');
      }

      const data = await res.json();
      if (mode === 'director') {
        setDirectorResult(data);
      } else if (mode === 'atmosphere') {
        setAtmosphereResult(data);
      } else {
        setPlannerResult(data);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to generate configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-4 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-40 w-auto md:w-[740px] max-h-[78vh] flex flex-col rounded-2xl bg-[#101114]/94 border border-[#F5F2EA]/10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F2EA]/8">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-xs tracking-[0.24em] uppercase text-[#F5F2EA] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C88A55]" />
            <span>AURA Intelligence</span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#08090B]/70 rounded-lg border border-[#F5F2EA]/6">
            {(
              [
                { id: 'director', label: 'Focus Director' },
                { id: 'atmosphere', label: 'Atmosphere Generator' },
                { id: 'planner', label: 'Session Planner' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setMode(tab.id);
                  setErrorMessage(null);
                }}
                className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  mode === tab.id
                    ? 'bg-[#F5F2EA]/14 text-[#F5F2EA] font-medium'
                    : 'text-[#92949A] hover:text-[#F5F2EA]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => auraActions.setActiveModal(null)}
          aria-label="Close AI Director"
          className="p-1.5 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto space-y-6">
        {/* Adaptive Focus Quick Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#08090B]/60 border border-[#F5F2EA]/8">
          <div>
            <div className="text-[10px] tracking-[0.24em] text-[#92949A] uppercase">
              {greeting} · ADAPTIVE FOCUS
            </div>
            <div className="mt-1 text-sm text-[#F5F2EA]">
              Your usual environment is ready: <span className="font-medium">Midnight Rain</span> ·{' '}
              <span className="tabular-nums">{usualMinutes}-minute session</span>
            </div>
          </div>
          <button
            onClick={() => {
              auraActions.setScene('rainy-night', true);
              auraActions.setTimerMode('custom', usualMinutes, 10);
              auraActions.startSession();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5F2EA] text-[#08090B] text-xs font-medium tracking-[0.16em] uppercase hover:bg-[#F5F2EA]/90 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Start</span>
          </button>
        </div>

        {/* Prompt Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="space-y-3"
        >
          <label className="block text-xs text-[#92949A]">
            {mode === 'director'
              ? 'Describe what you are working on and how long you want to focus:'
              : mode === 'atmosphere'
              ? 'Describe a place, time, weather, or memory to synthesize into a scene:'
              : 'Describe your available time and subjects for a structured schedule:'}
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#08090B]/90 border border-[#F5F2EA]/12 focus-within:border-[#F5F2EA]/35 transition-colors">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'director'
                  ? 'e.g., I need to study chemistry for three hours.'
                  : mode === 'atmosphere'
                  ? "e.g., Studying alone in Tokyo at 2 AM while it's raining."
                  : 'e.g., I have an exam tomorrow and 4 hours tonight for Physics, Math, and Chemistry.'
              }
              className="flex-1 bg-transparent px-3 py-1.5 text-sm text-[#F5F2EA] placeholder-[#92949A]/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5F2EA]/12 hover:bg-[#F5F2EA]/20 text-xs tracking-[0.16em] uppercase text-[#F5F2EA] transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <span>{loading ? 'Synthesizing...' : 'Configure'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Example Prompts */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#92949A]">
            <span>Examples:</span>
            {(mode === 'director'
              ? [
                  'I need to study chemistry for three hours.',
                  'Deep Rust systems coding for 90 minutes.',
                  'Read philosophy quietly for an hour.',
                ]
              : mode === 'atmosphere'
              ? [
                  "Studying alone in Tokyo at 2 AM while it's raining.",
                  'Warm wooden cabin in Norway during a snowstorm.',
                  'Orbital observatory drifting past a deep violet nebula.',
                ]
              : [
                  'I have an exam tomorrow and 4 hours tonight.',
                  '3 hours of architecture thesis drafting and review.',
                ]
            ).map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setPrompt(sample);
                  handleGenerate(sample);
                }}
                className="text-left underline decoration-[#F5F2EA]/20 hover:decoration-[#F5F2EA]/60 hover:text-[#F5F2EA] transition-colors cursor-pointer"
              >
                “{sample}”
              </button>
            ))}
          </div>
        </form>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#16181C] border border-[#E11D48]/30 text-xs text-[#F5F2EA]/85">
            {errorMessage}
          </div>
        )}

        {/* VISUAL OUTPUT 1: AI FOCUS DIRECTOR */}
        {mode === 'director' && directorResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-[#08090B]/80 border border-[#F5F2EA]/14 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F2EA]/8 pb-4">
              <div>
                <div className="text-[10px] tracking-[0.26em] text-[#C88A55] uppercase">
                  AI FOCUS DIRECTOR CONFIGURATION
                </div>
                <h3 className="mt-1 text-lg font-medium text-[#F5F2EA] tracking-tight">
                  {directorResult.title}
                </h3>
                <p className="mt-1 text-xs text-[#92949A]">{directorResult.directorNote}</p>
              </div>
              <button
                onClick={() =>
                  auraActions.applyAIDirectorConfig({
                    taskName: directorResult.taskName,
                    workMinutes: directorResult.workMinutes,
                    breakMinutes: directorResult.breakMinutes,
                    sceneId: directorResult.sceneId,
                    soundMix: directorResult.soundMix,
                    clockStyle: directorResult.clockStyle,
                    autoStart: true,
                  })
                }
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#F5F2EA] text-[#08090B] text-xs font-semibold tracking-[0.18em] uppercase hover:bg-[#F5F2EA]/90 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Session</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-[#92949A]">Cadence</div>
                <div className="mt-1 text-[#F5F2EA] font-medium tabular-nums">
                  {directorResult.sessionsCount} × {directorResult.workMinutes}m ({directorResult.breakMinutes}m breaks)
                </div>
              </div>
              <div>
                <div className="text-[#92949A]">Scene</div>
                <div className="mt-1 text-[#F5F2EA] font-medium">
                  {SCENES.find((s) => s.id === directorResult.sceneId)?.name || 'Dark Library'}
                </div>
              </div>
              <div>
                <div className="text-[#92949A]">Audio Layers</div>
                <div className="mt-1 text-[#F5F2EA] font-medium">
                  {directorResult.soundMix
                    .map((m) => SOUND_CHANNELS.find((c) => c.id === m.soundId)?.name.split(' ')[0] || m.soundId)
                    .join(' + ')}
                </div>
              </div>
              <div>
                <div className="text-[#92949A]">Clock & Intensity</div>
                <div className="mt-1 text-[#F5F2EA] font-medium capitalize">
                  {directorResult.clockStyle} · {directorResult.visualIntensity}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VISUAL OUTPUT 2: AI ATMOSPHERE GENERATOR */}
        {mode === 'atmosphere' && atmosphereResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl border border-[#F5F2EA]/14 space-y-5 relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at 85% 20%, ${atmosphereResult.accentColor}30 0%, rgba(8,9,11,0.92) 75%)`,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] tracking-[0.26em] text-[#92949A] uppercase">
                  GENERATED ATMOSPHERE PROFILE
                </div>
                <h3 className="mt-1 text-lg font-medium text-[#F5F2EA]">{atmosphereResult.name}</h3>
                <p className="mt-0.5 text-xs text-[#92949A]">{atmosphereResult.subtitle}</p>
              </div>
              <button
                onClick={() => {
                  auraActions.applyAIDirectorConfig({
                    taskName: '',
                    workMinutes: 50,
                    breakMinutes: 10,
                    sceneId: atmosphereResult.baseSceneId,
                    soundMix: atmosphereResult.soundMix,
                    clockStyle: atmosphereResult.clockStyle,
                    accentColor: atmosphereResult.accentColor,
                    fogIntensity: atmosphereResult.fogIntensity,
                    particleIntensity: atmosphereResult.particleIntensity,
                    lightWarmth: atmosphereResult.lightWarmth,
                    autoStart: false,
                  });
                  auraActions.setActiveModal(null);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F5F2EA] text-[#08090B] text-xs font-semibold tracking-[0.18em] uppercase hover:bg-[#F5F2EA]/90 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Enter Atmosphere</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#F5F2EA]/10 text-xs">
              <div>
                <span className="text-[#92949A]">Fog Density</span>
                <div className="mt-1 font-clock-mono text-[#F5F2EA] tabular-nums">
                  {atmosphereResult.fogIntensity}%
                </div>
              </div>
              <div>
                <span className="text-[#92949A]">Particles</span>
                <div className="mt-1 font-clock-mono text-[#F5F2EA] tabular-nums">
                  {atmosphereResult.particleIntensity}%
                </div>
              </div>
              <div>
                <span className="text-[#92949A]">Light Warmth</span>
                <div className="mt-1 font-clock-mono text-[#F5F2EA] tabular-nums">
                  {atmosphereResult.lightWarmth}%
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VISUAL OUTPUT 3: AI SESSION PLANNER */}
        {mode === 'planner' && plannerResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl bg-[#08090B]/80 border border-[#F5F2EA]/14 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F5F2EA]/8 pb-3">
              <div>
                <div className="text-[10px] tracking-[0.24em] text-[#92949A] uppercase">
                  CHRONOLOGICAL SESSION ARCHITECTURE
                </div>
                <h3 className="text-base font-medium text-[#F5F2EA] mt-0.5">
                  {plannerResult.planTitle}
                </h3>
              </div>
              <span className="text-xs text-[#92949A] tabular-nums">
                {plannerResult.totalDurationLabel}
              </span>
            </div>

            <div className="space-y-2">
              {plannerResult.blocks.map((block, idx) => {
                const isBreak = block.type === 'break';
                const scene = SCENES.find((s) => s.id === block.recommendedSceneId) || SCENES[0];
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-[#101114]/80 border border-[#F5F2EA]/6"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-clock-mono text-xs text-[#92949A] tabular-nums w-28 shrink-0">
                        {block.timeRange}
                      </span>
                      <div>
                        <div className="text-xs font-medium text-[#F5F2EA]">{block.label}</div>
                        <div className="text-[11px] text-[#92949A]">
                          {scene.name} · {block.durationMinutes} min
                        </div>
                      </div>
                    </div>
                    {!isBreak && (
                      <button
                        onClick={() => {
                          auraActions.addTask(block.label);
                          auraActions.setScene(scene.id, true);
                          auraActions.setTimerMode('custom', block.durationMinutes, 10);
                          auraActions.startSession();
                        }}
                        className="px-3 py-1.5 rounded-md bg-[#F5F2EA]/10 hover:bg-[#F5F2EA]/20 text-[11px] tracking-[0.14em] uppercase text-[#F5F2EA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Launch
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
