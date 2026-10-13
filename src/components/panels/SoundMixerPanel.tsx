import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Headphones, RotateCcw, Sparkles, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { SCENES, SOUND_CHANNELS, SoundCategory } from '../../data/scenesAndSounds';
import { auraActions, useAuraStore } from '../../store/useAuraStore';

const CATEGORIES: Array<'Active' | SoundCategory> = [
  'Active',
  'Brainwaves',
  'Nature',
  'Environment',
  'Mechanical',
  'Noise',
  'Music',
];

interface WavePreset {
  id: string;
  label: string;
  hz: string;
  channelId: string;
  volume: number;
  companionSound: string;
  companionVol: number;
}

const BRAINWAVE_PRESETS: WavePreset[] = [
  {
    id: 'gamma-deep',
    label: '40Hz Gamma Peak Focus',
    hz: '40Hz',
    channelId: 'gamma-40hz',
    volume: 0.65,
    companionSound: 'brown-noise',
    companionVol: 0.35,
  },
  {
    id: 'gamma-pulse',
    label: '40Hz Strobe Synchronization',
    hz: '40Hz',
    channelId: 'gamma-strobe',
    volume: 0.55,
    companionSound: 'ambient-pad',
    companionVol: 0.3,
  },
  {
    id: 'beta-code',
    label: '20Hz Analytical Clarity',
    hz: '20Hz',
    channelId: 'beta-20hz',
    volume: 0.6,
    companionSound: 'rain',
    companionVol: 0.45,
  },
  {
    id: 'smr-calm',
    label: '14Hz SMR Alertness',
    hz: '14Hz',
    channelId: 'beta-14hz',
    volume: 0.58,
    companionSound: 'fireplace',
    companionVol: 0.3,
  },
  {
    id: 'alpha-effortless',
    label: '10Hz Alpha Flow State',
    hz: '10Hz',
    channelId: 'alpha-10hz',
    volume: 0.62,
    companionSound: 'ambient-pad',
    companionVol: 0.35,
  },
  {
    id: 'theta-incubate',
    label: '6Hz Theta Stillness',
    hz: '6Hz',
    channelId: 'theta-6hz',
    volume: 0.6,
    companionSound: 'ocean',
    companionVol: 0.4,
  },
  {
    id: 'schumann-earth',
    label: '7.83Hz Earth Resonance',
    hz: '7.83Hz',
    channelId: 'schumann-783',
    volume: 0.65,
    companionSound: 'wind',
    companionVol: 0.3,
  },
  {
    id: 'solfeggio-clarity',
    label: '528Hz Harmonic Miracle',
    hz: '528Hz',
    channelId: 'solfeggio-528hz',
    volume: 0.5,
    companionSound: 'lofi',
    companionVol: 0.3,
  },
];

