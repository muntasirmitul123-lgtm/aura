import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CloudRain,
  Compass,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import { SCENES, SPARSE_QUOTES, WORLD_CITIES } from '../data/scenesAndSounds';
import { audioEngine } from '../engine/audioEngine';
import { auraActions, TimerMode, useAuraStore } from '../store/useAuraStore';

export const MiniWaveform: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isMuted, activeSounds } = useAuraStore();
  const hasActiveSounds = !isMuted && Object.keys(activeSounds).length > 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = new Uint8Array(32);
    let raf: number;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const active = audioEngine.getFrequencyData(data);

      const bars = 5;
      const barW = 2;
      const gap = 3;
      for (let i = 0; i < bars; i++) {
        const val = active ? data[i * 2 + 1] / 255 : 0;
        const syntheticWave = hasActiveSounds
          ? 0.25 + 0.35 * Math.sin(now * 0.004 + i * 1.1)
          : 0.12;
        const h = Math.max(2, Math.min(14, (val > 0.05 ? val : syntheticWave) * 14));
        const x = i * (barW + gap);
        const y = (canvas.height - h) / 2;
        ctx.fillStyle = hasActiveSounds ? 'rgba(245, 242, 234, 0.8)' : 'rgba(146, 148, 154, 0.35)';
        ctx.fillRect(x, y, barW, h);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [hasActiveSounds]);

  return <canvas ref={canvasRef} width={24} height={16} className="inline-block" />;
};

