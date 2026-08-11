import { AnimatePresence, motion } from "framer-motion";
import type { HandState } from "@/types";
import type { Move } from "@/utils/gameLogic";
import { useGameState } from "@/hooks/useGameState";
import ScoreBoard from "./ScoreBoard";
import GestureIndicator from "./GestureIndicator";
import ResultDisplay from "./ResultDisplay";
import MoveDisplay from "./MoveDisplay";
import { MOVE_EMOJI, MOVE_LABEL } from "@/utils/gameLogic";

interface GameArenaProps {
  hand: HandState;
}

interface MoveCardProps {
  move: Move;
  label: string;
  isPlayer?: boolean;
}

function MoveCard({ move, label, isPlayer }: MoveCardProps) {
  const borderColor = isPlayer ? "#5ff2ff44" : "#ff7a5c44";
  const glowColor   = isPlayer ? "#5ff2ff"   : "#ff7a5c";

  return (
    <div
      className="flex flex-1 flex-col items-center gap-2 rounded-2xl border bg-black/40 p-3 backdrop-blur-md"
      style={{ borderColor, boxShadow: `0 0 20px ${glowColor}22` }}
    >
      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: glowColor }}>
        {label}
      </div>
      <div className="h-28 w-28">
        <MoveDisplay move={move} isPlayer={isPlayer} />
      </div>
      <div className="text-center">
        <div className="text-2xl">{MOVE_EMOJI[move]}</div>
        <div className="text-sm font-semibold text-white/80">{MOVE_LABEL[move]}</div>
      </div>
    </div>
  );
}

export default function GameArena({ hand }: GameArenaProps) {
  const { state, resetScore } = useGameState(hand);
  const { phase, detectedGesture, holdProgress, countdown, playerMove, computerMove, result, score } = state;

  const showGesture  = phase === "waiting" || phase === "holding";
  const showCountdown = phase === "countdown";
  const showMoves    = (phase === "reveal" || phase === "result") && !!playerMove && !!computerMove;
  const showResult   = phase === "result";

  // Key for AnimatePresence — changes when the visible panel changes
  const panelKey = showCountdown ? `cd-${countdown}` : showMoves ? "moves" : "idle";

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-4 pb-8">
      {/* Top: Score */}
      <div className="pointer-events-auto mt-2">
        <ScoreBoard score={score} onReset={resetScore} />
      </div>

      {/* Middle: Countdown or Move cards */}
      <div className="flex w-full max-w-lg flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          {showCountdown && (
            <motion.div
              key={panelKey}
              className="text-center"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div
                className="text-9xl font-bold font-display"
                style={{ color: "#5ff2ff", textShadow: "0 0 40px #5ff2ff, 0 0 80px #5ff2ff44" }}
              >
                {countdown}
              </div>
            </motion.div>
          )}

          {showMoves && (
            <motion.div
              key={panelKey}
              className="flex w-full items-center justify-center gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <MoveCard move={playerMove!} label="You" isPlayer />
              <div className="text-2xl font-bold text-white/40">VS</div>
              <MoveCard move={computerMove!} label="CPU" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: Gesture indicator */}
      <div className="flex flex-col items-center gap-3">
        <AnimatePresence>
          {showGesture && (
            <motion.div
              key="gesture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col items-center gap-3"
            >
              <GestureIndicator gesture={detectedGesture} holdProgress={holdProgress} phase={phase} />
              {phase === "waiting" && (
                <div className="flex gap-3 text-sm text-white/30">
                  <span>✊ Stone</span>
                  <span>✋ Paper</span>
                  <span>✌️ Scissors</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result overlay */}
      <ResultDisplay result={result} visible={showResult} />
    </div>
  );
}
