import { useCallback, useEffect, useRef, useState } from "react";
import type { HandState } from "@/types";
import { recognizeSPSGesture, type SPSGesture } from "@/utils/gestureRecognition";
import { randomMove, getResult, isValidMove, type Move, type GameResult } from "@/utils/gameLogic";

export type GamePhase = "waiting" | "holding" | "countdown" | "reveal" | "result";

export interface Score { player: number; computer: number; }

export interface GameState {
  phase: GamePhase;
  detectedGesture: SPSGesture;
  holdProgress: number;
  countdown: number;
  playerMove: Move | null;
  computerMove: Move | null;
  result: GameResult | null;
  score: Score;
}

const HOLD_DURATION = 500;
const COUNTDOWN_INTERVAL = 800;

export function useGameState(hand: HandState) {
  const [state, setState] = useState<GameState>({
    phase: "waiting",
    detectedGesture: "none",
    holdProgress: 0,
    countdown: 3,
    playerMove: null,
    computerMove: null,
    result: null,
    score: { player: 0, computer: 0 },
  });

  // Mirror hand into a ref so the rAF loop always reads the latest value
  // without needing hand in its dependency array (which would restart the
  // loop on every single MediaPipe frame — a new object each time).
  const handRef = useRef<HandState>(hand);
  useEffect(() => { handRef.current = hand; }, [hand]);

  const holdStartRef = useRef<number | null>(null);
  const lastGestureRef = useRef<SPSGesture>("none");
  const phaseRef = useRef<GamePhase>("waiting");
  const scoreRef = useRef<Score>({ player: 0, computer: 0 });
  const rafRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const runCountdown = useCallback((playerMove: Move) => {
    phaseRef.current = "countdown";
    setState(s => ({ ...s, phase: "countdown", countdown: 3, playerMove }));

    let count = 3;
    const tick = () => {
      count--;
      if (count > 0) {
        setState(s => ({ ...s, countdown: count }));
        countdownTimerRef.current = setTimeout(tick, COUNTDOWN_INTERVAL);
      } else {
        const computerMove = randomMove();
        const result = getResult(playerMove, computerMove);
        const newScore = { ...scoreRef.current };
        if (result === "win") newScore.player++;
        else if (result === "lose") newScore.computer++;
        scoreRef.current = newScore;

        phaseRef.current = "reveal";
        setState(s => ({ ...s, phase: "reveal", computerMove, result, score: newScore }));

        countdownTimerRef.current = setTimeout(() => {
          phaseRef.current = "result";
          setState(s => ({ ...s, phase: "result" }));

          countdownTimerRef.current = setTimeout(() => {
            phaseRef.current = "waiting";
            holdStartRef.current = null;
            lastGestureRef.current = "none";
            setState(s => ({
              ...s,
              phase: "waiting",
              detectedGesture: "none",
              holdProgress: 0,
              countdown: 3,
              playerMove: null,
              computerMove: null,
              result: null,
            }));
          }, 2500);
        }, COUNTDOWN_INTERVAL);
      }
    };

    countdownTimerRef.current = setTimeout(tick, COUNTDOWN_INTERVAL);
  }, []);  // clearCountdown not needed here — countdownTimerRef is accessed directly

  // Single long-lived rAF loop. Reads hand via handRef so it never needs to
  // restart when hand updates, avoiding loop teardown/restart every frame.
  useEffect(() => {
    const loop = () => {
      const phase = phaseRef.current;

      if (phase === "waiting" || phase === "holding") {
        const h = handRef.current;
        const gesture = h.present ? recognizeSPSGesture(h.landmarks) : "none";

        if (gesture !== lastGestureRef.current) {
          lastGestureRef.current = gesture;
          holdStartRef.current = gesture !== "none" ? performance.now() : null;
          phaseRef.current = gesture === "none" ? "waiting" : phase;
          setState(s => ({
            ...s,
            detectedGesture: gesture,
            holdProgress: 0,
            phase: gesture === "none" ? "waiting" : s.phase,
          }));
        } else if (gesture !== "none" && holdStartRef.current !== null) {
          const elapsed = performance.now() - holdStartRef.current;
          const progress = Math.min(elapsed / HOLD_DURATION, 1);

          if (progress < 1) {
            if (phaseRef.current !== "holding") phaseRef.current = "holding";
            setState(s => ({ ...s, phase: "holding", holdProgress: progress, detectedGesture: gesture }));
          } else if (isValidMove(gesture) && phaseRef.current !== "countdown") {
            clearCountdown();
            holdStartRef.current = null;
            runCountdown(gesture);
          }
        } else if (gesture === "none" && phaseRef.current === "holding") {
          phaseRef.current = "waiting";
          setState(s => ({ ...s, phase: "waiting", holdProgress: 0 }));
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearCountdown();
    };
  }, [clearCountdown, runCountdown]); // hand intentionally excluded — read via handRef

  const resetScore = useCallback(() => {
    scoreRef.current = { player: 0, computer: 0 };
    setState(s => ({ ...s, score: { player: 0, computer: 0 } }));
  }, []);

  return { state, resetScore };
}
