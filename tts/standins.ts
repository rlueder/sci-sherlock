import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { KokoroTTS } from "kokoro-js";

/**
 * Stand-in voices: every line in voices/lines.json without a real recording gets one made
 * with Kokoro, in the voice tts/cast.json gives its speaker. voices/stand-ins.json lists the
 * WAVs made here and the text each was made for; a line whose text changes gets a new one,
 * and a WAV not on the list (a real recording) is never touched.
 *
 *   pnpm --dir tts install     (once: Kokoro and its runtime, about 430 MB)
 *   pnpm voices                (the model, 92 MB, is fetched on the first run)
 */
const root = join(import.meta.dirname, "..");
const voices = join(root, "voices");
const cast = JSON.parse(readFileSync(join(import.meta.dirname, "cast.json"), "utf8")) as {
  model: string;
  voices: Record<string, { voice: string; speed: number }>;
  say: Record<string, string>;
};
const RATE = 11025;

const refreshScript = () => execFileSync("pnpm", ["exec", "sci-ts", "lines", "script"], { cwd: root, stdio: "inherit" });
refreshScript();
const { lines } = JSON.parse(readFileSync(join(voices, "lines.json"), "utf8")) as { lines: { id: string; speaker: string; text: string }[] };
const listFile = join(voices, "stand-ins.json");
const made: Record<string, string> = existsSync(listFile) ? JSON.parse(readFileSync(listFile, "utf8")) : {};
const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 12);

const todo = lines.filter((l) => {
  const wav = join(voices, `${l.id}.wav`);
  if (existsSync(wav) && !(l.id in made)) return false; // a real recording
  return made[l.id] !== hash(l.text) || !existsSync(wav);
});
for (const l of todo) if (!cast.voices[l.speaker]) throw new Error(`${l.id}: no voice for ${l.speaker} in tts/cast.json`);

if (todo.length) {
  const tts = await KokoroTTS.from_pretrained(cast.model, { dtype: "q8", device: "cpu" });
  for (const l of todo) {
    const { voice, speed } = cast.voices[l.speaker]!;
    const spoken = Object.entries(cast.say).reduce((t, [from, to]) => t.split(from).join(to), l.text);
    const audio = await tts.generate(spoken, { voice: voice as never, speed });
    writeFileSync(join(voices, `${l.id}.wav`), wav(resample(audio.audio, audio.sampling_rate, RATE), RATE));
    made[l.id] = hash(l.text);
    console.log(`${l.id} ${l.speaker}: ${l.text}`);
  }
}
// Stand-ins for lines that are gone.
const ids = new Set(lines.map((l) => l.id));
for (const id of Object.keys(made)) if (!ids.has(id)) (rmSync(join(voices, `${id}.wav`), { force: true }), delete made[id]);
writeFileSync(listFile, `${JSON.stringify(Object.fromEntries(Object.entries(made).sort()), null, 2)}\n`);
refreshScript();
console.log(`${todo.length} stand-ins made; ${Object.keys(made).length} lines have one`);

/** Band-limited resampling: a Blackman-windowed sinc, cut off below the lower rate's Nyquist frequency. */
function resample(x: Float32Array, from: number, to: number): Float32Array {
  const n = Math.round((x.length * to) / from), out = new Float32Array(n);
  const cutoff = 0.95 * Math.min(1, to / from), half = Math.ceil(16 / cutoff);
  for (let i = 0; i < n; i++) {
    const centre = (i * from) / to;
    let sum = 0, weight = 0;
    for (let j = Math.ceil(centre - half); j <= Math.floor(centre + half); j++) {
      const t = j - centre;
      const k = (t === 0 ? 1 : Math.sin(Math.PI * cutoff * t) / (Math.PI * cutoff * t))
        * (0.42 + 0.5 * Math.cos((Math.PI * t) / half) + 0.08 * Math.cos((2 * Math.PI * t) / half));
      weight += k;
      if (j >= 0 && j < x.length) sum += x[j]! * k;
    }
    out[i] = sum / weight;
  }
  return out;
}

/** 16-bit mono PCM WAV. */
function wav(x: Float32Array, rate: number): Uint8Array {
  const v = new DataView(new ArrayBuffer(44 + x.length * 2));
  const text = (at: number, s: string) => [...s].forEach((c, i) => v.setUint8(at + i, c.charCodeAt(0)));
  text(0, "RIFF"); v.setUint32(4, 36 + x.length * 2, true); text(8, "WAVE");
  text(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  text(36, "data"); v.setUint32(40, x.length * 2, true);
  x.forEach((s, i) => v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, s)) * 32767), true));
  return new Uint8Array(v.buffer);
}
