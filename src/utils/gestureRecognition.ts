import type { NormalizedLandmark } from "@/types";

export type SPSGesture = "stone" | "paper" | "scissors" | "none";

const LANDMARK = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_TIP: 20,
} as const;

function dist(a: NormalizedLandmark, b: NormalizedLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function isFingerExtended(lm: NormalizedLandmark[], mcp: number, pip: number, tip: number): boolean {
  const wristToTip = dist(lm[LANDMARK.WRIST], lm[tip]);
  const wristToPip = dist(lm[LANDMARK.WRIST], lm[pip]);
  const wristToMcp = dist(lm[LANDMARK.WRIST], lm[mcp]);
  return wristToTip > wristToPip && wristToTip > wristToMcp * 1.15;
}

function isThumbExtended(lm: NormalizedLandmark[]): boolean {
  const handWidth = dist(lm[LANDMARK.PINKY_MCP], lm[LANDMARK.INDEX_MCP]) || 0.0001;
  const tipToIp = dist(lm[LANDMARK.THUMB_TIP], lm[LANDMARK.THUMB_IP]);
  const tipToPinky = dist(lm[LANDMARK.THUMB_TIP], lm[LANDMARK.PINKY_MCP]);
  const mcpToPinky = dist(lm[LANDMARK.THUMB_MCP], lm[LANDMARK.PINKY_MCP]);
  return tipToIp > handWidth * 0.35 && tipToPinky > mcpToPinky + handWidth * 0.15;
}

export function recognizeSPSGesture(lm: NormalizedLandmark[]): SPSGesture {
  if (!lm || lm.length < 21) return "none";

  const index = isFingerExtended(lm, LANDMARK.INDEX_MCP, LANDMARK.INDEX_PIP, LANDMARK.INDEX_TIP);
  const middle = isFingerExtended(lm, LANDMARK.MIDDLE_MCP, LANDMARK.MIDDLE_PIP, LANDMARK.MIDDLE_TIP);
  const ring = isFingerExtended(lm, LANDMARK.RING_MCP, LANDMARK.RING_PIP, LANDMARK.RING_TIP);
  const pinky = isFingerExtended(lm, LANDMARK.PINKY_MCP, LANDMARK.PINKY_PIP, LANDMARK.PINKY_TIP);
  const thumb = isThumbExtended(lm);

  const extCount = [index, middle, ring, pinky, thumb].filter(Boolean).length;

  // Paper: all 5 extended
  if (extCount >= 4 && index && middle && ring && pinky) return "paper";

  // Scissors: index + middle only
  if (index && middle && !ring && !pinky && extCount <= 3) return "scissors";

  // Stone: all closed (0 or 1 with thumb)
  if (!index && !middle && !ring && !pinky) return "stone";

  return "none";
}
