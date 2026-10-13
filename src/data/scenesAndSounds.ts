export type SceneId =
  | 'rainy-night'
  | 'midnight-cafe'
  | 'deep-forest'
  | 'moonlit-ocean'
  | 'winter-cabin'
  | 'deep-space'
  | 'cyberpunk-rain'
  | 'dark-library'
  | 'solaris-eclipse';

export type ClockStyle = 'minimal' | 'serif' | 'flip' | 'analog' | 'word' | 'typography';

export type PerformanceMode = 'cinematic' | 'balanced' | 'performance';

export type SoundCategory = 'Nature' | 'Environment' | 'Mechanical' | 'Noise' | 'Music';

export interface SoundChannelSpec {
  id: string;
  name: string;
  category: SoundCategory;
  defaultPan: number; // -1 (left) to +1 (right)
  description: string;
}

import { SCENE_IMAGES } from '../assets/images';

export interface SceneSpec {
  id: SceneId;
  name: string;
  tagline: string;
  locationLabel: string;
  accentColor: string;
  secondaryGlow: string;
  bgBase: string;
  imageUrl?: string;
  particleType: 'rain' | 'dust' | 'mist-leaves' | 'ocean-mist' | 'snow' | 'stars' | 'cyber-rain' | 'embers' | 'eclipse';
  defaultClockStyle: ClockStyle;
  defaultSounds: Record<string, number>;
  lightingDescription: string;
  isSecret?: boolean;
}

export interface SavedPreset {
  id: string;
  name: string;
  category: string;
  sceneId: SceneId;
  sounds: Record<string, number>;
  timerMinutes: number;
  breakMinutes: number;
  clockStyle: ClockStyle;
  fogIntensity: number;
  particleIntensity: number;
  lightWarmth: number;
}

