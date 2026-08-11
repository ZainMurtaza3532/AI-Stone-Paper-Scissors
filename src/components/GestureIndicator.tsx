import { motion, AnimatePresence } from "framer-motion";
import type { SPSGesture } from "@/utils/gestureRecognition";
import type { GamePhase } from "@/hooks/useGameState";

const GESTURE_INFO: Record<SPSGesture, { emoji: string; label: string }> = {
  stone:    { emoji: "✊", label: "Stone" },
  paper:    { emoji: "✋", label: "Paper" },
  scissors: { emoji: "✌️", label: "Scissors" },
  none:     { emoji: "👋", label: "Show a gesture" },
};

interface GestureIndicatorProps {
  gesture: SPSGesture;
  holdProgress: number;
  phase: GamePhase;
}

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function GestureIndicator({ gesture, holdProgress, phase }: GestureIndicatorProps) {
  const info = GESTURE_INFO[gesture];
  const isHolding = phase === "holding" && gesture !== "none";
  const offset = CIRCUMFERENCE - CIRCUMFERENCE * holdProgress;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Progress ring — sits outside the emoji div so it doesn't clip */}
        <svg
          width="72"
          height="72"
          className="absolute -rotate-90 pointer-events-none"
          style={{ top: "-4px", left: "-4px" }}
        >
          <circle
            cx="36" cy="36" r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
          />
          <motion.circle
            cx="36" cy="36" r={RADIUS}
            fill="none"
            stroke="#5ff2ff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{
              strokeDashoffset: offset,
              filter: isHolding ? "drop-shadow(0 0 6px #5ff2ff)" : "none",
            }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </svg>

        {/* Emoji */}
        <AnimatePresence mode="wait">
          <motion.div
            key={gesture}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/40 text-3xl backdrop-blur-md"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {info.emoji}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-center">
        <div className="text-sm font-semibold text-white/80">{info.label}</div>
        {phase === "waiting" && gesture === "none" && (
          <div className="text-xs text-white/40">Hold gesture to play</div>
        )}
        {isHolding && (
          <div className="text-xs text-cyan-400">Hold steady…</div>
        )}
      </div>
    </div>
  );
}
