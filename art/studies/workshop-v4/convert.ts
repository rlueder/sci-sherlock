/** Deterministic concept conversion, not a game-build step. No generation or dithering. */
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { decodePng, rgbaPng } from "sci2-ts/png";
import { buildArt } from "sci2-ts/art";

const dir = fileURLToPath(new URL(".", import.meta.url));
const out = join(dir, "converted"); mkdirSync(out, { recursive: true });
const source = decodePng(readFileSync(join(dir, "workshop.png")));
const width = 320, height = 200;
type RGB = [number, number, number];
// Sample pixel centres without interpolation. Compress the 4:3 composition to
// SCI's grid; the 4:3 display below restores its intended proportions.
const small: RGB[] = [];
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  const sx = Math.floor((x + .5) * source.width / width);
  const sy = Math.floor((y + .5) * source.height / height);
  const at = (sy * source.width + sx) * 4;
  assert.equal(source.data[at + 3], 255, "study must be opaque");
  small.push([source.data[at]!, source.data[at + 1]!, source.data[at + 2]!]);
}

// Weighted median cut: 62 representative scene colours, plus library black and white.
const histogram = new Map<string, { rgb: RGB; count: number }>();
for (const rgb of small) {
  const key = rgb.join(","), entry = histogram.get(key);
  if (entry) entry.count++; else histogram.set(key, { rgb, count: 1 });
}
type Bin = { rgb: RGB; count: number }[];
const variance = (bin: Bin) => {
  const count = bin.reduce((n, p) => n + p.count, 0);
  const mean = [0, 1, 2].map((c) => bin.reduce((n, p) => n + p.rgb[c]! * p.count, 0) / count);
  return [0, 1, 2].map((c) => bin.reduce((n, p) => n + (p.rgb[c]! - mean[c]!) ** 2 * p.count, 0) * [2, 4, 1][c]!);
};
const boxes: Bin[] = [[...histogram.values()]];
while (boxes.length < 62) {
  let best = -1, score = -1, axis = 0;
  boxes.forEach((box, i) => {
    if (box.length < 2) return;
    const v = variance(box), a = v.indexOf(Math.max(...v));
    if (v[a]! > score) { best = i; axis = a; score = v[a]!; }
  });
  if (best < 0) break;
  const box = boxes[best]!;
  box.sort((a, b) => a.rgb[axis]! - b.rgb[axis]! || a.rgb[0] - b.rgb[0] || a.rgb[1] - b.rgb[1] || a.rgb[2] - b.rgb[2]);
  const half = box.reduce((n, p) => n + p.count, 0) / 2;
  let at = 0, count = 0;
  do { count += box[at++]!.count; } while (count < half && at < box.length - 1);
  boxes.splice(best, 1, box.slice(0, at), box.slice(at));
}
const palette: RGB[] = [[0, 0, 0], ...boxes.map((box) => {
  const n = box.reduce((total, p) => total + p.count, 0);
  return [0, 1, 2].map((c) => Math.round(box.reduce((sum, p) => sum + p.rgb[c]! * p.count, 0) / n)) as RGB;
}).sort((a, b) => (a[0] * 2 + a[1] * 4 + a[2]) - (b[0] * 2 + b[1] * 4 + b[2])), [255, 255, 255]];
const hex = (rgb: RGB) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
assert.equal(new Set(palette.map(hex)).size, palette.length);
assert(palette.length <= 64);
const data = new Uint8Array(width * height * 4);
const used = new Set<string>();
small.forEach((rgb, i) => {
  let nearest = palette[0]!, best = Infinity;
  for (const p of palette) {
    const d = 2 * (p[0] - rgb[0]) ** 2 + 4 * (p[1] - rgb[1]) ** 2 + (p[2] - rgb[2]) ** 2;
    if (d < best) { best = d; nearest = p; }
  }
  used.add(hex(nearest)); data.set([...nearest, 255], i * 4);
});
writeFileSync(join(out, "workshop-320x200.png"), rgbaPng({ width, height, data }));
// Nearest-neighbour display correction, never interpolated. Every output colour is
// already present in the native image; no extra detail can appear in this enlargement.
const pw = 960, ph = 720, preview = new Uint8Array(pw * ph * 4);
for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
  const i = (Math.floor(y * height / ph) * width + Math.floor(x * width / pw)) * 4;
  preview.set(data.subarray(i, i + 4), (y * pw + x) * 4);
}
writeFileSync(join(out, "workshop-4x3.png"), rgbaPng({ width: pw, height: ph, data: preview }));
writeFileSync(join(out, "palette.json"), JSON.stringify(palette.map(hex), null, 2) + "\n");
writeFileSync(join(out, "palette.gpl"), `GIMP Palette\nName: Sherlock V4 conversion study\nColumns: 8\n# Candidate only; not the game's approved shared palette\n${palette.map((p) => `${p.join(" ")}\t${hex(p)}`).join("\n")}\n`);
writeFileSync(join(out, "art.json"), JSON.stringify({ version: 1, palette: "palette.json", maxColours: 64, pictures: [{ number: 102, layers: [{ png: "workshop-320x200.png", priority: -1000 }] }], views: [] }, null, 2) + "\n");
const built = buildArt(join(out, "art.json"));
const saved = decodePng(readFileSync(join(out, "workshop-320x200.png")));
assert.equal(saved.width, 320); assert.equal(saved.height, 200);
assert.deepEqual(saved.data, data); assert(used.size <= 64);
const report = { source: "../workshop.png", sourceSize: [source.width, source.height], nativeSize: [width, height], displaySize: [pw, ph], paletteEntries: palette.length, usedColours: used.size, dithering: false, sampling: "nearest neighbour, then weighted RGB median-cut palette mapping", displaySampling: "nearest neighbour; vertical 6:5 pixel-aspect correction", importerValidated: built.images === 1, status: "Flattened conversion study; Holmes and props are not separate layers" };
writeFileSync(join(out, "report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
