import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { SCENES, SOUND_CHANNELS, SoundCategory } from '../../data/scenesAndSounds';
import { auraActions, useAuraStore } from '../../store/useAuraStore';

const CATEGORIES: Array<'Active' | SoundCategory> = [
  'Active',
  'Nature',
  'Environment',
  'Mechanical',
  'Noise',
  'Music',
];

export const SoundMixerPanel: React.FC = () => {
  const { activeSounds, masterVolume, isMuted, spatialAudio, activeSceneId } = useAuraStore();
  const [selectedCategory, setSelectedCategory] = useState<'Active' | SoundCategory>('Active');

  const currentScene = SCENES.find((s) => s.id === activeSceneId) || SCENES[0];

  const channelsToShow =
    selectedCategory === 'Active'
      ? SOUND_CHANNELS.filter(
          (ch) =>
            (activeSounds[ch.id] ?? 0) > 0 ||
            ch.id in currentScene.defaultSounds ||
            ['rain', 'fireplace', 'wind', 'city', 'lofi', 'brown-noise'].includes(ch.id)
        )
      : SOUND_CHANNELS.filter((ch) => ch.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-4 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-40 w-auto md:w-[680px] max-h-[76vh] flex flex-col rounded-2xl bg-[#101114]/92 border border-[#F5F2EA]/10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F2EA]/8">
        <div>
          <h2 className="text-xs tracking-[0.24em] uppercase text-[#F5F2EA] font-medium">
            Spatial Sound Mixer
          </h2>
          <p className="text-[11px] text-[#92949A] mt-0.5">
            Independent Web Audio API synthesis channels with stereo field drift
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
        <div className="flex items-center gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#F5F2EA]/14 text-[#F5F2EA] font-medium'
                  : 'text-[#92949A] hover:text-[#F5F2EA]'
              }`}
            >
              {cat}
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

      {/* Channel Sliders (RAIN ━━━━━━━━━●) */}
      <div className="p-6 overflow-y-auto space-y-5">
        {channelsToShow.map((channel) => {
          const vol = activeSounds[channel.id] ?? 0;
          const isPlaying = vol > 0.01 && !isMuted;
          const pct = Math.round(vol * 100);

          return (
            <div key={channel.id} className="group flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => auraActions.setSoundVolume(channel.id, vol > 0 ? 0 : 0.55)}
                    className={`uppercase tracking-[0.18em] font-medium transition-colors cursor-pointer ${
                      isPlaying ? 'text-[#F5F2EA]' : 'text-[#92949A] group-hover:text-[#F5F2EA]/80'
                    }`}
                  >
                    {channel.name}
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
                      isPlaying ? 'bg-[#F5F2EA] animate-aura-breathe' : 'bg-[#92949A]/40'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                  {/* Tactile Thumb Indicator */}
                  <div
                    className={`w-3 h-3 rounded-full absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-150 ${
                      isPlaying
                        ? 'bg-[#F5F2EA] shadow-[0_0_12px_rgba(245,242,234,0.75)] scale-100'
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
      <div className="px-6 py-4 bg-[#08090B]/70 border-t border-[#F5F2EA]/8 flex items-center justify-between gap-6">
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
