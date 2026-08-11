import { motion } from "framer-motion";
import type { Score } from "@/hooks/useGameState";

interface ScoreBoardProps {
  score: Score;
  onReset: () => void;
}

export default function ScoreBoard({ score, onReset }: ScoreBoardProps) {
  return (
    <motion.div
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 px-5 py-3 backdrop-blur-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center">
        <div className="text-xs font-medium uppercase tracking-widest text-cyan-400">You</div>
        <motion.div
          key={score.player}
          className="text-3xl font-bold text-white font-display"
          initial={{ scale: 1.5, color: "#5ff2ff" }}
          animate={{ scale: 1, color: "#ffffff" }}
          transition={{ duration: 0.4 }}
        >
          {score.player}
        </motion.div>
      </div>

      <div className="text-xl font-bold text-white/30">:</div>

      <div className="text-center">
        <div className="text-xs font-medium uppercase tracking-widest text-orange-400">CPU</div>
        <motion.div
          key={score.computer}
          className="text-3xl font-bold text-white font-display"
          initial={{ scale: 1.5, color: "#ff7a5c" }}
          animate={{ scale: 1, color: "#ffffff" }}
          transition={{ duration: 0.4 }}
        >
          {score.computer}
        </motion.div>
      </div>

      <button
        onClick={onReset}
        className="ml-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/10 hover:text-white"
      >
        Reset
      </button>
    </motion.div>
  );
}
