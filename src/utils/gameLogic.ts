import type { SPSGesture } from "./gestureRecognition";

export type Move = "stone" | "paper" | "scissors";
export type GameResult = "win" | "lose" | "draw";

export function randomMove(): Move {
  const moves: Move[] = ["stone", "paper", "scissors"];
  return moves[Math.floor(Math.random() * 3)];
}

export function getResult(player: Move, computer: Move): GameResult {
  if (player === computer) return "draw";
  if (
    (player === "stone" && computer === "scissors") ||
    (player === "scissors" && computer === "paper") ||
    (player === "paper" && computer === "stone")
  ) return "win";
  return "lose";
}

export const MOVE_EMOJI: Record<Move, string> = {
  stone: "✊",
  paper: "✋",
  scissors: "✌️",
};

export const MOVE_LABEL: Record<Move, string> = {
  stone: "Stone",
  paper: "Paper",
  scissors: "Scissors",
};

export function isValidMove(g: SPSGesture): g is Move {
  return g === "stone" || g === "paper" || g === "scissors";
}
