import rainyNight from './scene_rainy_night_1791901424655.jpg';
import midnightCafe from './scene_midnight_cafe_1791901424509.jpg';
import deepForest from './scene_deep_forest_1791901425257.jpg';
import darkLibrary from './scene_dark_library_1791901425528.jpg';
import moonlitOcean from './scene_moonlit_ocean_1791907974140.jpg';
import winterCabin from './scene_winter_cabin_1791907975928.jpg';
import deepSpace from './scene_deep_space_1791907976382.jpg';
import cyberpunkRain from './scene_cyberpunk_rain_1791907976526.jpg';

export const SCENE_IMAGES: Record<string, string> = {
  'rainy-night': rainyNight,
  'midnight-cafe': midnightCafe,
  'deep-forest': deepForest,
  'dark-library': darkLibrary,
  'moonlit-ocean': moonlitOcean,
  'winter-cabin': winterCabin,
  'deep-space': deepSpace,
  'cyberpunk-rain': cyberpunkRain,
};

// Also export reliable public URLs as secondary fallback
export const PUBLIC_SCENE_FALLBACKS: Record<string, string> = {
  'rainy-night': '/scenes/scene_rainy_night_1791901424655.jpg',
  'midnight-cafe': '/scenes/scene_midnight_cafe_1791901424509.jpg',
  'deep-forest': '/scenes/scene_deep_forest_1791901425257.jpg',
  'dark-library': '/scenes/scene_dark_library_1791901425528.jpg',
  'moonlit-ocean': '/scenes/scene_moonlit_ocean_1791907974140.jpg',
  'winter-cabin': '/scenes/scene_winter_cabin_1791907975928.jpg',
  'deep-space': '/scenes/scene_deep_space_1791907976382.jpg',
  'cyberpunk-rain': '/scenes/scene_cyberpunk_rain_1791907976526.jpg',
};
