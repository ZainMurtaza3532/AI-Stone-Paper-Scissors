/**
 * Pure data engine for the dissolve/assemble particle effect used when the
 * active pet changes. It owns no rendering code — HologramScene/PetModel
 * feed it Float32Arrays and read back interpolated positions each frame.
 * Keeping this framework-agnostic makes it trivial to unit test and reuse.
 */

export interface ParticleBurst {
  count: number;
  /** Points sampled from the pet's silhouette — the particles' "home". */
  origins: Float32Array; // [x0,y0,z0, x1,y1,z1, ...]
  /** Random outward directions used while dissolving. */
  scatter: Float32Array; // same layout as origins
  seeds: Float32Array; // per-particle random seed in [0, 1) for jitter/timing
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Builds a burst by sampling random points within/around a sphere of the
 * given radius, which is a reasonable stand-in "silhouette" for any of the
 * procedural pets (they're all roughly sphere-bounded).
 */
export function createBurst(count: number, radius: number): ParticleBurst {
  const origins = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Sample inside a sphere (rejection-free via cube-root radius trick).
    const u = Math.random();
    const r = radius * Math.cbrt(u);
    const theta = rand(0, Math.PI * 2);
    const phi = Math.acos(rand(-1, 1));

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    origins[i * 3] = x;
    origins[i * 3 + 1] = y;
    origins[i * 3 + 2] = z;

    // Scatter direction: outward from origin, plus extra randomness, scaled up.
    const scatterMag = rand(1.5, 3.5);
    const len = Math.hypot(x, y, z) || 1;
    scatter[i * 3] = (x / len) * scatterMag + rand(-0.4, 0.4);
    scatter[i * 3 + 1] = (y / len) * scatterMag + rand(-0.4, 0.4) + rand(0, 0.6); // slight upward drift
    scatter[i * 3 + 2] = (z / len) * scatterMag + rand(-0.4, 0.4);

    seeds[i] = Math.random();
  }

  return { count, origins, scatter, seeds };
}

/**
 * Writes the interpolated positions for a given phase progress into `out`.
 * - dissolving: origin -> scatter, eased out (fast departure)
 * - assembling: scatter -> origin, eased in->out (converges with a settle)
 * - idle: origin
 */
export function writeParticlePositions(
  out: Float32Array,
  burst: ParticleBurst,
  phase: "idle" | "dissolving" | "assembling",
  progress: number // 0..1 eased progress for the current phase
): void {
  const { count, origins, scatter, seeds } = burst;
  for (let i = 0; i < count; i++) {
    const ix = i * 3;
    const iy = i * 3 + 1;
    const iz = i * 3 + 2;

    // Stagger start times slightly per-particle using the seed, for organic feel.
    const localT = phase === "idle" ? 1 : clamp01(progress * 1.15 - seeds[i] * 0.15);

    let ox: number, oy: number, oz: number;
    if (phase === "dissolving") {
      ox = origins[ix] + (scatter[ix] - 0) * localT;
      oy = origins[iy] + (scatter[iy] - 0) * localT;
      oz = origins[iz] + (scatter[iz] - 0) * localT;
    } else if (phase === "assembling") {
      const t = 1 - localT; // starts scattered, converges to origin
      ox = origins[ix] + (scatter[ix] - 0) * t;
      oy = origins[iy] + (scatter[iy] - 0) * t;
      oz = origins[iz] + (scatter[iz] - 0) * t;
    } else {
      ox = origins[ix];
      oy = origins[iy];
      oz = origins[iz];
    }

    out[ix] = ox;
    out[iy] = oy;
    out[iz] = oz;
  }
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
