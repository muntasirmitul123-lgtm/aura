import { useSyncExternalStore } from 'react';
import {
  ClockStyle,
  DEFAULT_PRESETS,
  PerformanceMode,
  SavedPreset,
  SCENES,
  SceneId,
  SOUND_CHANNELS,
} from '../data/scenesAndSounds';
import { audioEngine } from '../engine/audioEngine';

export type TimerMode = 'pomodoro' | 'deep' | 'long' | 'custom' | 'stopwatch';

export type ActiveModal =
  | null
  | 'scenes'
  | 'sounds'
  | 'director'
  | 'stats'
  | 'breathing'
  | 'settings'
  | 'shortcuts'
  | 'landing'
  | 'onboarding';

export interface FocusTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface CompletedSessionRecord {
  id: string;
  taskTitle: string;
  durationMinutes: number;
  sceneId: SceneId;
  completedAt: string; // ISO string
  starX: number; // 0.1 - 0.9 normalized galaxy coordinate
  starY: number; // 0.15 - 0.85 normalized galaxy coordinate
}

export interface ClockCustomization {
  style: ClockStyle;
  is24Hour: boolean;
  showSeconds: boolean;
  showDate: boolean;
  showWeekday: boolean;
  scale: number; // 0.75 to 1.35
  weight: 'light' | 'regular' | 'medium';
  tracking: 'tight' | 'normal' | 'wide';
  opacity: number; // 0.5 to 1.0
  glowIntensity: number; // 0 to 100
}

export interface VisualEffectsConfig {
  fogIntensity: number; // 0-100
  particleIntensity: number; // 0-100
  lightWarmth: number; // 0-100
  vignetteIntensity: number; // 0-100
  grainLevel: 'off' | 'low' | 'medium';
  parallaxEnabled: boolean;
  performanceMode: PerformanceMode;
  customCursor: boolean;
  autoHideControls: boolean;
  reducedMotion: boolean;
}

export interface WidgetVisibility {
  worldClock: boolean;
  weather: boolean;
  quote: boolean;
  taskPill: boolean;
  audioVisualizer: boolean;
}

export interface AuraState {
  activeSceneId: SceneId;
  unlockedSecretScene: boolean;
  customAccentOverride: string | null;
  activeSounds: Record<string, number>;
  masterVolume: number;
  isMuted: boolean;
  spatialAudio: boolean;
  audioInitialized: boolean;

  // Timer & Focus Session
  timerMode: TimerMode;
  workMinutes: number;
  breakMinutes: number;
  secondsRemaining: number;
  stopwatchSeconds: number;
  isSessionActive: boolean;
  isSessionPaused: boolean;
  isBreakPhase: boolean;
  justCompletedSession: CompletedSessionRecord | null;

  // Tasks
  activeTaskId: string;
  tasks: FocusTask[];

  // Modes & Navigation
  isAmbientMode: boolean;
  activeModal: ActiveModal;
  hasSeenOnboarding: boolean;

  // Customization
  clockConfig: ClockCustomization;
  visualConfig: VisualEffectsConfig;
  widgets: WidgetVisibility;
  presets: SavedPreset[];
  sessionsHistory: CompletedSessionRecord[];
  selectedCities: string[];
  liveWeatherCondition: 'rain' | 'clear-night' | 'mist' | 'snow' | null;
}

const STORAGE_KEY = 'aura_ambient_state_v1';

