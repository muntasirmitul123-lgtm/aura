import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SCENES } from '../data/scenesAndSounds';
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
}

export const AtmosphereCanvas: React.FC<{ mousePos: { x: number; y: number } }> = ({ mousePos }) => {
  const { activeSceneId, customAccentOverride, visualConfig, isSessionActive } = useAuraStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const currentScene = SCENES.find((s) => s.id === activeSceneId) || SCENES[0];
  const accentColor = customAccentOverride || currentScene.accentColor;

  // Parallax offsets (subtle, never wobbly)
  const parallaxFactor = visualConfig.parallaxEnabled && !visualConfig.reducedMotion ? 1 : 0;
  const bgOffsetX = (mousePos.x - 0.5) * -18 * parallaxFactor;
  const bgOffsetY = (mousePos.y - 0.5) * -12 * parallaxFactor;
  const midOffsetX = (mousePos.x - 0.5) * -34 * parallaxFactor;
  const midOffsetY = (mousePos.y - 0.5) * -22 * parallaxFactor;

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
        ? 1.0
        : visualConfig.performanceMode === 'balanced'
        ? 0.6
        : 0.25;
    const intensityRatio = (visualConfig.particleIntensity / 100) * modeMultiplier;
    const baseCount =
      currentScene.particleType === 'rain' || currentScene.particleType === 'cyber-rain'
        ? 150
        : currentScene.particleType === 'stars'
        ? 140
        : currentScene.particleType === 'snow'
        ? 100
        : 70;
    const count = visualConfig.reducedMotion ? Math.min(20, Math.floor(baseCount * 0.2)) : Math.floor(baseCount * intensityRatio);

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: Math.random() * 0.6 + 0.2,
      size: Math.random() * 2.2 + 0.6,
      alpha: Math.random() * 0.55 + 0.1,
      depth: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    let lightningFlash = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (document.hidden) return;

      const dt = Math.min(32, now - lastTime) / 16.67;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      const pType = currentScene.particleType;
      const fgShiftX = (mousePos.x - 0.5) * -45 * parallaxFactor;
      const fgShiftY = (mousePos.y - 0.5) * -30 * parallaxFactor;

      // Scene-specific procedural background elements for non-photo scenes or atmospheric overlays
      if (pType === 'ocean-mist') {
        // Moonlit Ocean procedural horizon & water caustics
        const horizonY = height * 0.54;
        const moonGrad = ctx.createRadialGradient(
          width * 0.5 + bgOffsetX,
          horizonY - 90 + bgOffsetY,
          8,
          width * 0.5 + bgOffsetX,
          horizonY - 40 + bgOffsetY,
          height * 0.55
        );
        moonGrad.addColorStop(0, 'rgba(215, 230, 245, 0.22)');
        moonGrad.addColorStop(0.25, 'rgba(86, 120, 150, 0.10)');
        moonGrad.addColorStop(1, 'rgba(6, 9, 14, 0)');
        ctx.fillStyle = moonGrad;
        ctx.fillRect(0, 0, width, height);

        // Gentle horizontal wave shimmer lines
        for (let i = 0; i < 28; i++) {
          const progress = i / 28;
          const y = horizonY + Math.pow(progress, 1.5) * (height - horizonY);
          const waveSpread = 80 + progress * 380;
          const drift = Math.sin(now * 0.0008 + i * 0.7) * (15 + progress * 35);
          const alpha = (1 - progress * 0.65) * 0.14;
          ctx.fillStyle = `rgba(190, 215, 238, ${alpha})`;
          ctx.fillRect(width * 0.5 - waveSpread * 0.5 + drift + bgOffsetX, y, waveSpread, 1.2 + progress * 1.8);
        }
      } else if (pType === 'eclipse') {
        // Secret Solaris Eclipse scene: obsidian disc + golden coronal ring
        const cx = width * 0.5 + bgOffsetX * 0.6;
        const cy = height * 0.5 + bgOffsetY * 0.6;
        const radius = Math.min(width, height) * 0.21;

        const corona = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 2.4);
        corona.addColorStop(0, 'rgba(245, 210, 155, 0.42)');
        corona.addColorStop(0.15, 'rgba(212, 155, 84, 0.20)');
        corona.addColorStop(0.45, 'rgba(120, 72, 38, 0.06)');
        corona.addColorStop(1, 'rgba(6, 5, 4, 0)');
        ctx.fillStyle = corona;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Dark eclipse core
        ctx.fillStyle = '#060504';
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.96, 0, Math.PI * 2);
        ctx.fill();

        // Crisp coronal rim
        ctx.strokeStyle = 'rgba(245, 222, 185, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.97, 0, Math.PI * 2);
        ctx.stroke();
      } else if (pType === 'snow') {
        // Winter cabin warm hearth glow from bottom
        const hearth = ctx.createRadialGradient(
          width * 0.5,
          height * 1.05,
          20,
          width * 0.5,
          height * 0.95,
          height * 0.75
        );
        const flicker = Math.sin(now * 0.005) * 0.025 + Math.cos(now * 0.013) * 0.015;
        hearth.addColorStop(0, `rgba(218, 130, 68, ${0.24 + flicker})`);
        hearth.addColorStop(0.45, `rgba(160, 82, 38, ${0.09 + flicker * 0.5})`);
        hearth.addColorStop(1, 'rgba(11, 9, 8, 0)');
        ctx.fillStyle = hearth;
        ctx.fillRect(0, 0, width, height);
      } else if (pType === 'stars') {
        // Deep Space subtle cosmic nebula cloud
        const nebula = ctx.createRadialGradient(
          width * 0.62 + bgOffsetX,
          height * 0.38 + bgOffsetY,
          30,
          width * 0.5 + bgOffsetX,
          height * 0.45 + bgOffsetY,
          Math.max(width, height) * 0.65
        );
        nebula.addColorStop(0, 'rgba(123, 104, 166, 0.16)');
        nebula.addColorStop(0.4, 'rgba(63, 94, 138, 0.08)');
        nebula.addColorStop(1, 'rgba(5, 6, 9, 0)');
        ctx.fillStyle = nebula;
        ctx.fillRect(0, 0, width, height);
      }

      // Occasional distant lightning in Rainy Night
      if (pType === 'rain' && !visualConfig.reducedMotion) {
        if (Math.random() < 0.0007 && lightningFlash <= 0.01) {
          lightningFlash = 0.16;
        }
        if (lightningFlash > 0.005) {
          ctx.fillStyle = `rgba(185, 210, 235, ${lightningFlash})`;
          ctx.fillRect(0, 0, width, height);
          lightningFlash *= 0.92;
        }
      }

      // Render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const px = (p.x + fgShiftX * p.depth + width) % width;
        const py = (p.y + fgShiftY * p.depth + height) % height;

        if (pType === 'rain' || pType === 'cyber-rain') {
          const speed = (9 + p.depth * 11) * (visualConfig.reducedMotion ? 0.15 : 1);
          p.y += speed * dt;
          p.x -= speed * 0.12 * dt;
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.strokeStyle =
            pType === 'cyber-rain' && i % 5 === 0
              ? `rgba(140, 205, 230, ${p.alpha * 0.45})`
              : `rgba(210, 224, 240, ${p.alpha * 0.35})`;
          ctx.lineWidth = p.depth * 1.1;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - 2.4 * p.depth, py + 18 * p.depth);
          ctx.stroke();
        } else if (pType === 'snow') {
          const speedY = (0.45 + p.depth * 0.75) * (visualConfig.reducedMotion ? 0.2 : 1);
          p.y += speedY * dt;
          p.x += Math.sin(now * 0.0006 + p.phase) * 0.35 * dt;
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.fillStyle = `rgba(245, 242, 234, ${p.alpha * 0.65})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (pType === 'stars') {
          p.x -= 0.04 * p.depth * dt;
          if (p.x < 0) p.x = width;
          const twinkle = 0.65 + 0.35 * Math.sin(now * 0.0015 + p.phase);
          ctx.fillStyle = `rgba(240, 238, 248, ${p.alpha * twinkle})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.75, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Floating dust motes / forest spores / orbital motes
          p.y -= (0.12 + p.depth * 0.18) * (visualConfig.reducedMotion ? 0.15 : 1) * dt;
          p.x += Math.sin(now * 0.0004 + p.phase) * 0.18 * dt;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          const pulse = 0.5 + 0.5 * Math.sin(now * 0.001 + p.phase);
          ctx.fillStyle =
            pType === 'dust' || pType === 'eclipse'
              ? `rgba(242, 212, 170, ${p.alpha * pulse * 0.65})`
              : `rgba(205, 228, 220, ${p.alpha * pulse * 0.55})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
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

  const fogOpacity = (visualConfig.fogIntensity / 100) * 0.55;
  const warmthOpacity = (visualConfig.lightWarmth / 100) * 0.22;
  const vignetteOpacity = (visualConfig.vignetteIntensity / 100) * 0.85;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      style={{ backgroundColor: currentScene.bgBase }}
    >
      {/* Layer 1: Scene Transition & Photographic / Procedural Base Plate */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0, scale: 1.06, filter: 'blur(18px)' }}
          animate={{
            opacity: 1,
            scale: isSessionActive ? 1.045 : 1.02,
            filter: 'blur(0px)',
          }}
          exit={{ opacity: 0, scale: 1.01, filter: 'blur(14px)' }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {currentScene.imageUrl && !failedImages[currentScene.id] ? (
            <div
              className="w-full h-full transition-transform duration-700 ease-out"
              style={{
                transform: `translate3d(${bgOffsetX}px, ${bgOffsetY}px, 0) scale(1.06)`,
              }}
            >
              <img
                src={currentScene.imageUrl}
                alt={currentScene.name}
                referrerPolicy="no-referrer"
                onError={() => setFailedImages((prev) => ({ ...prev, [currentScene.id]: true }))}
                className="w-full h-full object-cover opacity-55"
              />
            </div>
          ) : (
            <div
              className="w-full h-full transition-transform duration-700 ease-out"
              style={{
                transform: `translate3d(${bgOffsetX}px, ${bgOffsetY}px, 0) scale(1.06)`,
                background: `radial-gradient(circle at 50% 38%, ${accentColor}28 0%, ${currentScene.secondaryGlow}18 42%, ${currentScene.bgBase} 85%)`,
              }}
            />
          )}

          {/* Measured Contrast Scrim for WCAG AA legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#08090B]/70 via-[#08090B]/45 to-[#08090B]/85" />
        </motion.div>
      </AnimatePresence>

      {/* Layer 2: Midground Volumetric Fog & Ambient Color Temperature */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${midOffsetX}px, ${midOffsetY}px, 0) scale(1.08)`,
          opacity: fogOpacity,
          background: `radial-gradient(ellipse 80% 55% at 50% 55%, ${accentColor}30 0%, transparent 72%)`,
        }}
      />

      {/* Warmth / Color Grading Layer */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: warmthOpacity,
          background: 'radial-gradient(circle at 50% 45%, rgba(218, 150, 88, 0.45), rgba(14, 18, 28, 0.25) 75%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Layer 3: Real-time HTML5 Canvas Particle & Atmospheric Physics */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Layer 4: Focus Session Deepening Scrim */}
      <div
        className={`absolute inset-0 bg-[#050608] transition-opacity duration-1000 ${
          isSessionActive ? 'opacity-35' : 'opacity-0'
        }`}
      />

      {/* Layer 5: Architectural Vignette */}
      <div
        className="absolute inset-0"
        style={{
          opacity: vignetteOpacity,
          background: 'radial-gradient(circle at 50% 50%, transparent 38%, rgba(5, 6, 8, 0.92) 100%)',
        }}
      />

      {/* Layer 6: Subtle Film Grain */}
      {visualConfig.grainLevel !== 'off' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: visualConfig.grainLevel === 'medium' ? 0.055 : 0.028,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}
    </div>
  );
};
