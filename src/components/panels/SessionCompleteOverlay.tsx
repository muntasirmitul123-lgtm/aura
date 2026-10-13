import React from 'react';
import { motion } from 'motion/react';
import { auraActions, useAuraStore } from '../../store/useAuraStore';

export const SessionCompleteOverlay: React.FC = () => {
  const { justCompletedSession, breakMinutes } = useAuraStore();
  if (!justCompletedSession) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-6 bg-[#08090B]/85 backdrop-blur-2xl select-none overflow-hidden"
    >
      {/* Subtle Light Sweep Passing Through the Screen */}
      <motion.div
        initial={{ x: '-120%', opacity: 0 }}
        animate={{ x: '120%', opacity: [0, 0.45, 0] }}
        transition={{ duration: 2.8, ease: 'easeInOut' }}
        className="absolute inset-y-0 w-96 bg-gradient-to-r from-transparent via-[#F5F2EA]/15 to-transparent skew-x-12 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-xs tracking-[0.34em] text-[#92949A] uppercase"
      >
        SESSION COMPLETE
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ delay: 0.45, duration: 0.9 }}
        className="mt-4 font-clock-serif text-5xl md:text-7xl font-light text-[#F5F2EA] tracking-tight"
      >
        {justCompletedSession.durationMinutes} minutes
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.9 }}
        className="mt-4 text-base md:text-lg font-light text-[#F5F2EA]/80 tracking-wide"
      >
        You stayed with it.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <button
          onClick={() => auraActions.startBreakFromCompletion()}
          className="px-6 py-2.5 rounded-full bg-[#F5F2EA] text-[#08090B] text-xs font-medium tracking-[0.2em] uppercase hover:bg-[#F5F2EA]/90 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          Take a break ({breakMinutes}m)
        </button>
        <button
          onClick={() => {
            auraActions.dismissCompletionModal();
            auraActions.startSession();
          }}
          className="px-6 py-2.5 rounded-full bg-[#16181C] border border-[#F5F2EA]/18 hover:border-[#F5F2EA]/40 text-xs tracking-[0.2em] uppercase text-[#F5F2EA] transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          Start another session
        </button>
        <button
          onClick={() => auraActions.dismissCompletionModal()}
          className="px-4 py-2 text-xs tracking-[0.18em] uppercase text-[#92949A] hover:text-[#F5F2EA] transition-colors cursor-pointer"
        >
          Return to clock
        </button>
      </motion.div>
    </motion.div>
  );
};