export const FloatingChrome: React.FC<{
  controlsVisible: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}> = ({ controlsVisible, onToggleFullscreen, isFullscreen }) => {
  const state = useAuraStore();
  const {
    activeSceneId,
    activeModal,
    isAmbientMode,
    isSessionActive,
    timerMode,
    workMinutes,
    isMuted,
    activeSounds,
    widgets,
    selectedCities,
    liveWeatherCondition,
  } = state;

  const [logoClicks, setLogoClicks] = useState(0);
  const [easterEggBanner, setEasterEggBanner] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [now, setNow] = useState(() => new Date());

  const currentScene = SCENES.find((s) => s.id === activeSceneId) || SCENES[0];
  const activeSoundCount = Object.keys(activeSounds).length;

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % SPARSE_QUOTES.length);
    }, 45000);
    return () => window.clearInterval(id);
  }, []);

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    if (next >= 5) {
      auraActions.unlockEasterEggScene();
      setEasterEggBanner(true);
      setLogoClicks(0);
      setTimeout(() => setEasterEggBanner(false), 4500);
    } else {
      setLogoClicks(next);
    }
  };

  const detectLiveAtmosphere = () => {
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour <= 6;
    const nextCond = liveWeatherCondition === 'rain' ? 'clear-night' : 'rain';
    auraActions.setLiveWeather(nextCond);
    if (nextCond === 'rain') {
      auraActions.setScene(isNight ? 'rainy-night' : 'deep-forest', true);
    } else {
      auraActions.setScene(isNight ? 'deep-space' : 'midnight-cafe', true);
    }
  };

  const showUI = controlsVisible || activeModal !== null;

  return (
    <>
      {/* TOP BAR CONTRACT — 3 Zones separated by gap-8 */}
      <header
        className={`fixed top-0 inset-x-0 z-30 flex items-center justify-between gap-8 px-6 md:px-10 py-6 transition-all duration-700 ${
          showUI ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={handleLogoClick}
          className="text-sm md:text-base font-medium tracking-[0.36em] text-[#F5F2EA] hover:text-[#F5F2EA]/80 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="AURA — A place to focus."
        >
          AURA
        </button>

        {/* Zone 2: 5 concise single-line navigation links */}
        {!isAmbientMode && (
          <nav className="hidden md:flex items-center gap-8 text-xs tracking-[0.16em] uppercase text-[#92949A]">
            <button
              onClick={() => auraActions.setActiveModal(activeModal === 'scenes' ? null : 'scenes')}
              className={`hover:text-[#F5F2EA] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b ${
                activeModal === 'scenes' ? 'text-[#F5F2EA] border-[#F5F2EA]/60' : 'border-transparent'
              }`}
            >
              Atmospheres
            </button>
            <button
              onClick={() => auraActions.setActiveModal(activeModal === 'sounds' ? null : 'sounds')}
              className={`hover:text-[#F5F2EA] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b ${
                activeModal === 'sounds' ? 'text-[#F5F2EA] border-[#F5F2EA]/60' : 'border-transparent'
              }`}
            >
              Soundscape
            </button>
            <button
              onClick={() => auraActions.setActiveModal(activeModal === 'director' ? null : 'director')}
              className={`hover:text-[#F5F2EA] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b ${
                activeModal === 'director' ? 'text-[#F5F2EA] border-[#F5F2EA]/60' : 'border-transparent'
              }`}
            >
              Director
            </button>
            <button
              onClick={() => auraActions.setActiveModal(activeModal === 'breathing' ? null : 'breathing')}
              className={`hover:text-[#F5F2EA] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b ${
                activeModal === 'breathing' ? 'text-[#F5F2EA] border-[#F5F2EA]/60' : 'border-transparent'
              }`}
            >
              Breathe
            </button>
            <button
              onClick={() => auraActions.setActiveModal(activeModal === 'stats' ? null : 'stats')}
              className={`hover:text-[#F5F2EA] transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-1 border-b ${
                activeModal === 'stats' ? 'text-[#F5F2EA] border-[#F5F2EA]/60' : 'border-transparent'
              }`}
            >
              Galaxy
            </button>
          </nav>
        )}

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => auraActions.setAmbientMode(!isAmbientMode)}
            className={`px-4 py-2 text-[11px] tracking-[0.2em] uppercase rounded-full border transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              isAmbientMode
                ? 'bg-[#F5F2EA] text-[#08090B] border-[#F5F2EA]'
                : 'bg-[#101114]/60 text-[#F5F2EA]/85 border-[#F5F2EA]/12 hover:border-[#F5F2EA]/30'
            }`}
          >
            {isAmbientMode ? 'Exit Ambient' : 'Ambient Mode'}
          </button>
        </div>
      </header>

      {/* Secret Easter Egg Unlock Notification */}
      <AnimatePresence>
        {easterEggBanner && (
          <motion.div
            initial={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-5 py-2 rounded-full bg-[#101114]/90 border border-[#D49B54]/40 text-xs tracking-[0.22em] uppercase text-[#F5F2EA]"
          >
            Secret Sanctuary Unlocked · Solaris Eclipse
          </motion.div>
        )}
      </AnimatePresence>

      {/* OPTIONAL WORLD CLOCK WIDGET (Top-Left Architectural Column) */}
      <AnimatePresence>
        {widgets.worldClock && !isSessionActive && (
          <motion.aside
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: controlsVisible ? 0.85 : 0.35, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex fixed left-10 top-28 z-20 flex-col gap-4 pointer-events-none select-none"
          >
            {WORLD_CITIES.filter((c) => selectedCities.includes(c.id)).map((city) => {
              let timeStr = '--:--';
              try {
                timeStr = now.toLocaleTimeString('en-GB', {
                  timeZone: city.timeZone,
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });
              } catch {}
              return (
                <div key={city.id} className="flex flex-col">
                  <span className="text-[10px] tracking-[0.26em] text-[#92949A] uppercase">
                    {city.name}
                  </span>
                  <span className="font-clock-mono text-sm text-[#F5F2EA] tabular-nums mt-0.5">
                    {timeStr}
                  </span>
                </div>
              );
            })}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* OPTIONAL LIVE WEATHER ATMOSPHERE WIDGET (Top-Right Below Header) */}
      <AnimatePresence>
        {widgets.weather && !isSessionActive && controlsVisible && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="hidden lg:flex fixed right-10 top-28 z-20 flex-col items-end gap-1.5"
          >
            <button
              onClick={detectLiveAtmosphere}
              className="flex items-center gap-2 text-xs text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
            >
              <CloudRain className="w-3.5 h-3.5 opacity-75" />
              <span>
                {liveWeatherCondition === 'rain'
                  ? 'Rain outside · Synced to Rainy Night'
                  : liveWeatherCondition === 'clear-night'
                  ? 'Clear nocturnal sky · Synced'
                  : 'Sync Live Local Atmosphere'}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OPTIONAL SPARSE QUOTE (Above Bottom Dock) */}
      <AnimatePresence mode="wait">
        {widgets.quote && !isSessionActive && !isAmbientMode && (
          <motion.div
            key={quoteIdx}
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: controlsVisible ? 0.55 : 0.22, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 1.4 }}
            className="fixed bottom-24 inset-x-0 z-10 text-center px-6 pointer-events-none select-none"
          >
            <p className="font-clock-serif italic text-sm md:text-base text-[#F5F2EA] tracking-wide">
              “{SPARSE_QUOTES[quoteIdx]}”
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBTLE BOTTOM ARCHITECTURAL CONTROL DOCK */}
      <div
        className={`fixed bottom-6 inset-x-0 z-30 flex justify-center px-4 transition-all duration-700 ${
          showUI ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 md:gap-5 px-4 md:px-6 py-2.5 rounded-full bg-[#101114]/80 border border-[#F5F2EA]/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.75)]">
          {/* Scene Switcher Trigger with Live Photographic Thumbnail Badge */}
          <button
            onClick={() => auraActions.setActiveModal(activeModal === 'scenes' ? null : 'scenes')}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-full text-xs text-[#F5F2EA]/90 hover:text-[#F5F2EA] transition-colors cursor-pointer whitespace-nowrap shrink-0 group"
            title="Choose Atmosphere (Shortcut: A)"
          >
            {currentScene.imageUrl ? (
              <span className="w-4 h-4 rounded-full overflow-hidden border border-[#F5F2EA]/35 inline-block shrink-0 group-hover:scale-110 transition-transform shadow-[0_0_8px_rgba(245,242,234,0.2)]">
                <img src={currentScene.imageUrl} alt="" className="w-full h-full object-cover" />
              </span>
            ) : (
              <Compass className="w-3.5 h-3.5 text-[#92949A]" />
            )}
            <span className="font-medium tracking-wide">{currentScene.name}</span>
            <span aria-hidden="true" className="hidden sm:inline text-[#92949A]/50">
              ·
            </span>
            <span className="hidden sm:inline text-[10px] tracking-[0.18em] text-[#92949A] uppercase">
              {currentScene.locationLabel.split('·')[0].trim()}
            </span>
          </button>

          <div className="h-3.5 w-[1px] bg-[#F5F2EA]/10" />

          {/* Sound Mixer Trigger + Breathing Waveform */}
          <button
            onClick={() => auraActions.setActiveModal(activeModal === 'sounds' ? null : 'sounds')}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-full text-xs text-[#F5F2EA]/85 hover:text-[#F5F2EA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Sound Mixer (Shortcut: S)"
          >
            {widgets.audioVisualizer ? <MiniWaveform /> : <Wind className="w-3.5 h-3.5 text-[#92949A]" />}
            <span className="hidden sm:inline">
              {isMuted ? 'Muted' : activeSoundCount > 0 ? `${activeSoundCount} Channels` : 'Silent'}
            </span>
          </button>

          {/* Timer Mode Segmented Selector (Hidden in Ambient Mode) */}
          {!isAmbientMode && (
            <>
              <div className="hidden md:block h-3.5 w-[1px] bg-[#F5F2EA]/10" />
              <div className="hidden md:flex items-center gap-1 bg-[#08090B]/60 p-1 rounded-full border border-[#F5F2EA]/6">
                {(
                  [
                    { mode: 'pomodoro', label: '25m' },
                    { mode: 'deep', label: '50m' },
                    { mode: 'long', label: '90m' },
                    { mode: 'stopwatch', label: 'Flow' },
                  ] as Array<{ mode: TimerMode; label: string }>
                ).map((item) => {
                  const active = timerMode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => auraActions.setTimerMode(item.mode)}
                      className={`px-2.5 py-1 rounded-full text-[11px] tabular-nums transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#F5F2EA]/14 text-[#F5F2EA] font-medium'
                          : 'text-[#92949A] hover:text-[#F5F2EA]'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="h-3.5 w-[1px] bg-[#F5F2EA]/10" />

          {/* AI Director Quick Trigger */}
          {!isAmbientMode && (
            <button
              onClick={() => auraActions.setActiveModal(activeModal === 'director' ? null : 'director')}
              aria-label="Open Focus Director"
              title="AI Focus Director & Atmosphere Generator"
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                activeModal === 'director' ? 'text-[#F5F2EA] bg-[#F5F2EA]/15' : 'text-[#92949A] hover:text-[#F5F2EA]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mute Toggle */}
          <button
            onClick={() => auraActions.toggleMute()}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            title="Mute / Unmute (Shortcut: M)"
            className="p-1.5 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => auraActions.setActiveModal(activeModal === 'settings' ? null : 'settings')}
            aria-label="Open Settings"
            title="Clock & Environment Settings"
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              activeModal === 'settings' ? 'text-[#F5F2EA] bg-[#F5F2EA]/15' : 'text-[#92949A] hover:text-[#F5F2EA]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Trigger */}
          <button
            onClick={onToggleFullscreen}
            aria-label="Toggle Fullscreen"
            title="Fullscreen (Shortcut: F)"
            className="p-1.5 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </>
  );
};
