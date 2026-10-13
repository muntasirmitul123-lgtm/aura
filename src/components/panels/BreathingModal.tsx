import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { SCENES } from '../../data/scenesAndSounds';
import { audioEngine } from '../../engine/audioEngine';
import { auraActions, useAuraStore } from '../../store/useAuraStore';

type BreathPatternId = 'box' | '4-7-8' | 'coherent';

interface BreathPattern {
  id: BreathPatternId;
  name: string;
  subtitle: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

const PATTERNS: BreathPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    subtitle: '4s Inhale · 4s Hold · 4s Exhale · 4s Hold',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
  },
  {
    id: '4-7-8',
    name: '4-7-8 Tranquility',
    subtitle: '4s Inhale · 7s Hold · 8s Exhale',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
  },
  {
    id: 'coherent',
    name: '4-4 Coherent Resonance',
    subtitle: '4s Inhale · 4s Exhale continuous wave',
    inhale: 4,
    holdIn: 0,
    exhale: 4,
    holdOut: 0,
  },
];

export const BreathingModal: React.FC = () => {
  const { activeSceneId, customAccentOverride } = useAuraStore();
  const [patternId, setPatternId] = useState<BreathPatternId>('box');
  const [phase, setPhase] = useState<'INHALE' | 'HOLD' | 'EXHALE' | 'REST'>('INHALE');
  const [phaseDuration, setPhaseDuration] = useState(4);
  const [secondsLeft, setSecondsLeft] = useState(4);

  const currentScene = SCENES.find((s) => s.id === activeSceneId) || SCENES[0];
  const accentColor = customAccentOverride || currentScene.accentColor;
  const pattern = PATTERNS.find((p) => p.id === patternId) || PATTERNS[0];

  useEffect(() => {
    let isMounted = true;
    let timeoutId: number;

    const runPhase = (nextPhase: 'INHALE' | 'HOLD' | 'EXHALE' | 'REST') => {
      if (!isMounted) return;
      let dur = 4;
      if (nextPhase === 'INHALE') {
        dur = pattern.inhale;
        audioEngine.playHarmonicCue('inhale');
      } else if (nextPhase === 'HOLD') {
        dur = pattern.holdIn;
      } else if (nextPhase === 'EXHALE') {
        dur = pattern.exhale;
        audioEngine.playHarmonicCue('exhale');
      } else {
        dur = pattern.holdOut;
      }

      setPhase(nextPhase);
      setPhaseDuration(dur);
      setSecondsLeft(dur);

      timeoutId = window.setTimeout(() => {
        if (nextPhase === 'INHALE') {
          runPhase(pattern.holdIn > 0 ? 'HOLD' : 'EXHALE');
        } else if (nextPhase === 'HOLD') {
          runPhase('EXHALE');
        } else if (nextPhase === 'EXHALE') {
          runPhase(pattern.holdOut > 0 ? 'REST' : 'INHALE');
        } else {
          runPhase('INHALE');
        }
      }, dur * 1000);
    };

    runPhase('INHALE');
    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [pattern]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, pattern]);

  const orbScale =
    phase === 'INHALE' || phase === 'HOLD' ? 1.38 : 0.72;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="fixed inset-0 z-50 bg-[#08090B]/90 backdrop-blur-2xl flex flex-col items-center justify-between p-8 select-none"
    >
      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="text-xs tracking-[0.28em] uppercase text-[#92949A]">
          AURA · MEDITATIVE BREATHING SANCTUARY
        </div>
        <button
          onClick={() => auraActions.setActiveModal(null)}
          aria-label="Exit breathing mode"
          className="p-2 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Luminous Breathing Orb */}
      <div className="relative flex items-center justify-center my-auto w-80 h-80">
        {/* Outer Atmospheric Bloom */}
        <motion.div
          animate={{
            scale: orbScale * 1.15,
            opacity: phase === 'INHALE' || phase === 'HOLD' ? 0.55 : 0.2,
          }}
          transition={{ duration: phaseDuration, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${accentColor}75 0%, rgba(245,242,234,0.08) 55%, transparent 75%)`,
            filter: 'blur(28px)',
          }}
        />

        {/* Core Expanding/Contracting Orb */}
        <motion.div
          animate={{ scale: orbScale }}
          transition={{ duration: phaseDuration, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-48 h-48 rounded-full border border-[#F5F2EA]/25 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(245,242,234,0.12)]"
          style={{
            background: `radial-gradient(circle at 38% 32%, rgba(245,242,234,0.22), ${accentColor}33 55%, rgba(8,9,11,0.85) 100%)`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
              transition={{ duration: 0.35 }}
              className="text-sm tracking-[0.34em] uppercase text-[#F5F2EA] font-light"
            >
              {phase === 'REST' ? 'HOLD' : phase}
            </motion.span>
          </AnimatePresence>
          <span className="mt-2 font-clock-mono text-xs text-[#92949A] tabular-nums">
            {secondsLeft}s
          </span>
        </motion.div>
      </div>

      {/* Pattern Selector Footer */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#101114] border border-[#F5F2EA]/10">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPatternId(p.id)}
              className={`px-4 py-1.5 rounded-full text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                patternId === p.id
                  ? 'bg-[#F5F2EA]/15 text-[#F5F2EA] font-medium'
                  : 'text-[#92949A] hover:text-[#F5F2EA]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#92949A]">{pattern.subtitle}</p>
      </div>
    </motion.div>
  );
};
