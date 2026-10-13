import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Check, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { PerformanceMode, SCENES } from '../../data/scenesAndSounds';
import { auraActions, useAuraStore } from '../../store/useAuraStore';

export const ScenesAndPresetsPanel: React.FC = () => {
  const { activeSceneId, unlockedSecretScene, presets, visualConfig } = useAuraStore();
  const [tab, setTab] = useState<'scenes' | 'presets' | 'layers'>('scenes');
  const [presetName, setPresetName] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const visibleScenes = SCENES.filter((s) => !s.isSecret || unlockedSecretScene || s.id === activeSceneId);

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    auraActions.saveCurrentAsPreset(presetName || 'My Custom Setup');
    setPresetName('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-4 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-40 w-auto md:w-[760px] max-h-[76vh] flex flex-col rounded-2xl bg-[#101114]/92 border border-[#F5F2EA]/10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F2EA]/8">
        <div className="flex items-center gap-6">
          <h2 className="text-xs tracking-[0.24em] uppercase text-[#F5F2EA] font-medium">
            Atmospheric Engine
          </h2>
          <div className="flex items-center gap-1 p-1 bg-[#08090B]/70 rounded-lg border border-[#F5F2EA]/6">
            {(
              [
                { id: 'scenes', label: 'Scenes' },
                { id: 'presets', label: 'Saved Presets' },
                { id: 'layers', label: 'Layers & Depth' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  tab === item.id
                    ? 'bg-[#F5F2EA]/12 text-[#F5F2EA] font-medium'
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
          aria-label="Close panel"
          className="p-1.5 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto space-y-6">
        {tab === 'scenes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleScenes.map((scene) => {
              const isSelected = scene.id === activeSceneId;
              return (
                <button
                  key={scene.id}
                  onClick={() => auraActions.setScene(scene.id, true)}
                  className={`group relative text-left p-4 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                    isSelected
                      ? 'bg-[#16181C] border-[#F5F2EA]/45 shadow-[0_0_35px_rgba(245,242,234,0.08)]'
                      : 'bg-[#08090B]/70 border-[#F5F2EA]/10 hover:border-[#F5F2EA]/30'
                  }`}
                >
                  {/* High-Definition Photographic Plate Preview */}
                  {scene.imageUrl ? (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img
                        src={scene.imageUrl}
                        alt={scene.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-35 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#101114] via-[#101114]/75 to-[#101114]/45" />
                    </div>
                  ) : (
                    <div
                      className="absolute inset-0 opacity-25 group-hover:opacity-45 transition-opacity pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 85% 20%, ${scene.accentColor}45 0%, transparent 70%)`,
                      }}
                    />
                  )}

                  <div className="relative z-10 flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] tracking-[0.24em] text-[#92949A] uppercase font-medium">
                        {scene.locationLabel}
                      </div>
                      <div className="mt-1 text-base font-semibold text-[#F5F2EA] tracking-tight">
                        {scene.name}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-[#F5F2EA]/15 text-[10px] tracking-[0.2em] uppercase text-[#F5F2EA] font-medium border border-[#F5F2EA]/20">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="relative z-10 mt-2 text-xs text-[#92949A] leading-relaxed group-hover:text-[#F5F2EA]/90 transition-colors">
                    {scene.tagline}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {tab === 'presets' && (
          <div className="space-y-6">
            {/* Save Current Atmosphere Form */}
            <form
              onSubmit={handleSavePreset}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-xl bg-[#08090B]/60 border border-[#F5F2EA]/8"
            >
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Save current scene, sound mix & lighting as..."
                className="flex-1 bg-transparent text-xs text-[#F5F2EA] placeholder-[#92949A] focus:outline-none px-2 py-1"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#F5F2EA]/10 hover:bg-[#F5F2EA]/18 text-xs text-[#F5F2EA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {savedNotice ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{savedNotice ? 'Saved Preset' : 'Save Setup'}</span>
              </button>
            </form>

            {presets.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#92949A]">
                Create your first atmosphere.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((preset) => {
                  const scene = SCENES.find((s) => s.id === preset.sceneId) || SCENES[0];
                  const soundCount = Object.keys(preset.sounds).length;
                  return (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#08090B]/65 border border-[#F5F2EA]/8 hover:border-[#F5F2EA]/22 transition-colors"
                    >
                      <button
                        onClick={() => auraActions.applyPreset(preset)}
                        className="flex-1 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-xs text-[#92949A]">
                          <Bookmark className="w-3 h-3 opacity-70" />
                          <span>{preset.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{preset.timerMinutes}m</span>
                        </div>
                        <div className="mt-1 text-sm font-medium text-[#F5F2EA]">{preset.name}</div>
                        <div className="mt-1 text-xs text-[#92949A]">
                          {scene.name} · {soundCount} audio {soundCount === 1 ? 'layer' : 'layers'}
                        </div>
                      </button>
                      <button
                        onClick={() => auraActions.deletePreset(preset.id)}
                        aria-label={`Delete preset ${preset.name}`}
                        className="p-2 text-[#92949A]/60 hover:text-[#F5F2EA] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'layers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(
                [
                  {
                    key: 'fogIntensity',
                    label: 'Volumetric Fog & Mist',
                    value: visualConfig.fogIntensity,
                  },
                  {
                    key: 'particleIntensity',
                    label: 'Atmospheric Particles',
                    value: visualConfig.particleIntensity,
                  },
                  {
                    key: 'lightWarmth',
                    label: 'Color Temperature Warmth',
                    value: visualConfig.lightWarmth,
                  },
                  {
                    key: 'vignetteIntensity',
                    label: 'Architectural Vignette',
                    value: visualConfig.vignetteIntensity,
                  },
                ] as const
              ).map((slider) => (
                <div key={slider.key} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#F5F2EA]/85">{slider.label}</span>
                    <span className="font-clock-mono text-[#92949A] tabular-nums">{slider.value}%</span>
                  </div>
                  <div className="relative h-5 flex items-center">
                    <div className="w-full h-[2px] bg-[#F5F2EA]/12 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#F5F2EA]/75 transition-all duration-150"
                        style={{ width: `${slider.value}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={slider.value}
                      onChange={(e) =>
                        auraActions.updateVisualConfig({ [slider.key]: Number(e.target.value) })
                      }
                      aria-label={slider.label}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#F5F2EA]/8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-[#F5F2EA] font-medium">Rendering Performance Mode</div>
                <div className="text-xs text-[#92949A] mt-0.5">
                  Scales particle count, canvas resolution, and blur layers
                </div>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#08090B] rounded-lg border border-[#F5F2EA]/8">
                {(['cinematic', 'balanced', 'performance'] as PerformanceMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => auraActions.updateVisualConfig({ performanceMode: mode })}
                    className={`px-3 py-1.5 text-xs capitalize rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      visualConfig.performanceMode === mode
                        ? 'bg-[#F5F2EA]/14 text-[#F5F2EA] font-medium'
                        : 'text-[#92949A] hover:text-[#F5F2EA]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-[#92949A]">
              <span>Want a custom AI-generated atmosphere from a description?</span>
              <button
                onClick={() => auraActions.setActiveModal('director')}
                className="flex items-center gap-1.5 text-[#F5F2EA] hover:underline cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Atmosphere Generator</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