const INITIAL_SESSIONS: CompletedSessionRecord[] = [
  {
    id: 'sess-1',
    taskTitle: 'Molecular Biology · Chapter 4 Synthesis',
    durationMinutes: 50,
    sceneId: 'dark-library',
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    starX: 0.24,
    starY: 0.36,
  },
  {
    id: 'sess-2',
    taskTitle: 'Distributed Consensus Engine Architecture',
    durationMinutes: 90,
    sceneId: 'rainy-night',
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    starX: 0.42,
    starY: 0.28,
  },
  {
    id: 'sess-3',
    taskTitle: 'Phenomenology of Perception · Reading Notes',
    durationMinutes: 50,
    sceneId: 'midnight-cafe',
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
    starX: 0.58,
    starY: 0.48,
  },
  {
    id: 'sess-4',
    taskTitle: 'Shader Pipeline & Volumetric Fog Math',
    durationMinutes: 65,
    sceneId: 'deep-space',
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
    starX: 0.73,
    starY: 0.32,
  },
  {
    id: 'sess-5',
    taskTitle: 'Organic Chemistry Reaction Mechanisms',
    durationMinutes: 50,
    sceneId: 'deep-forest',
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 68).toISOString(),
    starX: 0.33,
    starY: 0.64,
  },
  {
    id: 'sess-6',
    taskTitle: 'Acoustic DSP Filter Design',
    durationMinutes: 75,
    sceneId: 'moonlit-ocean',
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 92).toISOString(),
    starX: 0.66,
    starY: 0.68,
  },
];

const INITIAL_TASKS: FocusTask[] = [
  { id: 'task-1', title: 'Finish Biology Chapter 4', completed: false, createdAt: Date.now() - 3600000 },
  { id: 'task-2', title: 'Review distributed systems paper', completed: false, createdAt: Date.now() - 7200000 },
  { id: 'task-3', title: 'Draft architectural monograph notes', completed: true, createdAt: Date.now() - 86400000 },
];

function getDefaultState(): AuraState {
  const defaultScene = SCENES[0]; // Rainy Night
  return {
    activeSceneId: defaultScene.id,
    unlockedSecretScene: false,
    customAccentOverride: null,
    activeSounds: { ...defaultScene.defaultSounds },
    masterVolume: 0.78,
    isMuted: false,
    spatialAudio: true,
    audioInitialized: false,

    timerMode: 'deep',
    workMinutes: 50,
    breakMinutes: 10,
    secondsRemaining: 50 * 60,
    stopwatchSeconds: 0,
    isSessionActive: false,
    isSessionPaused: false,
    isBreakPhase: false,
    justCompletedSession: null,

    activeTaskId: 'task-1',
    tasks: INITIAL_TASKS,

    isAmbientMode: false,
    activeModal: null,
    hasSeenOnboarding: true,

    clockConfig: {
      style: 'minimal',
      is24Hour: true,
      showSeconds: false,
      showDate: true,
      showWeekday: true,
      scale: 1,
      weight: 'light',
      tracking: 'tight',
      opacity: 0.94,
      glowIntensity: 28,
    },

    visualConfig: {
      fogIntensity: 55,
      particleIntensity: 60,
      lightWarmth: 45,
      vignetteIntensity: 65,
      grainLevel: 'low',
      parallaxEnabled: true,
      performanceMode: 'cinematic',
      customCursor: false,
      autoHideControls: true,
      reducedMotion: false,
    },

    widgets: {
      worldClock: false,
      weather: false,
      quote: true,
      taskPill: true,
      audioVisualizer: true,
    },

    presets: DEFAULT_PRESETS,
    sessionsHistory: INITIAL_SESSIONS,
    selectedCities: ['dhaka', 'tokyo', 'london', 'new-york'],
    liveWeatherCondition: null,
  };
}

function loadState(): AuraState {
  const base = getDefaultState();
  if (typeof window === 'undefined') return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    return {
      ...base,
      ...parsed,
      // Always reset ephemeral session playback states on fresh boot
      isSessionActive: false,
      isSessionPaused: false,
      justCompletedSession: null,
      audioInitialized: false,
      secondsRemaining: (parsed.workMinutes || base.workMinutes) * 60,
      clockConfig: { ...base.clockConfig, ...(parsed.clockConfig || {}) },
      visualConfig: { ...base.visualConfig, ...(parsed.visualConfig || {}) },
      widgets: { ...base.widgets, ...(parsed.widgets || {}) },
    };
  } catch {
    return base;
  }
}

let state: AuraState = loadState();
const listeners = new Set<() => void>();

