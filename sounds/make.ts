/**
 * The teaser's sound effects, synthesized: `pnpm tsx sounds/make.ts` writes them next to
 * this file (sound n plays sounds/<n>.wav). Noise comes from a fixed seed, so the files come
 * out the same every time.
 *
 *   130  the case clock swinging open: a slow wooden creak
 *   131  the cab moving off: hooves on cobbles over the wheels' rumble
 *   132  the sitting-room door: a latch, then a short creak
 *   133  one clock tick, for the stair
 */
import { writeFileSync } from "node:fs";

const RATE = 22050;

/** A repeatable noise source (mulberry32), -1 to 1. */
function noise(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 2147483648 - 1;
  };
}

/** A one-pole low-pass filter: higher `k` (0 to 1) lets more through. */
function lowPass(k: number) {
  let y = 0;
  return (x: number) => (y += k * (x - y));
}

function wav(samples: Float32Array): Buffer {
  const pcm = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32000), i * 2));
  const header = Buffer.alloc(44);
  header.write("RIFF", 0); header.writeUInt32LE(36 + pcm.length, 4); header.write("WAVE", 8);
  header.write("fmt ", 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24); header.writeUInt32LE(RATE * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

const seconds = (s: number) => new Float32Array(Math.round(s * RATE));

/** A creak: a buzzing, wandering pitch (wood dragging over wood), swelling and fading. */
function creak(out: Float32Array, from: number, length: number, pitch: number, seed: number) {
  const n = noise(seed), wobble = lowPass(0.0005);
  let phase = 0;
  for (let i = 0; i < length * RATE && from + i < out.length; i++) {
    const t = i / (length * RATE);
    const f = pitch * (1 + 0.35 * wobble(n()) * 40 + 0.25 * t);
    phase += f / RATE;
    // Stick-slip: short pulses rather than a smooth tone.
    const pulse = (phase % 1) < 0.18 ? 1 : -0.15;
    const envelope = Math.sin(Math.PI * t) ** 0.6;
    out[from + i]! += 0.45 * pulse * envelope * (0.7 + 0.3 * n());
  }
}

/** A knock: a short thump with a click on top (a hoof, a latch, a tick). */
function knock(out: Float32Array, at: number, body: number, click: number, loud: number, seed: number) {
  const n = noise(seed);
  for (let i = 0; i < 0.12 * RATE && at + i < out.length; i++) {
    const t = i / RATE;
    out[at + i]! += loud * (Math.sin(2 * Math.PI * body * t) * Math.exp(-t * 40) + click * n() * Math.exp(-t * 300));
  }
}

const sounds: Record<number, () => Float32Array> = {
  130: () => {
    const out = seconds(1.8);
    creak(out, 0, 1.5, 90, 1);
    creak(out, Math.round(0.9 * RATE), 0.8, 140, 2);
    knock(out, Math.round(1.6 * RATE), 70, 0.4, 0.6, 3); // it comes to rest
    return out;
  },
  131: () => {
    const out = seconds(2.6), n = noise(4), rumble = lowPass(0.01);
    for (let i = 0; i < out.length; i++) {
      const t = i / out.length;
      out[i]! += 0.25 * rumble(n()) * 6 * Math.min(1, t * 4) * (1 - t);
    }
    // Two horses' worth of hooves, picking up pace, then going away.
    let at = 0.1, gap = 0.32;
    for (let k = 0; at < 2.4; k++) {
      const away = Math.max(0.15, 1 - at / 2.6);
      knock(out, Math.round(at * RATE), 120 + (k % 2) * 25, 0.8, 0.6 * away, 10 + k);
      at += gap * (k % 2 ? 1.4 : 0.6);
      gap = Math.max(0.2, gap * 0.95);
    }
    return out;
  },
  132: () => {
    const out = seconds(1.0);
    knock(out, 0, 900, 1.2, 0.5, 20); // the latch
    knock(out, Math.round(0.05 * RATE), 600, 0.8, 0.3, 21);
    creak(out, Math.round(0.15 * RATE), 0.7, 160, 22);
    return out;
  },
  133: () => {
    const out = seconds(0.3);
    knock(out, 0, 1800, 1.5, 0.45, 30);
    return out;
  },
};

for (const [n, make] of Object.entries(sounds)) {
  const file = new URL(`./${n}.wav`, import.meta.url);
  writeFileSync(file, wav(make()));
  console.log(`sounds/${n}.wav`);
}
