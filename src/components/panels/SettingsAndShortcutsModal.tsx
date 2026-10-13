import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Keyboard, X } from 'lucide-react';
import { ClockStyle, PerformanceMode } from '../../data/scenesAndSounds';
import { auraActions, useAuraStore } from '../../store/useAuraStore';

export const SettingsAndShortcutsModal: React.FC = () => {
  const state = useAuraStore();
  const { clockConfig, visualConfig, widgets, activeModal, workMinutes, breakMinutes } = state;
  const [section, setSection] = useState<'appearance' | 'focus' | 'interface' | 'shortcuts'>(
    activeModal === 'shortcuts' ? 'shortcuts' : 'appearance'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-4 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-40 w-auto md:w-[760px] max-h-[78vh] flex flex-col rounded-2xl bg-[#101114]/94 border border-[#F5F2EA]/10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F2EA]/8">
        <div className="flex items-center gap-6">
          <h2 className="text-xs tracking-[0.24em] uppercase text-[#F5F2EA] font-medium">
            System Architecture & Settings
          </h2>
          <div className="flex items-center gap-1 p-1 bg-[#08090B]/70 rounded-lg border border-[#F5F2EA]/6">
            {(
              [
                { id: 'appearance', label: 'Clock & Visuals' },
                { id: 'focus', label: 'Focus Timer' },
                { id: 'interface', label: 'Widgets & UI' },
                { id: 'shortcuts', label: 'Shortcuts' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  section === item.id
                    ? 'bg-[#F5F2EA]/14 text-[#F5F2EA] font-medium'
                    : 'text-[#92949A] hover:text-[#F5F2EA]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => auraActions.setActiveModal(null)}
          aria-label="Close settings"
          className="p-1.5 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto space-y-6">
        {section === 'appearance' && (
          <div className="space-y-6">
            {/* Clock Style Selector */}
            <div>
              <div className="text-xs text-[#F5F2EA] font-medium mb-3">
                Centerpiece Clock Architecture
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'minimal', label: 'Minimal Digital', desc: 'Tabular JetBrains Mono' },
                    { id: 'serif', label: 'Editorial Serif', desc: 'Cormorant Garamond' },
                    { id: 'flip', label: 'Split-Flap', desc: 'Architectural cards' },
                    { id: 'analog', label: 'Swiss Analog', desc: 'Precision radial dial' },
                    { id: 'word', label: 'Word Clock', desc: 'Poetic time prose' },
                    { id: 'typography', label: 'Stacked Duet', desc: 'Sans & Italic Serif' },
                  ] as Array<{ id: ClockStyle; label: string; desc: string }>
                ).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => auraActions.updateClockConfig({ style: style.id })}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      clockConfig.style === style.id
                        ? 'bg-[#16181C] border-[#F5F2EA]/35'
                        : 'bg-[#08090B]/60 border-[#F5F2EA]/8 hover:border-[#F5F2EA]/20'
                    }`}
                  >
                    <div className="text-xs font-medium text-[#F5F2EA]">{style.label}</div>
                    <div className="text-[11px] text-[#92949A] mt-0.5">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Clock Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#F5F2EA]/8">
              {(
                [
                  { key: 'is24Hour', label: '24-Hour Format', val: clockConfig.is24Hour },
                  { key: 'showSeconds', label: 'Show Seconds', val: clockConfig.showSeconds },
                  { key: 'showWeekday', label: 'Show Weekday', val: clockConfig.showWeekday },
                  { key: 'showDate', label: 'Show Date', val: clockConfig.showDate },
                ] as const
              ).map((toggle) => (
                <button
                  key={toggle.key}
                  onClick={() => auraActions.updateClockConfig({ [toggle.key]: !toggle.val })}
                  className={`px-3.5 py-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    toggle.val
                      ? 'bg-[#F5F2EA]/10 border-[#F5F2EA]/25 text-[#F5F2EA]'
                      : 'bg-[#08090B]/60 border-[#F5F2EA]/8 text-[#92949A]'
                  }`}
                >
                  <span>{toggle.label}</span>
                  <span className="font-clock-mono text-[10px] uppercase">
                    {toggle.val ? 'ON' : 'OFF'}
                  </span>
                </button>
              ))}
            </div>

            {/* Clock Scale, Opacity, Glow & Film Grain */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#F5F2EA]/8">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#F5F2EA]/85">Clock Scale</span>
                  <span className="font-clock-mono text-[#92949A] tabular-nums">
                    {Math.round(clockConfig.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={75}
                  max={130}
                  value={Math.round(clockConfig.scale * 100)}
                  onChange={(e) =>
                    auraActions.updateClockConfig({ scale: Number(e.target.value) / 100 })
                  }
                  className="w-full accent-[#F5F2EA] cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#F5F2EA]/85">Subtle Optical Bloom</span>
                  <span className="font-clock-mono text-[#92949A] tabular-nums">
                    {clockConfig.glowIntensity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={clockConfig.glowIntensity}
                  onChange={(e) =>
                    auraActions.updateClockConfig({ glowIntensity: Number(e.target.value) })
                  }
                  className="w-full accent-[#F5F2EA] cursor-pointer"
                />
              </div>
            </div>

            {/* Film Grain & Performance */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#F5F2EA]/8">
              <div>
                <div className="text-xs font-medium text-[#F5F2EA]">35mm Film Grain</div>
                <div className="text-[11px] text-[#92949A]">Subtle analog texture overlay</div>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#08090B] rounded-lg border border-[#F5F2EA]/8">
                {(['off', 'low', 'medium'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => auraActions.updateVisualConfig({ grainLevel: g })}
                    className={`px-3 py-1 text-xs uppercase rounded-md transition-colors cursor-pointer ${
                      visualConfig.grainLevel === g
                        ? 'bg-[#F5F2EA]/14 text-[#F5F2EA]'
                        : 'text-[#92949A] hover:text-[#F5F2EA]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {section === 'focus' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-[#08090B]/60 border border-[#F5F2EA]/8 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#F5F2EA]">Focus Duration (Minutes)</span>
                  <span className="font-clock-mono text-[#F5F2EA] tabular-nums">{workMinutes}m</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={workMinutes}
                  onChange={(e) =>
                    auraActions.setTimerMode('custom', Number(e.target.value), breakMinutes)
                  }
                  className="w-full accent-[#F5F2EA] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#08090B]/60 border border-[#F5F2EA]/8 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#F5F2EA]">Restorative Break (Minutes)</span>
                  <span className="font-clock-mono text-[#F5F2EA] tabular-nums">{breakMinutes}m</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={5}
                  value={breakMinutes}
                  onChange={(e) =>
                    auraActions.setTimerMode('custom', workMinutes, Number(e.target.value))
                  }
                  className="w-full accent-[#F5F2EA] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {section === 'interface' && (
          <div className="space-y-4">
            <div className="text-xs text-[#92949A]">
              Configure optional minimal widgets and screensaver behavior:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    label: 'Auto-Hide Controls on Inactivity (Screensaver)',
                    active: visualConfig.autoHideControls,
                    onClick: () =>
                      auraActions.updateVisualConfig({
                        autoHideControls: !visualConfig.autoHideControls,
                      }),
                  },
                  {
                    label: 'World Clock Column (Dhaka, Tokyo, London, NY)',
                    active: widgets.worldClock,
                    onClick: () => auraActions.updateWidgets({ worldClock: !widgets.worldClock }),
                  },
                  {
                    label: 'Live Weather Atmosphere Detector',
                    active: widgets.weather,
                    onClick: () => auraActions.updateWidgets({ weather: !widgets.weather }),
                  },
                  {
                    label: 'Sparse Philosophical Quotes',
                    active: widgets.quote,
                    onClick: () => auraActions.updateWidgets({ quote: !widgets.quote }),
                  },
                  {
                    label: 'Depth Parallax Motion',
                    active: visualConfig.parallaxEnabled,
                    onClick: () =>
                      auraActions.updateVisualConfig({
                        parallaxEnabled: !visualConfig.parallaxEnabled,
                      }),
                  },
                  {
                    label: 'Reduced Motion Accessibility',
                    active: visualConfig.reducedMotion,
                    onClick: () =>
                      auraActions.updateVisualConfig({
                        reducedMotion: !visualConfig.reducedMotion,
                      }),
                  },
                ] as const
              ).map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    item.active
                      ? 'bg-[#16181C] border-[#F5F2EA]/25 text-[#F5F2EA]'
                      : 'bg-[#08090B]/60 border-[#F5F2EA]/8 text-[#92949A]'
                  }`}
                >
                  <span className="text-xs">{item.label}</span>
                  <span className="font-clock-mono text-[10px] uppercase shrink-0">
                    {item.active ? 'ON' : 'OFF'}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-[#F5F2EA]/8 flex items-center justify-between">
              <span className="text-xs text-[#92949A]">
                Want to revisit the AURA editorial introduction or onboarding setup?
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => auraActions.setActiveModal('onboarding')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F5F2EA]/10 hover:bg-[#F5F2EA]/18 text-xs text-[#F5F2EA] cursor-pointer"
                >
                  Onboarding Flow
                </button>
                <button
                  onClick={() => auraActions.setActiveModal('landing')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F5F2EA]/10 hover:bg-[#F5F2EA]/18 text-xs text-[#F5F2EA] cursor-pointer"
                >
                  About AURA
                </button>
              </div>
            </div>
          </div>
        )}

        {section === 'shortcuts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'SPACE', desc: 'Start or Pause Focus Session' },
              { key: 'A', desc: 'Open Atmospheres & Scenes' },
              { key: 'S', desc: 'Open Spatial Sound Mixer' },
              { key: 'D', desc: 'Open AI Focus Director' },
              { key: 'B', desc: 'Enter Meditative Breathing Mode' },
              { key: 'G', desc: 'Open Focus Galaxy & Stats' },
              { key: 'M', desc: 'Mute / Unmute Master Audio' },
              { key: 'F', desc: 'Toggle Fullscreen Sanctuary' },
              { key: 'R', desc: 'Reset Current Timer' },
              { key: 'ESC', desc: 'Close Active Panel' },
            ].map((sc) => (
              <div
                key={sc.key}
                className="flex items-center justify-between p-3 rounded-xl bg-[#08090B]/65 border border-[#F5F2EA]/8"
              >
                <span className="text-xs text-[#92949A]">{sc.desc}</span>
                <kbd className="px-2.5 py-1 rounded bg-[#16181C] border border-[#F5F2EA]/15 font-clock-mono text-[11px] text-[#F5F2EA]">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
