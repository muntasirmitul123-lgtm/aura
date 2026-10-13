import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PUBLIC_SCENE_FALLBACKS } from '../assets/images';
import { SCENES } from '../data/scenesAndSounds';
import { audioEngine } from '../engine/audioEngine';
import { useAuraStore } from '../store/useAuraStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  depth: number;
  phase: number;
  color?: string;
}

interface Bokeh {
  x: number;
  y: number;
  r: number;
  alpha: number;
  speed: number;
  phase: number;
}

export const AtmosphereCanvas: React.FC<{ mousePos: { x: number; y: number } }> = ({ mousePos }) => {
  const { activeSceneId, customAccentOverride, visualConfig, isSessionActive } = useAuraStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, number>>({});

  const currentScene = SCENES.find((s) => s.id === activeSceneId) || SCENES[0];
  const accentColor = customAccentOverride || currentScene.accentColor;

  // Determine image source: primary bundled image, or fallback public URL
  const errCount = imageErrors[currentScene.id] || 0;
  const imageSource =
    errCount === 0
      ? currentScene.imageUrl || PUBLIC_SCENE_FALLBACKS[currentScene.id]
      : errCount === 1
      ? PUBLIC_SCENE_FALLBACKS[currentScene.id]
      : undefined;

  // Parallax offsets (silky smooth, physical feel)
  const parallaxFactor = visualConfig.parallaxEnabled && !visualConfig.reducedMotion ? 1 : 0;
  const bgOffsetX = (mousePos.x - 0.5) * -24 * parallaxFactor;
  const bgOffsetY = (mousePos.y - 0.5) * -16 * parallaxFactor;
  const midOffsetX = (mousePos.x - 0.5) * -42 * parallaxFactor;
  const midOffsetY = (mousePos.y - 0.5) * -28 * parallaxFactor;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Compute particle budget based on Performance Mode & user slider
    const modeMultiplier =
      visualConfig.performanceMode === 'cinematic'
        ? 1.25
        : visualConfig.performanceMode === 'balanced'
        ? 0.75
        : 0.35;
    const intensityRatio = (visualConfig.particleIntensity / 100) * modeMultiplier;
    const pType = currentScene.particleType;

    const baseCount =
      pType === 'rain' || pType === 'cyber-rain'
        ? 190
        : pType === 'stars'
        ? 170
        : pType === 'snow'
        ? 130
        : 85;

    const count = visualConfig.reducedMotion
      ? Math.min(25, Math.floor(baseCount * 0.2))
      : Math.floor(baseCount * intensityRatio);

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: Math.random() * 0.7 + 0.3,
      size: Math.random() * 2.4 + 0.8,
      alpha: Math.random() * 0.6 + 0.15,
      depth: Math.random() * 0.85 + 0.15,
      phase: Math.random() * Math.PI * 2,
    }));

    // Glistening glass condensation droplets for rainy scenes
    const condensationDroplets = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.2 + 0.8,
      slideSpeed: Math.random() * 0.18 + 0.02,
      opacity: Math.random() * 0.45 + 0.15,
      length: Math.random() * 12 + 4,
    }));

    // Soft bokeh discs for cafe and library
    const bokehDiscs: Bokeh[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 45 + 18,
      alpha: Math.random() * 0.14 + 0.04,
      speed: Math.random() * 0.15 + 0.05,
      phase: Math.random() * Math.PI * 2,
    }));

    let lightningFlash = 0;
    let lastTime = performance.now();
    const audioData = new Uint8Array(32);

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (document.hidden) return;

      const dt = Math.min(32, now - lastTime) / 16.67;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Read audio energy for subtle breathing
      audioEngine.getFrequencyData(audioData);
      const audioEnergy = (audioData[2] + audioData[4] + audioData[6]) / (3 * 255);
      const audioPulse = 1 + audioEnergy * 0.22;

      const fgShiftX = (mousePos.x - 0.5) * -55 * parallaxFactor;
      const fgShiftY = (mousePos.y - 0.5) * -38 * parallaxFactor;

      // SCENE-SPECIFIC VISUAL MASTERPIECE EFFECTS
      if (pType === 'ocean-mist') {
        // Moonlit Ocean: Lunar horizon shimmer path & water caustics
        const horizonY = height * 0.52;
        const moonX = width * 0.5 + bgOffsetX * 0.4;
        const moonY = horizonY - 110 + bgOffsetY * 0.4;

        // Radiant Moon Glow
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, height * 0.6);
        moonGlow.addColorStop(0, `rgba(225, 238, 255, ${0.35 * audioPulse})`);
        moonGlow.addColorStop(0.2, 'rgba(120, 160, 200, 0.16)');
        moonGlow.addColorStop(0.55, 'rgba(40, 75, 110, 0.06)');
        moonGlow.addColorStop(1, 'rgba(6, 9, 14, 0)');
        ctx.fillStyle = moonGlow;
        ctx.fillRect(0, 0, width, height);

        // Horizon water surface shimmer lines
        for (let i = 0; i < 35; i++) {
          const progress = i / 35;
          const y = horizonY + Math.pow(progress, 1.45) * (height - horizonY);
          const waveSpread = 60 + progress * 520;
          const drift = Math.sin(now * 0.0009 + i * 0.65) * (20 + progress * 40);
          const alpha = (1 - progress * 0.55) * (0.16 + audioEnergy * 0.08);
          ctx.fillStyle = `rgba(215, 235, 255, ${alpha})`;
          ctx.fillRect(moonX - waveSpread * 0.5 + drift, y, waveSpread, 1.5 + progress * 2.2);
        }
      } else if (pType === 'eclipse') {
        // Solaris Eclipse: Pulsing golden coronal flares
        const cx = width * 0.5 + bgOffsetX * 0.5;
        const cy = height * 0.5 + bgOffsetY * 0.5;
        const radius = Math.min(width, height) * 0.22;

        // Multi-tier solar corona
        const corona = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 2.6 * audioPulse);
        corona.addColorStop(0, 'rgba(255, 225, 175, 0.55)');
        corona.addColorStop(0.18, 'rgba(230, 165, 80, 0.26)');
        corona.addColorStop(0.48, 'rgba(140, 80, 35, 0.08)');
        corona.addColorStop(1, 'rgba(6, 5, 4, 0)');
        ctx.fillStyle = corona;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 2.6 * audioPulse, 0, Math.PI * 2);
        ctx.fill();

        // Dark celestial core
        ctx.fillStyle = '#060504';
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.97, 0, Math.PI * 2);
        ctx.fill();

        // Shimmering diamond coronal rim
        ctx.strokeStyle = `rgba(255, 235, 200, ${0.45 + Math.sin(now * 0.003) * 0.15})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.975, 0, Math.PI * 2);
        ctx.stroke();
      } else if (pType === 'snow') {
        // Winter Cabin: Warm hearth embers rising + frosted window edges
        const hearthX = width * 0.5;
        const hearthY = height * 1.02;
        const hearthGrad = ctx.createRadialGradient(hearthX, hearthY, 20, hearthX, hearthY, height * 0.8);
        const flicker = Math.sin(now * 0.006) * 0.04 + Math.cos(now * 0.014) * 0.02;
        hearthGrad.addColorStop(0, `rgba(240, 145, 75, ${0.28 + flicker + audioEnergy * 0.1})`);
        hearthGrad.addColorStop(0.45, `rgba(175, 90, 40, ${0.11 + flicker * 0.5})`);
        hearthGrad.addColorStop(1, 'rgba(11, 9, 8, 0)');
        ctx.fillStyle = hearthGrad;
        ctx.fillRect(0, 0, width, height);
      } else if (pType === 'stars') {
        // Deep Space: Cosmic nebula filament glow
        const nebula = ctx.createRadialGradient(
          width * 0.58 + bgOffsetX,
          height * 0.42 + bgOffsetY,
          40,
          width * 0.5 + bgOffsetX,
          height * 0.5 + bgOffsetY,
          Math.max(width, height) * 0.72
        );
        nebula.addColorStop(0, `rgba(145, 115, 195, ${0.22 * audioPulse})`);
        nebula.addColorStop(0.35, 'rgba(75, 105, 160, 0.12)');
        nebula.addColorStop(0.7, 'rgba(45, 55, 90, 0.05)');
        nebula.addColorStop(1, 'rgba(5, 6, 9, 0)');
        ctx.fillStyle = nebula;
        ctx.fillRect(0, 0, width, height);
      } else if (pType === 'dust') {
        // Midnight Cafe & Library: Warm bokeh discs drifting slowly
        bokehDiscs.forEach((b) => {
          b.y -= b.speed * dt;
          b.x += Math.sin(now * 0.0005 + b.phase) * 0.2 * dt;
          if (b.y < -b.r) {
            b.y = height + b.r;
            b.x = Math.random() * width;
          }
          const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
          grad.addColorStop(0, `rgba(235, 190, 130, ${b.alpha * 1.5})`);
          grad.addColorStop(0.6, `rgba(200, 150, 90, ${b.alpha * 0.6})`);
          grad.addColorStop(1, 'rgba(200, 150, 90, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Occasional distant atmospheric lightning in rain scenes
      if ((pType === 'rain' || pType === 'cyber-rain') && !visualConfig.reducedMotion) {
        if (Math.random() < 0.0008 && lightningFlash <= 0.01) {
          lightningFlash = 0.22;
        }
        if (lightningFlash > 0.005) {
          ctx.fillStyle =
            pType === 'cyber-rain'
              ? `rgba(160, 220, 245, ${lightningFlash * 1.2})`
              : `rgba(205, 225, 250, ${lightningFlash})`;
          ctx.fillRect(0, 0, width, height);
          lightningFlash *= 0.91;
        }

        // Wet glass sliding droplets
        condensationDroplets.forEach((d) => {
          d.y += d.slideSpeed * dt;
          if (d.y > height + 20) {
            d.y = -20;
            d.x = Math.random() * width;
          }
          ctx.fillStyle = `rgba(230, 242, 255, ${d.opacity})`;
          ctx.beginPath();
          ctx.ellipse(d.x, d.y, d.r, d.length * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // RENDER ADVANCED PARTICLE SYSTEM
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const px = (p.x + fgShiftX * p.depth + width) % width;
        const py = (p.y + fgShiftY * p.depth + height) % height;

        if (pType === 'rain' || pType === 'cyber-rain') {
          const speed = (11 + p.depth * 13) * (visualConfig.reducedMotion ? 0.2 : 1);
          p.y += speed * dt;
          p.x -= speed * 0.14 * dt;
          if (p.y > height) {
            p.y = -25;
            p.x = Math.random() * width;
          }

          if (pType === 'cyber-rain') {
            ctx.strokeStyle =
              i % 4 === 0
                ? `rgba(110, 225, 255, ${p.alpha * 0.65})`
                : i % 4 === 1
                ? `rgba(255, 120, 185, ${p.alpha * 0.55})`
                : `rgba(220, 235, 250, ${p.alpha * 0.45})`;
          } else {
            ctx.strokeStyle = `rgba(215, 230, 248, ${p.alpha * 0.48})`;
          }
          ctx.lineWidth = p.depth * 1.25;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - 3.2 * p.depth, py + 22 * p.depth);
          ctx.stroke();
        } else if (pType === 'snow') {
          const speedY = (0.55 + p.depth * 0.95) * (visualConfig.reducedMotion ? 0.25 : 1);
          p.y += speedY * dt;
          p.x += Math.sin(now * 0.0007 + p.phase) * 0.45 * dt;
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.fillStyle = `rgba(248, 246, 240, ${p.alpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.35, 0, Math.PI * 2);
          ctx.fill();
        } else if (pType === 'stars') {
          p.x -= 0.035 * p.depth * dt;
          if (p.x < 0) p.x = width;
          const twinkle = 0.6 + 0.4 * Math.sin(now * 0.0018 + p.phase);
          ctx.fillStyle =
            i % 6 === 0
              ? `rgba(180, 205, 255, ${p.alpha * twinkle * 1.1})`
              : i % 6 === 1
              ? `rgba(255, 225, 195, ${p.alpha * twinkle * 0.95})`
              : `rgba(245, 242, 250, ${p.alpha * twinkle})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.85, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Floating dust motes / fireflies / forest spores
          p.y -= (0.14 + p.depth * 0.22) * (visualConfig.reducedMotion ? 0.2 : 1) * dt;
          p.x += Math.sin(now * 0.0005 + p.phase) * 0.22 * dt;
          if (p.y < -12) {
            p.y = height + 12;
            p.x = Math.random() * width;
          }

          const pulse = 0.5 + 0.5 * Math.sin(now * 0.0012 + p.phase);
          if (pType === 'mist-leaves') {
            // Glowing forest fireflies
            ctx.fillStyle = `rgba(185, 245, 200, ${p.alpha * pulse * 0.75})`;
          } else {
            // Warm golden dust motes
            ctx.fillStyle = `rgba(245, 218, 175, ${p.alpha * pulse * 0.85})`;
          }
          ctx.beginPath();
          ctx.arc(px, py, p.size * (pType === 'mist-leaves' ? 1.4 : 1.1), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Interactive Cursor Ambient Spotlight (makes the scene physically respond to mouse)
      if (parallaxFactor > 0 && !visualConfig.reducedMotion) {
        const spotX = mousePos.x * width;
        const spotY = mousePos.y * height;
        const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 320);
        spotGrad.addColorStop(0, 'rgba(255, 250, 240, 0.04)');
        spotGrad.addColorStop(0.5, 'rgba(255, 250, 240, 0.015)');
        spotGrad.addColorStop(1, 'rgba(255, 250, 240, 0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, width, height);
      }
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    currentScene.id,
    currentScene.particleType,
    visualConfig.particleIntensity,
    visualConfig.performanceMode,
    visualConfig.reducedMotion,
    parallaxFactor,
    mousePos.x,
    mousePos.y,
    bgOffsetX,
    bgOffsetY,
  ]);

  const fogOpacity = (visualConfig.fogIntensity / 100) * 0.62;
  const warmthOpacity = (visualConfig.lightWarmth / 100) * 0.28;
  const vignetteOpacity = (visualConfig.vignetteIntensity / 100) * 0.78;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{ backgroundColor: currentScene.bgBase }}
    >
      {/* Layer 1: High-Definition Photographic Canvas with Apple-grade Ken Burns camera drift */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0, scale: 1.08, filter: 'blur(20px)' }}
          animate={{
            opacity: 1,
            scale: isSessionActive ? 1.06 : 1.03,
            filter: 'blur(0px)',
          }}
          exit={{ opacity: 0, scale: 1.01, filter: 'blur(16px)' }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {imageSource ? (
            <div
              className="w-full h-full transition-transform duration-700 ease-out"
              style={{
                transform: `translate3d(${bgOffsetX}px, ${bgOffsetY}px, 0) scale(1.05)`,
              }}
            >
              <img
                src={imageSource}
                alt={currentScene.name}
                referrerPolicy="no-referrer"
                onError={() => {
                  setImageErrors((prev) => ({
                    ...prev,
                    [currentScene.id]: (prev[currentScene.id] || 0) + 1,
                  }));
                }}
                className="w-full h-full object-cover opacity-85 transition-opacity duration-1000 animate-aura-drift"
              />
            </div>
          ) : (
            <div
              className="w-full h-full transition-transform duration-700 ease-out"
              style={{
                transform: `translate3d(${bgOffsetX}px, ${bgOffsetY}px, 0) scale(1.05)`,
                background: `radial-gradient(circle at 50% 40%, ${accentColor}35 0%, ${currentScene.secondaryGlow}22 45%, ${currentScene.bgBase} 88%)`,
              }}
            />
          )}

          {/* Measured Contrast Scrim (ensures crisp 100% WCAG AA text legibility while letting stunning photography shine) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#08090B]/60 via-[#08090B]/35 to-[#08090B]/80" />
        </motion.div>
      </AnimatePresence>

      {/* Layer 2: Midground Volumetric Fog & Atmospheric Glow */}
      <div
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${midOffsetX}px, ${midOffsetY}px, 0) scale(1.09)`,
          opacity: fogOpacity,
          background: `radial-gradient(ellipse 85% 60% at 50% 50%, ${accentColor}38 0%, transparent 74%)`,
        }}
      />

      {/* Layer 3: Warmth & Cinematic Color Grading */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: warmthOpacity,
          background:
            'radial-gradient(circle at 50% 45%, rgba(225, 160, 95, 0.42), rgba(16, 20, 32, 0.22) 78%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 4: Real-time HTML5 Canvas Particle Physics & Atmosphere Engine */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Layer 5: Focus Session Deepening Scrim */}
      <div
        className={`absolute inset-0 bg-[#050608] transition-opacity duration-1000 ${
          isSessionActive ? 'opacity-40' : 'opacity-0'
        }`}
      />

      {/* Layer 6: Architectural Lens Vignette */}
      <div
        className="absolute inset-0"
        style={{
          opacity: vignetteOpacity,
          background:
            'radial-gradient(circle at 50% 50%, transparent 42%, rgba(5, 6, 8, 0.90) 100%)',
        }}
      />

      {/* Layer 7: Fine 35mm Analog Film Grain */}
      {visualConfig.grainLevel !== 'off' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: visualConfig.grainLevel === 'medium' ? 0.055 : 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
    </div>
  );
};
