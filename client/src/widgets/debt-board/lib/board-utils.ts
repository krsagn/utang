export const CANVAS_SIZE = 3000;
const CANVAS_CENTER = CANVAS_SIZE / 2;
const BASE_RADIUS = 400;
const RING_GAP = 400;
const JITTER_RADIUS = 8;
const JITTER_ANGLE = 0.05;
const MAX_ROTATION_DEG = 8;

function getEffectiveCardSize(cardSize: number): number {
  const radians = (MAX_ROTATION_DEG * Math.PI) / 180;
  return cardSize * (Math.abs(Math.cos(radians)) + Math.abs(Math.sin(radians)));
}

function getRingCapacity(radius: number, cardSize: number): number {
  const circumference = 2 * Math.PI * radius;
  return Math.max(
    1,
    Math.floor(circumference / getEffectiveCardSize(cardSize)) - 1,
  );
}

function getRings(
  total: number,
  cardSize = 340,
): { radius: number; count: number }[] {
  const rings = [];
  let remaining = total;
  let ring = 0;

  while (remaining > 0) {
    const radius = BASE_RADIUS + ring * RING_GAP;
    const capacity = getRingCapacity(radius, cardSize);
    const count = Math.min(capacity, remaining);
    rings.push({ radius, count });
    remaining -= count;
    ring++;
  }

  return rings;
}

export function hashId(id: string): number {
  return [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

function seededRandom(seed: number): number {
  const t = seed + 0x6d2b79f5;
  let x = Math.imul(t ^ (t >>> 15), 1 | t);
  x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
  return ((x ^ (x >>> 14)) >>> 0) / 0x100000000;
}

export function getCardRotation(seed: number): number {
  return (seededRandom(seed + 2) - 0.5) * 2 * MAX_ROTATION_DEG;
}

export function getCardPosition(
  index: number,
  total: number,
  seed: number,
): { x: number; y: number } {
  if (index === 0) {
    return { x: CANVAS_CENTER, y: CANVAS_CENTER };
  }

  const rings = getRings(total - 1);

  let ringIndex = 0;
  let positionInRing = index - 1;

  for (const ring of rings) {
    if (positionInRing < ring.count) {
      ringIndex = rings.indexOf(ring);
      break;
    }
    positionInRing -= ring.count;
  }

  const { radius, count } = rings[ringIndex];
  const baseAngle = ((2 * Math.PI) / count) * positionInRing;

  const jitterA = (seededRandom(seed) - 0.5) * 2 * JITTER_ANGLE;
  const jitterR = (seededRandom(seed + 1) - 0.5) * 2 * JITTER_RADIUS;

  const angle = baseAngle + jitterA;
  const r = radius + jitterR;

  return {
    x: CANVAS_CENTER + Math.cos(angle) * r,
    y: CANVAS_CENTER + Math.sin(angle) * r,
  };
}