function saveState() {
  if (typeof window === 'undefined') return;
  try {
    const toPersist = {
      activeSceneId: state.activeSceneId,
      unlockedSecretScene: state.unlockedSecretScene,
      activeSounds: state.activeSounds,
      masterVolume: state.masterVolume,
      isMuted: state.isMuted,
      spatialAudio: state.spatialAudio,
      timerMode: state.timerMode,
      workMinutes: state.workMinutes,
      breakMinutes: state.breakMinutes,
      activeTaskId: state.activeTaskId,
      tasks: state.tasks,
      hasSeenOnboarding: state.hasSeenOnboarding,
      clockConfig: state.clockConfig,
      visualConfig: state.visualConfig,
      widgets: state.widgets,
      presets: state.presets,
      sessionsHistory: state.sessionsHistory,
      selectedCities: state.selectedCities,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
  } catch {}
}

function setState(updater: Partial<AuraState> | ((prev: AuraState) => Partial<AuraState>)) {
  const nextPartial = typeof updater === 'function' ? updater(state) : updater;
  state = { ...state, ...nextPartial };
  saveState();
  listeners.forEach((l) => l());
}

function getDefaultPanMap(): Record<string, number> {
  const map: Record<string, number> = {};
  SOUND_CHANNELS.forEach((c) => {
    map[c.id] = c.defaultPan;
  });
  return map;
}

export const auraActions = {
  ensureAudioUnlocked() {
    if (!state.audioInitialized) {
      audioEngine.unlock();
      audioEngine.setMasterVolume(state.masterVolume);
      audioEngine.setMuted(state.isMuted);
      audioEngine.setSpatialEnabled(state.spatialAudio);
      audioEngine.applyPresetMix(state.activeSounds, getDefaultPanMap());
      setState({ audioInitialized: true });
    }
  },

  setScene(sceneId: SceneId, applyDefaultSounds = true) {
    const scene = SCENES.find((s) => s.id === sceneId) || SCENES[0];
    const nextSounds = applyDefaultSounds ? { ...scene.defaultSounds } : state.activeSounds;
    setState({
      activeSceneId: sceneId,
      customAccentOverride: null,
      activeSounds: nextSounds,
    });
    if (state.audioInitialized && applyDefaultSounds) {
      audioEngine.applyPresetMix(nextSounds, getDefaultPanMap());
    }
  },

  unlockEasterEggScene() {
    setState({ unlockedSecretScene: true });
    auraActions.ensureAudioUnlocked();
    auraActions.setScene('solaris-eclipse', true);
    audioEngine.playHarmonicCue('start');
  },

  setSoundVolume(soundId: string, volume: number) {
    auraActions.ensureAudioUnlocked();
    const clamped = Math.max(0, Math.min(1, volume));
    const nextSounds = { ...state.activeSounds };
    if (clamped <= 0.01) {
      delete nextSounds[soundId];
    } else {
      nextSounds[soundId] = Number(clamped.toFixed(2));
    }
    setState({ activeSounds: nextSounds });
    const spec = SOUND_CHANNELS.find((s) => s.id === soundId);
    audioEngine.setChannelVolume(soundId, clamped, spec?.defaultPan ?? 0);
  },

  setMasterVolume(vol: number) {
    auraActions.ensureAudioUnlocked();
    const clamped = Math.max(0, Math.min(1, vol));
    setState({ masterVolume: clamped, isMuted: clamped === 0 });
    audioEngine.setMasterVolume(clamped);
  },

  toggleMute() {
    auraActions.ensureAudioUnlocked();
    const nextMuted = !state.isMuted;
    setState({ isMuted: nextMuted });
    audioEngine.setMuted(nextMuted);
  },

  setSpatialAudio(enabled: boolean) {
    setState({ spatialAudio: enabled });
    audioEngine.setSpatialEnabled(enabled);
  },

  setTimerMode(mode: TimerMode, customWork?: number, customBreak?: number) {
    let work = state.workMinutes;
    let brk = state.breakMinutes;
    if (mode === 'pomodoro') {
      work = 25;
      brk = 5;
    } else if (mode === 'deep') {
      work = 50;
      brk = 10;
    } else if (mode === 'long') {
      work = 90;
      brk = 20;
    } else if (mode === 'custom') {
      work = customWork ?? state.workMinutes;
      brk = customBreak ?? state.breakMinutes;
    }

    setState({
      timerMode: mode,
      workMinutes: work,
      breakMinutes: brk,
      secondsRemaining: work * 60,
      stopwatchSeconds: 0,
      isSessionActive: false,
      isSessionPaused: false,
      isBreakPhase: false,
    });
  },

  startSession() {
    auraActions.ensureAudioUnlocked();
    audioEngine.playHarmonicCue('start');
    setState({
      isSessionActive: true,
      isSessionPaused: false,
      justCompletedSession: null,
      activeModal: null,
    });
  },

  togglePauseSession() {
    if (!state.isSessionActive) {
      auraActions.startSession();
      return;
    }
    setState({ isSessionPaused: !state.isSessionPaused });
  },

  resetSession() {
    setState({
      isSessionActive: false,
      isSessionPaused: false,
      isBreakPhase: false,
      secondsRemaining: state.workMinutes * 60,
      stopwatchSeconds: 0,
    });
  },

  tickSecond() {
    if (!state.isSessionActive || state.isSessionPaused) return;
    if (state.timerMode === 'stopwatch') {
      setState({ stopwatchSeconds: state.stopwatchSeconds + 1 });
      return;
    }
    if (state.secondsRemaining > 1) {
      setState({ secondsRemaining: state.secondsRemaining - 1 });
    } else {
      // Session or break completed!
      auraActions.completeCurrentSession();
    }
  },

  completeCurrentSession() {
    audioEngine.playHarmonicCue('complete');
    if (state.isBreakPhase) {
      setState({
        isBreakPhase: false,
        isSessionActive: false,
        isSessionPaused: false,
        secondsRemaining: state.workMinutes * 60,
      });
      return;
    }

    const activeTask = state.tasks.find((t) => t.id === state.activeTaskId) || state.tasks[0];
    const duration =
      state.timerMode === 'stopwatch'
        ? Math.max(1, Math.round(state.stopwatchSeconds / 60))
        : state.workMinutes;

    const record: CompletedSessionRecord = {
      id: `sess-${Date.now()}`,
      taskTitle: activeTask ? activeTask.title : 'Deep Focus Session',
      durationMinutes: duration,
      sceneId: state.activeSceneId,
      completedAt: new Date().toISOString(),
      starX: 0.15 + Math.random() * 0.7,
      starY: 0.2 + Math.random() * 0.6,
    };

    setState({
      isSessionActive: false,
      isSessionPaused: false,
      secondsRemaining: state.workMinutes * 60,
      stopwatchSeconds: 0,
      justCompletedSession: record,
      sessionsHistory: [record, ...state.sessionsHistory],
    });
  },

  startBreakFromCompletion() {
    setState({
      justCompletedSession: null,
      isBreakPhase: true,
      isSessionActive: true,
      isSessionPaused: false,
      secondsRemaining: state.breakMinutes * 60,
    });
  },

  dismissCompletionModal() {
    setState({ justCompletedSession: null });
  },

  setActiveModal(modal: ActiveModal) {
    setState({ activeModal: modal });
  },

  setAmbientMode(enabled: boolean) {
    setState({ isAmbientMode: enabled, activeModal: null });
  },

  setActiveTask(taskId: string) {
    setState({ activeTaskId: taskId });
  },

  addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    const newTask: FocusTask = {
      id: `task-${Date.now()}`,
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    setState({
      tasks: [newTask, ...state.tasks],
      activeTaskId: newTask.id,
    });
  },

  toggleTaskComplete(taskId: string) {
    const next = state.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setState({ tasks: next });
  },

  deleteTask(taskId: string) {
    const next = state.tasks.filter((t) => t.id !== taskId);
    const nextActive = state.activeTaskId === taskId ? next[0]?.id || '' : state.activeTaskId;
    setState({ tasks: next, activeTaskId: nextActive });
  },

  updateClockConfig(partial: Partial<ClockCustomization>) {
    setState({ clockConfig: { ...state.clockConfig, ...partial } });
  },

  updateVisualConfig(partial: Partial<VisualEffectsConfig>) {
    setState({ visualConfig: { ...state.visualConfig, ...partial } });
  },

  updateWidgets(partial: Partial<WidgetVisibility>) {
    setState({ widgets: { ...state.widgets, ...partial } });
  },

  applyPreset(preset: SavedPreset) {
    auraActions.ensureAudioUnlocked();
    setState({
      activeSceneId: preset.sceneId,
      activeSounds: { ...preset.sounds },
      workMinutes: preset.timerMinutes,
      breakMinutes: preset.breakMinutes,
      secondsRemaining: preset.timerMinutes * 60,
      clockConfig: {
        ...state.clockConfig,
        style: preset.clockStyle,
      },
      visualConfig: {
        ...state.visualConfig,
        fogIntensity: preset.fogIntensity,
        particleIntensity: preset.particleIntensity,
        lightWarmth: preset.lightWarmth,
      },
    });
    audioEngine.applyPresetMix(preset.sounds, getDefaultPanMap());
  },

  saveCurrentAsPreset(name: string, category: string = 'Custom') {
    const newPreset: SavedPreset = {
      id: `preset-${Date.now()}`,
      name: name.trim() || 'My Atmosphere',
      category,
      sceneId: state.activeSceneId,
      sounds: { ...state.activeSounds },
      timerMinutes: state.workMinutes,
      breakMinutes: state.breakMinutes,
      clockStyle: state.clockConfig.style,
      fogIntensity: state.visualConfig.fogIntensity,
      particleIntensity: state.visualConfig.particleIntensity,
      lightWarmth: state.visualConfig.lightWarmth,
    };
    setState({ presets: [newPreset, ...state.presets] });
  },

  deletePreset(id: string) {
    setState({ presets: state.presets.filter((p) => p.id !== id) });
  },

  applyAIDirectorConfig(config: {
    taskName: string;
    workMinutes: number;
    breakMinutes: number;
    sceneId: SceneId;
    soundMix: Array<{ soundId: string; volume: number }>;
    clockStyle: ClockStyle;
    accentColor?: string;
    fogIntensity?: number;
    particleIntensity?: number;
    lightWarmth?: number;
    autoStart?: boolean;
  }) {
    auraActions.ensureAudioUnlocked();
    const soundRecord: Record<string, number> = {};
    config.soundMix.forEach((item) => {
      soundRecord[item.soundId] = Math.max(0, Math.min(1, item.volume));
    });

    if (config.taskName) {
      auraActions.addTask(config.taskName);
    }

    const validScene = SCENES.some((s) => s.id === config.sceneId) ? config.sceneId : 'rainy-night';
    setState({
      activeSceneId: validScene,
      customAccentOverride: config.accentColor || null,
      activeSounds: soundRecord,
      timerMode: 'custom',
      workMinutes: config.workMinutes,
      breakMinutes: config.breakMinutes,
      secondsRemaining: config.workMinutes * 60,
      clockConfig: {
        ...state.clockConfig,
        style: config.clockStyle || state.clockConfig.style,
      },
      visualConfig: {
        ...state.visualConfig,
        fogIntensity: config.fogIntensity ?? state.visualConfig.fogIntensity,
        particleIntensity: config.particleIntensity ?? state.visualConfig.particleIntensity,
        lightWarmth: config.lightWarmth ?? state.visualConfig.lightWarmth,
      },
    });
    audioEngine.applyPresetMix(soundRecord, getDefaultPanMap());
    if (config.autoStart) {
      auraActions.startSession();
    }
  },

  completeOnboarding() {
    setState({ hasSeenOnboarding: true, activeModal: null });
  },

  setLiveWeather(condition: 'rain' | 'clear-night' | 'mist' | 'snow' | null) {
    setState({ liveWeatherCondition: condition });
  },
};

export function useAuraStore(): AuraState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state
  );
}
