import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { SCENES } from '../../data/scenesAndSounds';
import { auraActions, CompletedSessionRecord, useAuraStore } from '../../store/useAuraStore';

export const FocusGalaxyStatsPanel: React.FC = () => {
  const { sessionsHistory, tasks, activeTaskId } = useAuraStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedStar, setSelectedStar] = useState<CompletedSessionRecord | null>(
    sessionsHistory[0] || null
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Compute Focus Metrics
  const totalMinutes = sessionsHistory.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalSessions = sessionsHistory.length;
  const avgSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  const longestSession =
    totalSessions > 0 ? Math.max(...sessionsHistory.map((s) => s.durationMinutes)) : 0;
  const completedTasksCount = tasks.filter((t) => t.completed).length;

  // Interactive Focus Galaxy Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 640);
    const height = (canvas.height = 280);

    // Subtle background field stars
    const bgStars = Array.from({ length: 85 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.1 + 0.3,
      alpha: Math.random() * 0.35 + 0.08,
    }));

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      // Nebula subtle radial glow
      const neb = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        10,
        width * 0.5,
        height * 0.5,
        width * 0.55
      );
      neb.addColorStop(0, 'rgba(91, 124, 153, 0.12)');
      neb.addColorStop(0.5, 'rgba(123, 104, 166, 0.06)');
      neb.addColorStop(1, 'rgba(8, 9, 11, 0)');
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, width, height);

      // Draw ambient field stars
      bgStars.forEach((st) => {
        ctx.fillStyle = `rgba(245, 242, 234, ${st.alpha})`;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw constellation lines connecting chronological sessions
      if (sessionsHistory.length > 1) {
        ctx.strokeStyle = 'rgba(245, 242, 234, 0.11)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        sessionsHistory.forEach((sess, i) => {
          const sx = sess.starX * width;
          const sy = sess.starY * height;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.stroke();
      }

      // Draw completed session stars (More focus = brighter & larger star)
      sessionsHistory.forEach((sess, idx) => {
        const sx = sess.starX * width;
        const sy = sess.starY * height;
        const scene = SCENES.find((s) => s.id === sess.sceneId) || SCENES[0];
        const baseRadius = Math.max(3.5, Math.min(9.5, sess.durationMinutes / 10));
        const pulse = 1 + 0.12 * Math.sin(now * 0.0025 + idx);
        const isSelected = selectedStar?.id === sess.id;

        // Outer star halo
        const halo = ctx.createRadialGradient(sx, sy, 1, sx, sy, baseRadius * 4.2 * pulse);
        halo.addColorStop(0, isSelected ? 'rgba(245, 242, 234, 0.55)' : `${scene.accentColor}66`);
        halo.addColorStop(1, 'rgba(8, 9, 11, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(sx, sy, baseRadius * 4.2 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Star core
        ctx.fillStyle = '#F5F2EA';
        ctx.beginPath();
        ctx.arc(sx, sy, baseRadius * (isSelected ? 1.25 : 0.9), 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = 'rgba(245, 242, 234, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx, sy, baseRadius * 2.4, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [sessionsHistory, selectedStar]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let closest: CompletedSessionRecord | null = null;
    let minDist = 36;
    sessionsHistory.forEach((sess) => {
      const sx = sess.starX * canvas.width;
      const sy = sess.starY * canvas.height;
      const dist = Math.hypot(clickX - sx, clickY - sy);
      if (dist < minDist) {
        minDist = dist;
        closest = sess;
      }
    });
    if (closest) {
      setSelectedStar(closest);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    auraActions.addTask(newTaskTitle);
    setNewTaskTitle('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 14, scale: 0.98, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-4 bottom-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-40 w-auto md:w-[820px] max-h-[80vh] flex flex-col rounded-2xl bg-[#101114]/94 border border-[#F5F2EA]/10 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.85)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5F2EA]/8">
        <div>
          <h2 className="text-xs tracking-[0.24em] uppercase text-[#F5F2EA] font-medium">
            Focus Galaxy & Sanctuary Ledger
          </h2>
          <p className="text-[11px] text-[#92949A] mt-0.5">
            Each completed focus session becomes a star in your personal constellation
          </p>
        </div>
        <button
          onClick={() => auraActions.setActiveModal(null)}
          aria-label="Close Focus Galaxy"
          className="p-1.5 text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto space-y-7">
        {/* Top Architectural Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pb-6 border-b border-[#F5F2EA]/8">
          <div>
            <div className="text-[10px] tracking-[0.22em] text-[#92949A] uppercase">Total Focus</div>
            <div className="mt-1 font-clock-mono text-2xl font-light text-[#F5F2EA] tabular-nums">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.22em] text-[#92949A] uppercase">Sessions</div>
            <div className="mt-1 font-clock-mono text-2xl font-light text-[#F5F2EA] tabular-nums">
              {totalSessions}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.22em] text-[#92949A] uppercase">Average</div>
            <div className="mt-1 font-clock-mono text-2xl font-light text-[#F5F2EA] tabular-nums">
              {avgSession}m
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.22em] text-[#92949A] uppercase">Longest</div>
            <div className="mt-1 font-clock-mono text-2xl font-light text-[#F5F2EA] tabular-nums">
              {longestSession}m
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.22em] text-[#92949A] uppercase">Streak</div>
            <div className="mt-1 font-clock-mono text-2xl font-light text-[#F5F2EA] tabular-nums">
              5 days · {completedTasksCount} tasks
            </div>
          </div>
        </div>

        {/* Interactive Focus Galaxy Constellation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="tracking-[0.2em] uppercase text-[#92949A]">
              Focus Galaxy (Click any star to inspect)
            </span>
            {selectedStar && (
              <span className="text-[#F5F2EA]/90">
                {selectedStar.taskTitle} ·{' '}
                <span className="font-clock-mono tabular-nums">{selectedStar.durationMinutes}m</span> ·{' '}
                {SCENES.find((s) => s.id === selectedStar.sceneId)?.name}
              </span>
            )}
          </div>

          <div className="relative rounded-xl bg-[#08090B] border border-[#F5F2EA]/10 overflow-hidden">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-[260px] cursor-crosshair block"
            />
          </div>
        </div>

        {/* Horizontal Focus Timeline */}
        <div className="space-y-3">
          <div className="text-xs tracking-[0.2em] uppercase text-[#92949A]">
            Recent Focus Timeline
          </div>
          {sessionsHistory.length === 0 ? (
            <div className="py-6 text-xs text-[#92949A]">Your first session will appear here.</div>
          ) : (
            <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
              {sessionsHistory.map((sess) => {
                const scene = SCENES.find((s) => s.id === sess.sceneId) || SCENES[0];
                const isSelected = selectedStar?.id === sess.id;
                const dateLabel = new Date(sess.completedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <button
                    key={sess.id}
                    onClick={() => setSelectedStar(sess)}
                    className={`min-w-[200px] text-left p-3.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#16181C] border-[#F5F2EA]/30'
                        : 'bg-[#08090B]/60 border-[#F5F2EA]/8 hover:border-[#F5F2EA]/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#92949A]">
                      <span>{dateLabel}</span>
                      <span className="font-clock-mono text-[#F5F2EA] tabular-nums">
                        {sess.durationMinutes}m
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs font-medium text-[#F5F2EA] truncate">
                      {sess.taskTitle}
                    </div>
                    <div className="mt-1 text-[11px] text-[#92949A]">{scene.name}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Minimal Single-Focus Task System */}
        <div className="pt-4 border-t border-[#F5F2EA]/8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-[0.2em] uppercase text-[#92949A]">
              Focus Intentions (Select active task)
            </span>
            <span className="text-xs text-[#92949A]">One task is enough.</span>
          </div>

          <form onSubmit={handleAddTask} className="flex items-center gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a focus task (e.g., Finish Biology Chapter 4)..."
              className="flex-1 bg-[#08090B]/80 border border-[#F5F2EA]/10 rounded-lg px-3.5 py-2 text-xs text-[#F5F2EA] placeholder-[#92949A]/60 focus:outline-none focus:border-[#F5F2EA]/35"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F5F2EA]/12 hover:bg-[#F5F2EA]/20 text-xs text-[#F5F2EA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Intention</span>
            </button>
          </form>

          <div className="space-y-2">
            {tasks.map((task) => {
              const isPrimary = task.id === activeTaskId;
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border transition-colors ${
                    isPrimary
                      ? 'bg-[#16181C]/90 border-[#F5F2EA]/25'
                      : 'bg-[#08090B]/50 border-[#F5F2EA]/6'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => auraActions.toggleTaskComplete(task.id)}
                      aria-label={`Mark ${task.title} complete`}
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 cursor-pointer ${
                        task.completed
                          ? 'bg-[#F5F2EA]/25 border-[#F5F2EA]/60 text-[#F5F2EA]'
                          : 'border-[#F5F2EA]/25 hover:border-[#F5F2EA]/60'
                      }`}
                    >
                      {task.completed && <Check className="w-2.5 h-2.5" />}
                    </button>
                    <button
                      onClick={() => auraActions.setActiveTask(task.id)}
                      className={`text-xs text-left truncate cursor-pointer ${
                        task.completed ? 'line-through text-[#92949A]' : 'text-[#F5F2EA]'
                      }`}
                    >
                      {task.title}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isPrimary && (
                      <span className="text-[10px] tracking-[0.2em] uppercase text-[#92949A]">
                        Primary Focus
                      </span>
                    )}
                    <button
                      onClick={() => auraActions.deleteTask(task.id)}
                      aria-label={`Delete ${task.title}`}
                      className="text-[#92949A]/60 hover:text-[#F5F2EA] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
