/**
 * Frame-rate independent exponential smoothing. `smoothing` is a time
 * constant in seconds: smaller = snappier, larger = lazier.
 */
export function damp(current: number, target: number, smoothing: number, dt: number): number {
  if (smoothing <= 0) return target;
  const t = 1 - Math.exp(-dt / smoothing);
  return current + (target - current) * t;
}

export function damp3(
  current: { x: number; y: number; z: number },
  target: { x: number; y: number; z: number },
  smoothing: number,
  dt: number
) {
  current.x = damp(current.x, target.x, smoothing, dt);
  current.y = damp(current.y, target.y, smoothing, dt);
  current.z = damp(current.z, target.z, smoothing, dt);
  return current;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/** Cubic ease-out — used for dissolve/assembly easing. */
export function easeOutCubic(t: number): number {
  const c = clamp(t, 0, 1);
  return 1 - Math.pow(1 - c, 3);
}

/** Cubic ease-in — used for the dissolve phase so it starts slow, ends fast. */
export function easeInCubic(t: number): number {
  const c = clamp(t, 0, 1);
  return c * c * c;
}

export const DISSOLVE_DURATION_S = 0.3;
export const ASSEMBLE_DURATION_S = 0.5;
export const GESTURE_COOLDOWN_S = 0.9;
/** A gesture must be held this long before it's accepted, to reject noise. */
export const GESTURE_HOLD_S = 0.35;
