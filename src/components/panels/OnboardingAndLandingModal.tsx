import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Compass, Play, X } from 'lucide-react';
import { SCENES, SceneId } from '../../data/scenesAndSounds';
import { auraActions, TimerMode, useAuraStore } from '../../store/useAuraStore';

export const OnboardingAndLandingModal: React.FC = () => {
  const { activeModal, activeSceneId, workMinutes } = useAuraStore();
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState('Deep Work');

  if (activeModal !== 'onboarding' && activeModal !== 'landing') return null;

  if (activeModal === 'landing') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 bg-[#08090B]/95 backdrop-blur-2xl overflow-y-auto px-6 py-12 md:px-16 select-none"
      >
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <span className="text-sm tracking-[0.36em] uppercase text-[#F5F2EA]">AURA</span>
            <button
              onClick={() => auraActions.setActiveModal(null)}
              className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#92949A] hover:text-[#F5F2EA] cursor-pointer"
            >
              <span>Return to Sanctuary</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Split-Screen Editorial Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch pt-6">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <div className="text-xs tracking-[0.3em] uppercase text-[#92949A]">
                  ARCHITECTURAL FOCUS SANCTUARY
                </div>
                <h1 className="font-clock-serif text-[clamp(2.75rem,5.5vw,4.75rem)] font-light leading-[1.04] tracking-tight text-[#F5F2EA] text-balance">
                  A place to focus.
                </h1>
                <p className="text-base md:text-lg text-[#92949A] font-light leading-relaxed max-w-xl">
                  An ambient digital environment designed for deep work, study, reading, and
                  stillness. When you stop touching the controls, everything recedes except the
                  atmosphere and time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => auraActions.setActiveModal(null)}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#F5F2EA] text-[#08090B] text-xs font-semibold tracking-[0.22em] uppercase hover:bg-[#F5F2EA]/90 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Enter AURA</span>
                </button>
                <button
                  onClick={() => auraActions.setActiveModal('scenes')}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#101114] border border-[#F5F2EA]/15 hover:border-[#F5F2EA]/35 text-xs tracking-[0.22em] uppercase text-[#F5F2EA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Explore Atmospheres</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#F5F2EA]/12 bg-[#101114] relative min-h-[300px]">
              <img
                src="/src/assets/images/scene_midnight_cafe_1791901424509.jpg"
                alt="Midnight Cafe Sanctuary"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="text-[10px] tracking-[0.26em] text-[#92949A] uppercase">
                  FEATURED ATMOSPHERE · KYOTO
                </div>
                <div className="mt-1 font-clock-serif text-2xl text-[#F5F2EA]">Midnight Cafe</div>
              </div>
            </div>
          </div>

          {/* 3-Column Editorial Monograph Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-[#F5F2EA]/10">
            <div className="space-y-2">
              <div className="text-xs tracking-[0.22em] text-[#92949A]">01. LIVING SCENES</div>
              <h3 className="text-base font-medium text-[#F5F2EA]">Volumetric Depth & Parallax</h3>
              <p className="text-xs text-[#92949A] leading-relaxed">
                Eight curated nocturnal worlds—from Tokyo rain at 2 AM to an Oxford study—with
                multi-layered fog, 35mm grain, and subtle camera drift.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-xs tracking-[0.22em] text-[#92949A]">02. SPATIAL AUDIO</div>
              <h3 className="text-base font-medium text-[#F5F2EA]">Procedural Web Audio Engine</h3>
              <p className="text-xs text-[#92949A] leading-relaxed">
                Eighteen independent synthesis and acoustic channels with stereo field panning,
                exponential crossfades, and harmonic session cues.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-xs tracking-[0.22em] text-[#92949A]">03. FOCUS GALAXY</div>
              <h3 className="text-base font-medium text-[#F5F2EA]">Constellation of Attention</h3>
              <p className="text-xs text-[#92949A] leading-relaxed">
                Every completed session becomes a star in your personal Focus Galaxy. Local-first
                by design—no account required.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#08090B]/92 backdrop-blur-2xl flex flex-col items-center justify-center p-6 select-none"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#101114]/90 border border-[#F5F2EA]/12 p-8 shadow-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center space-y-6 py-4"
            >
              <div className="text-xs tracking-[0.34em] uppercase text-[#92949A]">AURA</div>
              <h2 className="font-clock-serif text-4xl font-light text-[#F5F2EA]">
                Welcome to AURA.
              </h2>
              <p className="text-sm text-[#92949A] leading-relaxed max-w-sm mx-auto">
                A quiet digital room designed for focus, study, reading, and unhurried presence.
              </p>
              <div className="pt-4 flex flex-col items-center gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#F5F2EA] text-[#08090B] text-xs font-medium tracking-[0.2em] uppercase cursor-pointer"
                >
                  <span>Begin Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => auraActions.completeOnboarding()}
                  className="text-xs text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                >
                  Continue without account
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="text-[10px] tracking-[0.26em] uppercase text-[#92949A]">
                  STEP 1 OF 3
                </div>
                <h3 className="mt-1 font-clock-serif text-3xl text-[#F5F2EA]">
                  What are you here for?
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['Study', 'Work', 'Coding', 'Reading', 'Relaxing', 'Sleep'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setPurpose(item);
                      setStep(3);
                    }}
                    className={`p-3.5 rounded-xl border text-xs tracking-[0.16em] uppercase transition-colors cursor-pointer ${
                      purpose === item
                        ? 'bg-[#F5F2EA]/14 border-[#F5F2EA]/35 text-[#F5F2EA]'
                        : 'bg-[#08090B]/60 border-[#F5F2EA]/8 text-[#92949A] hover:text-[#F5F2EA]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="text-[10px] tracking-[0.26em] uppercase text-[#92949A]">
                  STEP 2 OF 3
                </div>
                <h3 className="mt-1 font-clock-serif text-3xl text-[#F5F2EA]">
                  Choose your atmosphere.
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { id: 'rainy-night', label: 'Rainy Night' },
                    { id: 'deep-forest', label: 'Deep Forest' },
                    { id: 'moonlit-ocean', label: 'Moonlit Ocean' },
                    { id: 'midnight-cafe', label: 'Midnight Cafe' },
                    { id: 'dark-library', label: 'Dark Library' },
                    { id: 'deep-space', label: 'Deep Space' },
                  ] as Array<{ id: SceneId; label: string }>
                ).map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      auraActions.setScene(sc.id, true);
                      setStep(4);
                    }}
                    className={`p-3.5 rounded-xl border text-xs tracking-[0.14em] uppercase transition-colors cursor-pointer ${
                      activeSceneId === sc.id
                        ? 'bg-[#F5F2EA]/14 border-[#F5F2EA]/35 text-[#F5F2EA]'
                        : 'bg-[#08090B]/60 border-[#F5F2EA]/8 text-[#92949A] hover:text-[#F5F2EA]'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="text-[10px] tracking-[0.26em] uppercase text-[#92949A]">
                  STEP 3 OF 3
                </div>
                <h3 className="mt-1 font-clock-serif text-3xl text-[#F5F2EA]">
                  Choose your focus style.
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { mode: 'pomodoro', label: '25m · Pomodoro' },
                    { mode: 'deep', label: '50m · Deep Focus' },
                    { mode: 'long', label: '90m · Extended' },
                    { mode: 'stopwatch', label: 'Open Stopwatch' },
                  ] as Array<{ mode: TimerMode; label: string }>
                ).map((tm) => (
                  <button
                    key={tm.mode}
                    onClick={() => {
                      auraActions.setTimerMode(tm.mode);
                      auraActions.completeOnboarding();
                    }}
                    className="p-3.5 rounded-xl border bg-[#08090B]/60 border-[#F5F2EA]/10 hover:border-[#F5F2EA]/35 text-xs tracking-[0.14em] uppercase text-[#F5F2EA] transition-colors cursor-pointer"
                  >
                    {tm.label}
                  </button>
                ))}
              </div>
              <div className="text-center pt-2">
                <button
                  onClick={() => auraActions.completeOnboarding()}
                  className="text-xs text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
                >
                  Enter Sanctuary ({workMinutes}m default)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