export const SoundMixerPanel: React.FC = () => {
  const { activeSounds, masterVolume, isMuted, spatialAudio, activeSceneId } = useAuraStore();
  const [selectedCategory, setSelectedCategory] = useState<'Active' | SoundCategory>('Brainwaves');

  const currentScene = SCENES.find((s) => s.id === activeSceneId) || SCENES[0];

  const channelsToShow =
    selectedCategory === 'Active'
      ? SOUND_CHANNELS.filter(
          (ch) =>
            (activeSounds[ch.id] ?? 0) > 0 ||
            ch.id in currentScene.defaultSounds ||
            ['gamma-40hz', 'alpha-10hz', 'rain', 'fireplace', 'wind', 'brown-noise'].includes(ch.id)
        )
      : SOUND_CHANNELS.filter((ch) => ch.category === selectedCategory);

  const applyWavePreset = (preset: WavePreset) => {
    auraActions.ensureAudioUnlocked();
    auraActions.setSoundVolume(preset.channelId, preset.volume);
    if (preset.companionSound) {
      auraActions.setSoundVolume(preset.companionSound, preset.companionVol);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-4 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-40 w-auto md:w-[720px] max-h-[78vh] flex flex-col rounded-2xl bg-[#101114]/94 border border-[#F5F2EA]/10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F2EA]/8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs tracking-[0.24em] uppercase text-[#F5F2EA] font-medium">
              Spatial Sound Mixer & Focus Waves
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#C88A55]/15 border border-[#C88A55]/30 text-[10px] text-[#E0A96D] tracking-wider uppercase font-mono">
              40Hz Gamma Ready
            </span>
          </div>
          <p className="text-[11px] text-[#92949A] mt-0.5">
            Calibrated Web Audio API synthesis · Binaural beats, isochronic pulses & spatial acoustics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => auraActions.setScene(activeSceneId, true)}
            title="Reset to scene default mix"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Scene Default</span>
          </button>
          <button
            onClick={() => auraActions.setActiveModal(null)}
            aria-label="Close sound mixer"
            className="p-1.5 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="px-6 py-3 border-b border-[#F5F2EA]/6 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-[#F5F2EA]/16 text-[#F5F2EA] font-medium shadow-[0_0_12px_rgba(245,242,234,0.1)]'
                  : 'text-[#92949A] hover:text-[#F5F2EA]'
              }`}
            >
              {cat === 'Brainwaves' && <Activity className="w-3 h-3 text-[#E0A96D]" />}
              <span>{cat}</span>
              {cat === 'Brainwaves' && (
                <span className="text-[10px] opacity-75 font-mono">12</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => auraActions.setSpatialAudio(!spatialAudio)}
          className={`text-[11px] tracking-[0.14em] uppercase px-2.5 py-1 rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            spatialAudio
              ? 'border-[#F5F2EA]/30 text-[#F5F2EA] bg-[#F5F2EA]/8'
              : 'border-[#F5F2EA]/10 text-[#92949A]'
          }`}
        >
          Spatial 3D: {spatialAudio ? 'On' : 'Off'}
        </button>
      </div>

      {/* DEDICATED BRAINWAVE & FOCUS WAVE HERO SECTION */}
      {selectedCategory === 'Brainwaves' && (
        <div className="px-6 py-4 bg-[#08090B]/60 border-b border-[#F5F2EA]/6">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs text-[#E0A96D]">
              <Headphones className="w-3.5 h-3.5" />
              <span className="tracking-[0.16em] uppercase font-medium">
                Neural Entrainment & Focus Frequency Band Presets
              </span>
            </div>
            <span className="text-[10px] text-[#92949A] font-mono">
              Stereo Headphones Recommended
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BRAINWAVE_PRESETS.map((bp) => {
              const isCurrentlyActive = (activeSounds[bp.channelId] ?? 0) > 0.05;
              return (
                <button
                  key={bp.id}
                  onClick={() => applyWavePreset(bp)}
                  className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isCurrentlyActive
                      ? 'bg-[#E0A96D]/15 border-[#E0A96D]/40 text-[#F5F2EA]'
                      : 'bg-[#101114]/80 border-[#F5F2EA]/8 text-[#92949A] hover:border-[#F5F2EA]/20 hover:text-[#F5F2EA]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#E0A96D] font-semibold">
                      {bp.hz}
                    </span>
                    {isCurrentlyActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E0A96D] animate-ping" />
                    )}
                  </div>
                  <div className="text-[11px] font-medium leading-tight mt-1 truncate">
                    {bp.label.replace(`${bp.hz} `, '')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Channel Sliders */}
      <div className="p-6 overflow-y-auto space-y-5 flex-1">
        {channelsToShow.map((channel) => {
          const vol = activeSounds[channel.id] ?? 0;
          const isPlaying = vol > 0.01 && !isMuted;
          const pct = Math.round(vol * 100);

          return (
            <div key={channel.id} className="group flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => auraActions.setSoundVolume(channel.id, vol > 0 ? 0 : 0.6)}
                    className={`uppercase tracking-[0.18em] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isPlaying ? 'text-[#F5F2EA]' : 'text-[#92949A] group-hover:text-[#F5F2EA]/80'
                    }`}
                  >
                    {channel.category === 'Brainwaves' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F5F2EA]/8 text-[#E0A96D]">
                        {channel.name.split(' ')[0]}
                      </span>
                    )}
                    <span>{channel.name}</span>
                  </button>
                  <span className="hidden sm:inline text-[11px] text-[#92949A]/65">
                    {channel.description}
                  </span>
                </div>
                <span className="font-clock-mono text-[11px] text-[#92949A] tabular-nums">
                  {pct === 0 ? 'OFF' : `${pct}%`}
                </span>
              </div>

              {/* Custom Architectural Slider Track */}
              <div className="relative h-6 flex items-center">
                <div className="w-full h-[2px] bg-[#F5F2EA]/10 rounded-full relative">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${
                      isPlaying
                        ? channel.category === 'Brainwaves'
                          ? 'bg-[#E0A96D] shadow-[0_0_8px_rgba(224,169,109,0.5)]'
                          : 'bg-[#F5F2EA] animate-aura-breathe'
                        : 'bg-[#92949A]/40'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                  {/* Tactile Thumb Indicator */}
                  <div
                    className={`w-3 h-3 rounded-full absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-150 ${
                      isPlaying
                        ? channel.category === 'Brainwaves'
                          ? 'bg-[#E0A96D] shadow-[0_0_12px_rgba(224,169,109,0.85)] scale-100'
                          : 'bg-[#F5F2EA] shadow-[0_0_12px_rgba(245,242,234,0.75)] scale-100'
                        : 'bg-[#92949A] scale-75 group-hover:scale-95'
                    }`}
                    style={{ left: `${pct}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pct}
                  onChange={(e) =>
                    auraActions.setSoundVolume(channel.id, Number(e.target.value) / 100)
                  }
                  aria-label={`${channel.name} volume`}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Volume Footer */}
      <div className="px-6 py-4 bg-[#08090B]/85 border-t border-[#F5F2EA]/8 flex items-center justify-between gap-6">
        <button
          onClick={() => auraActions.toggleMute()}
          className="flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-[#F5F2EA]/85 hover:text-[#F5F2EA] cursor-pointer whitespace-nowrap shrink-0"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isMuted ? 'Master Muted' : 'Master Output'}</span>
        </button>

        <div className="flex-1 relative h-6 flex items-center max-w-xs">
          <div className="w-full h-[2px] bg-[#F5F2EA]/12 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F5F2EA]/80"
              style={{ width: `${isMuted ? 0 : Math.round(masterVolume * 100)}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : Math.round(masterVolume * 100)}
            onChange={(e) => auraActions.setMasterVolume(Number(e.target.value) / 100)}
            aria-label="Master volume"
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        <span className="font-clock-mono text-xs text-[#92949A] tabular-nums w-10 text-right">
          {isMuted ? '0%' : `${Math.round(masterVolume * 100)}%`}
        </span>
      </div>
    </motion.div>
  );
};
