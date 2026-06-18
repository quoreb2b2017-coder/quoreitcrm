/** Deterministic 0–100 value from seed (same on server & client). */
export function seededPercent(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 100;
}

/** Deterministic value in [min, max]. */
export function seededRange(seed, min, max) {
  const x = Math.sin(seed * 93.9898 + 12.233) * 43758.5453;
  const t = x - Math.floor(x);
  return min + t * (max - min);
}

/** Deterministic integer in [min, max] inclusive. */
export function seededInt(seed, min, max) {
  return Math.floor(seededRange(seed, min, max + 0.999));
}
