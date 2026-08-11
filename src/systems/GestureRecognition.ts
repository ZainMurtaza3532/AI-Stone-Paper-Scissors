import type { GestureName, GestureResult, NormalizedLandmark } from "@/types";

/**
 * MediaPipe HandLandmarker landmark indices (21 points per hand).
 * https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker
 */
const LANDMARK = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_TIP: 20,
} as const;

function dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/**
 * A finger counts as "extended" if its tip is meaningfully farther from the
 * palm base (MCP-adjacent joint) than the corresponding PIP joint is. This is
 * scale- and rotation-tolerant, unlike a naive y-coordinate comparison.
 */
function isFingerExtended(
  landmarks: NormalizedLandmark[],
  mcp: number,
  pip: number,
  tip: number,
  wrist: number
): boolean {
  const wristToMcp = dist(landmarks[wrist], landmarks[mcp]);
  const wristToTip = dist(landmarks[wrist], landmarks[tip]);
  const wristToPip = dist(landmarks[wrist], landmarks[pip]);
  // Extended fingers push the tip well beyond the pip, relative to hand size.
  return wristToTip > wristToPip && wristToTip > wristToMcp * 1.15;
}

/**
 * Thumb uses a sideways distance check instead, since it flexes across the
 * palm rather than curling toward the wrist like the other four fingers.
 */
function isThumbExtended(landmarks: NormalizedLandmark[]): boolean {
  const tip = landmarks[LANDMARK.THUMB_TIP];
  const ip = landmarks[LANDMARK.THUMB_IP];
  const mcp = landmarks[LANDMARK.THUMB_MCP];
  const pinkyMcp = landmarks[LANDMARK.PINKY_MCP];
  const indexMcp = landmarks[LANDMARK.INDEX_MCP];

  // Hand "width" reference so the threshold scales with hand size/distance.
  const handWidth = dist(pinkyMcp, indexMcp) || 0.0001;
  const tipToIp = dist(tip, ip);
  const tipToPinkyMcp = dist(tip, pinkyMcp);
  const mcpToPinkyMcp = dist(mcp, pinkyMcp);

  return tipToIp > handWidth * 0.35 && tipToPinkyMcp > mcpToPinkyMcp + handWidth * 0.15;
}

export function countExtendedFingers(landmarks: NormalizedLandmark[]): number {
  if (!landmarks || landmarks.length < 21) return 0;

  const fingers = [
    isFingerExtended(landmarks, LANDMARK.INDEX_MCP, LANDMARK.INDEX_PIP, LANDMARK.INDEX_TIP, LANDMARK.WRIST),
    isFingerExtended(landmarks, LANDMARK.MIDDLE_MCP, LANDMARK.MIDDLE_PIP, LANDMARK.MIDDLE_TIP, LANDMARK.WRIST),
    isFingerExtended(landmarks, LANDMARK.RING_MCP, LANDMARK.RING_PIP, LANDMARK.RING_TIP, LANDMARK.WRIST),
    isFingerExtended(landmarks, LANDMARK.PINKY_MCP, LANDMARK.PINKY_PIP, LANDMARK.PINKY_TIP, LANDMARK.WRIST),
  ];

  const thumbExtended = isThumbExtended(landmarks);
  return fingers.filter(Boolean).length + (thumbExtended ? 1 : 0);
}

/**
 * Maps a finger count to the gesture vocabulary the app understands.
 * Matches the spec's mapping: 5 -> puppy, 2 -> parrot, 3 -> rabbit,
 * 4 -> snake, 0 (fist) -> fish. A count of 1 has no assignment and is
 * treated as "none" so a single pointed finger doesn't cause flicker.
 */
export function fingerCountToGesture(count: number): GestureName {
  switch (count) {
    case 0:
      return "closed_fist";
    case 2:
      return "two_fingers";
    case 3:
      return "three_fingers";
    case 4:
      return "four_fingers";
    case 5:
      return "open_five";
    default:
      return "none";
  }
}

export function recognizeGesture(landmarks: NormalizedLandmark[]): GestureResult {
  const fingerCount = countExtendedFingers(landmarks);
  const gesture = fingerCountToGesture(fingerCount);
  // Simple confidence heuristic: gestures at the "edges" (0 and 5 fingers)
  // are geometrically easier to detect reliably than mid counts.
  const confidence = gesture === "none" ? 0 : fingerCount === 0 || fingerCount === 5 ? 1 : 0.85;
  return { gesture, fingerCount, confidence };
}

export function palmCenter(landmarks: NormalizedLandmark[]): NormalizedLandmark | null {
  if (!landmarks || landmarks.length < 21) return null;
  const ids = [LANDMARK.WRIST, LANDMARK.INDEX_MCP, LANDMARK.MIDDLE_MCP, LANDMARK.RING_MCP, LANDMARK.PINKY_MCP];
  const sum = ids.reduce(
    (acc, i) => ({ x: acc.x + landmarks[i].x, y: acc.y + landmarks[i].y, z: acc.z + landmarks[i].z }),
    { x: 0, y: 0, z: 0 }
  );
  return { x: sum.x / ids.length, y: sum.y / ids.length, z: sum.z / ids.length };
}

/** Rough hand "span" (wrist to middle-finger MCP), used to derive scale/depth. */
export function handSpan(landmarks: NormalizedLandmark[]): number {
  if (!landmarks || landmarks.length < 21) return 0;
  return dist(landmarks[LANDMARK.WRIST], landmarks[LANDMARK.MIDDLE_MCP]);
}