export const SCENES: SceneSpec[] = [
  {
    id: 'rainy-night',
    name: 'Rainy Night',
    tagline: 'Wet glass, distant streetlights, quiet thunder.',
    locationLabel: 'TOKYO · 02:14',
    accentColor: '#5B7C99',
    secondaryGlow: '#C88A55',
    bgBase: '#07090D',
    imageUrl: SCENE_IMAGES['rainy-night'],
    particleType: 'rain',
    defaultClockStyle: 'minimal',
    defaultSounds: {
      rain: 0.68,
      thunder: 0.24,
      city: 0.28,
    },
    lightingDescription: 'Deep slate shadows with warm distant window reflections',
  },
  {
    id: 'midnight-cafe',
    name: 'Midnight Cafe',
    tagline: 'Charred cedar, warm tungsten pool, quiet espresso bar.',
    locationLabel: 'KYOTO · 23:40',
    accentColor: '#C88A55',
    secondaryGlow: '#4A5D6E',
    bgBase: '#0A0908',
    imageUrl: SCENE_IMAGES['midnight-cafe'],
    particleType: 'dust',
    defaultClockStyle: 'serif',
    defaultSounds: {
      cafe: 0.48,
      rain: 0.32,
      lofi: 0.35,
    },
    lightingDescription: 'Warm amber pendant light over dark timber',
  },
  {
    id: 'deep-forest',
    name: 'Deep Forest',
    tagline: 'Moonlit redwoods, drifting silver mist, quiet canopy.',
    locationLabel: 'YAKUSHIMA · 04:50',
    accentColor: '#5B8270',
    secondaryGlow: '#4A6984',
    bgBase: '#070B09',
    imageUrl: SCENE_IMAGES['deep-forest'],
    particleType: 'mist-leaves',
    defaultClockStyle: 'minimal',
    defaultSounds: {
      wind: 0.45,
      leaves: 0.38,
      river: 0.42,
    },
    lightingDescription: 'Cool silver moonlight filtering through dense fog',
  },
  {
    id: 'dark-library',
    name: 'Dark Library',
    tagline: 'Walnut shelves, brass desk lamp, floating dust motes.',
    locationLabel: 'OXFORD · 22:15',
    accentColor: '#C69255',
    secondaryGlow: '#3D3226',
    bgBase: '#0A0806',
    imageUrl: SCENE_IMAGES['dark-library'],
    particleType: 'dust',
    defaultClockStyle: 'serif',
    defaultSounds: {
      fireplace: 0.55,
      'clock-tick': 0.26,
      rain: 0.3,
    },
    lightingDescription: 'Focused brass lamp illumination with deep architectural shadow',
  },
  {
    id: 'moonlit-ocean',
    name: 'Moonlit Ocean',
    tagline: 'Dark horizon, slow tidal swell, cold silver reflection.',
    locationLabel: 'REYKJAVIK · 01:10',
    accentColor: '#567896',
    secondaryGlow: '#2A3F54',
    bgBase: '#06090E',
    imageUrl: SCENE_IMAGES['moonlit-ocean'],
    particleType: 'ocean-mist',
    defaultClockStyle: 'minimal',
    defaultSounds: {
      ocean: 0.65,
      wind: 0.32,
      'ambient-pad': 0.25,
    },
    lightingDescription: 'Lunar horizon shimmer across slow-rolling dark water',
  },
  {
    id: 'winter-cabin',
    name: 'Winter Cabin',
    tagline: 'Hearth embers inside, silent snowfall beyond the glass.',
    locationLabel: 'TROMSØ · 20:05',
    accentColor: '#D08752',
    secondaryGlow: '#496580',
    bgBase: '#0B0908',
    imageUrl: SCENE_IMAGES['winter-cabin'],
    particleType: 'snow',
    defaultClockStyle: 'flip',
    defaultSounds: {
      fireplace: 0.7,
      wind: 0.42,
      'brown-noise': 0.2,
    },
    lightingDescription: 'Warm hearth glow contrasting with sub-zero twilight blue',
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    tagline: 'High-orbit stillness, distant nebula drift, zero gravity.',
    locationLabel: 'LAGRANGE L2 · 00:00',
    accentColor: '#7B68A6',
    secondaryGlow: '#3F5E8A',
    bgBase: '#050609',
    imageUrl: SCENE_IMAGES['deep-space'],
    particleType: 'stars',
    defaultClockStyle: 'minimal',
    defaultSounds: {
      spaceship: 0.52,
      'ambient-pad': 0.48,
      'brown-noise': 0.28,
    },
    lightingDescription: 'Subtle violet-indigo cosmic dust and parallax starlight',
  },
  {
    id: 'cyberpunk-rain',
    name: 'Cyberpunk Rain',
    tagline: 'High-altitude rain, muted cyan & rose glass reflections.',
    locationLabel: 'NEO-SEOUL · 03:30',
    accentColor: '#4E8FA8',
    secondaryGlow: '#A35678',
    bgBase: '#07080C',
    imageUrl: SCENE_IMAGES['cyberpunk-rain'],
    particleType: 'cyber-rain',
    defaultClockStyle: 'word',
    defaultSounds: {
      rain: 0.62,
      city: 0.38,
      'ambient-pad': 0.42,
    },
    lightingDescription: 'Restrained cyan and magenta wet-glass specular bloom',
  },
  {
    id: 'solaris-eclipse',
    name: 'Solaris Eclipse',
    tagline: 'Hidden horizon corona, harmonic resonance, total stillness.',
    locationLabel: 'ORBITAL SANCTUARY · ∞',
    accentColor: '#D49B54',
    secondaryGlow: '#6B482E',
    bgBase: '#060504',
    particleType: 'eclipse',
    defaultClockStyle: 'analog',
    defaultSounds: {
      'ambient-pad': 0.65,
      spaceship: 0.4,
      'pink-noise': 0.22,
    },
    lightingDescription: 'Golden coronal ring suspended in absolute obsidian space',
    isSecret: true,
  },
];

export const SOUND_CHANNELS: SoundChannelSpec[] = [
  // Nature
  { id: 'rain', name: 'Rain on Glass', category: 'Nature', defaultPan: 0, description: 'Steady nocturnal rainfall against window panes' },
  { id: 'thunder', name: 'Distant Thunder', category: 'Nature', defaultPan: -0.35, description: 'Low-frequency horizon rolling thunder' },
  { id: 'wind', name: 'Highland Wind', category: 'Nature', defaultPan: 0.25, description: 'Slow spatial air currents across trees' },
  { id: 'ocean', name: 'Midnight Swell', category: 'Nature', defaultPan: 0, description: 'Rhythmic coastal tide and receding foam' },
  { id: 'river', name: 'Forest Stream', category: 'Nature', defaultPan: -0.2, description: 'Clear mountain water over mossy stones' },
  { id: 'leaves', name: 'Canopy Rustle', category: 'Nature', defaultPan: 0.3, description: 'Gentle breeze moving through cedar needles' },

  // Environment
  { id: 'cafe', name: 'Late Cafe Murmur', category: 'Environment', defaultPan: -0.15, description: 'Distant ceramic cups and hushed room tone' },
  { id: 'fireplace', name: 'Hearth Fire', category: 'Environment', defaultPan: 0, description: 'Warm dry birchwood crackle and ember warmth' },
  { id: 'city', name: 'Distant Avenue', category: 'Environment', defaultPan: 0.4, description: 'Muted wet-asphalt traffic twenty floors below' },

  // Mechanical
  { id: 'keyboard', name: 'Tactile Keystrokes', category: 'Mechanical', defaultPan: -0.1, description: 'Softly damped mechanical switches in rhythm' },
  { id: 'clock-tick', name: 'Atelier Pendulum', category: 'Mechanical', defaultPan: 0.35, description: 'Measured horological escapement tick' },
  { id: 'spaceship', name: 'Orbital Hull Hum', category: 'Mechanical', defaultPan: 0, description: 'Sub-bass cabin pressurization and life support' },

  // Noise
  { id: 'brown-noise', name: 'Deep Brown Noise', category: 'Noise', defaultPan: 0, description: 'Warm low-pass acoustic masking blanket' },
  { id: 'pink-noise', name: 'Velvet Pink Noise', category: 'Noise', defaultPan: 0, description: 'Balanced octave-scaled focus frequency' },
  { id: 'white-noise', name: 'Soft Air Tone', category: 'Noise', defaultPan: 0, description: 'Filtered high-altitude cabin air' },

  // Music
  { id: 'lofi', name: 'Nocturne Electric Piano', category: 'Music', defaultPan: 0, description: 'Slow generative Rhodes chords in minor 9ths' },
  { id: 'ambient-pad', name: 'Warm Analog Drone', category: 'Music', defaultPan: 0, description: 'Evolving tape-saturated harmonic pad' },
  { id: 'piano', name: 'Felt Piano Intervals', category: 'Music', defaultPan: -0.1, description: 'Sparse minimalist acoustic notes with long decay' },
];

