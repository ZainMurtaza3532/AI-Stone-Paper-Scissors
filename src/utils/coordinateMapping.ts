import type { NormalizedLandmark } from "@/types";

/**
 * MediaPipe returns landmarks normalized to [0,1] with x=0 at the LEFT of
 * the (unmirrored) input frame, y=0 at the TOP, z roughly camera-relative
 * depth (negative = closer to camera). We convert that into a comfortable
 * Three.js world-space box centered on the origin, and mirror x because the
 * camera preview is shown mirrored (selfie-view), which is what users expect.
 */

export interface WorldMappingOptions {
  /** Half-width of the mapped world-space area on X. */
  rangeX?: number;
  /** Half-height of the mapped world-space area on Y. */
  rangeY?: number;
  /** How strongly landmark z affects world depth. */
  depthScale?: number;
  /** Mirror x to match the mirrored camera preview. */
  mirror?: boolean;
}

const DEFAULTS: Required<WorldMappingOptions> = {
  rangeX: 3.2,
  rangeY: 1.9,
  depthScale: 4,
  mirror: true,
};

export function landmarkToWorld(
  point: NormalizedLandmark,
  opts: WorldMappingOptions = {}
): { x: number; y: number; z: number } {
  const { rangeX, rangeY, depthScale, mirror } = { ...DEFAULTS, ...opts };

  const nx = mirror ? 1 - point.x : point.x;
  const x = (nx - 0.5) * 2 * rangeX;
  const y = (0.5 - point.y) * 2 * rangeY; // flip so up in image = up in world
  const z = -point.z * depthScale; // MediaPipe z is negative toward camera

  return { x, y, z };
}

/**
 * Converts a hand-span (wrist-to-MCP distance in normalized units) into a
 * hologram scale multiplier. Larger span = hand closer to camera = bigger
 * hologram, clamped to a sane range so it never vanishes or overflows.
 */
export function handSpanToScale(span: number): number {
  const MIN_SPAN = 0.09;
  const MAX_SPAN = 0.32;
  const MIN_SCALE = 0.65;
  const MAX_SCALE = 1.6;

  const t = (span - MIN_SPAN) / (MAX_SPAN - MIN_SPAN);
  const clamped = Math.max(0, Math.min(1, t));
  return MIN_SCALE + clamped * (MAX_SCALE - MIN_SCALE);
}