export const DEFAULT_PRESETS: SavedPreset[] = [
  {
    id: 'preset-study',
    name: 'My Study',
    category: 'Study',
    sceneId: 'dark-library',
    sounds: { fireplace: 0.55, rain: 0.35, 'brown-noise': 0.25 },
    timerMinutes: 50,
    breakMinutes: 10,
    clockStyle: 'serif',
    fogIntensity: 45,
    particleIntensity: 50,
    lightWarmth: 78,
  },
  {
    id: 'preset-coding',
    name: 'My Coding',
    category: 'Coding',
    sceneId: 'rainy-night',
    sounds: { rain: 0.72, thunder: 0.24, city: 0.3, 'ambient-pad': 0.32 },
    timerMinutes: 50,
    breakMinutes: 10,
    clockStyle: 'minimal',
    fogIntensity: 60,
    particleIntensity: 65,
    lightWarmth: 42,
  },
  {
    id: 'preset-reading',
    name: 'My Reading',
    category: 'Reading',
    sceneId: 'midnight-cafe',
    sounds: { cafe: 0.45, rain: 0.4, lofi: 0.35 },
    timerMinutes: 25,
    breakMinutes: 5,
    clockStyle: 'serif',
    fogIntensity: 35,
    particleIntensity: 40,
    lightWarmth: 82,
  },
  {
    id: 'preset-night',
    name: 'My Night',
    category: 'Relaxing',
    sceneId: 'deep-space',
    sounds: { spaceship: 0.55, 'ambient-pad': 0.5, 'brown-noise': 0.25 },
    timerMinutes: 90,
    breakMinutes: 20,
    clockStyle: 'word',
    fogIntensity: 50,
    particleIntensity: 45,
    lightWarmth: 30,
  },
  {
    id: 'preset-sleep',
    name: 'My Sleep',
    category: 'Sleep',
    sceneId: 'moonlit-ocean',
    sounds: { ocean: 0.65, wind: 0.3, 'pink-noise': 0.22 },
    timerMinutes: 45,
    breakMinutes: 15,
    clockStyle: 'minimal',
    fogIntensity: 70,
    particleIntensity: 25,
    lightWarmth: 25,
  },
];

export const WORLD_CITIES = [
  { id: 'dhaka', name: 'DHAKA', timeZone: 'Asia/Dhaka' },
  { id: 'tokyo', name: 'TOKYO', timeZone: 'Asia/Tokyo' },
  { id: 'london', name: 'LONDON', timeZone: 'Europe/London' },
  { id: 'new-york', name: 'NEW YORK', timeZone: 'America/New_York' },
  { id: 'zurich', name: 'ZURICH', timeZone: 'Europe/Zurich' },
  { id: 'reykjavik', name: 'REYKJAVIK', timeZone: 'Atlantic/Reykjavik' },
];

export const SPARSE_QUOTES = [
  'Do less, but do it completely.',
  'Attention is the rarest and purest form of generosity.',
  'Depth requires the courage to go slow.',
  'Silence is not the absence of something, but the presence of everything.',
  'One moment. One task. Unhurried.',
  'Clarity arrives when the noise settles.',
];
