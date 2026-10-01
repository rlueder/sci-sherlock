/** Local character revision: keep the approved palette and pixels outside Holmes's region. */
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { decodePng, rgbaPng } from "sci-ts/png";
import { buildArt } from "sci-ts/art";

const dir = fileURLToPath(new URL(".", import.meta.url)), out = join(dir, "converted");
const previous = join(dir, "../workshop-v4/converted");
mkdirSync(out, { recursive: true });
const base = decodePng(readFileSync(join(previous, "workshop-320x200.png")));
const source = decodePng(readFileSync(join(dir, "workshop-source.png")));
const colours = JSON.parse(readFileSync(join(previous, "palette.json"), "utf8")) as string[];
const palette = colours.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
assert.equal(base.width, 320); assert.equal(base.height, 200); assert.equal(palette.length, 64);
const data = base.data.slice(), region = [122, 59, 161, 165] as const;
// The editor can alter distant pixels; copy only the character's bounded revision area.
// Include his old silhouette so the slightly smaller head/hands leave no ghost pixels.
for (let y = region[1]; y < region[3]; y++) for (let x = region[0]; x < region[2]; x++) {
  const sx = Math.floor((x + .5) * source.width / 320), sy = Math.floor((y + .5) * source.height / 200);
  const at = (sy * source.width + sx) * 4;
  assert.equal(source.data[at + 3], 255);
  let best = Infinity, selected = palette[0]!;
  for (const rgb of palette) {
    const d = 2 * (rgb[0]! - source.data[at]!) ** 2 + 4 * (rgb[1]! - source.data[at + 1]!) ** 2 + (rgb[2]! - source.data[at + 2]!) ** 2;
    if (d < best) { best = d; selected = rgb; }
  }
  data.set([...selected, 255], (y * 320 + x) * 4);
}
let changed = 0; const used = new Set<string>();
for (let y = 0; y < 200; y++) for (let x = 0; x < 320; x++) {
  const at = (y * 320 + x) * 4;
  used.add([...data.subarray(at, at + 3)].join(","));
  const different = data.subarray(at, at + 4).some((v, c) => v !== base.data[at + c]);
  if (different) {
    changed++;
    assert(x >= region[0] && x < region[2] && y >= region[1] && y < region[3], "background changed outside character region");
  }
}
assert(changed > 0); assert(used.size <= 64);
writeFileSync(join(out, "workshop-320x200.png"), rgbaPng({ width: 320, height: 200, data }));
const preview = new Uint8Array(960 * 720 * 4);
for (let y = 0; y < 720; y++) for (let x = 0; x < 960; x++) {
  const at = (Math.floor(y * 200 / 720) * 320 + Math.floor(x / 3)) * 4;
  preview.set(data.subarray(at, at + 4), (y * 960 + x) * 4);
}
writeFileSync(join(out, "workshop-4x3.png"), rgbaPng({ width: 960, height: 720, data: preview }));
for (const file of ["palette.json", "palette.gpl", "art.json"]) copyFileSync(join(previous, file), join(out, file));
const result = buildArt(join(out, "art.json"));
const report = { nativeSize: [320, 200], displaySize: [960, 720], paletteEntries: palette.length, usedColours: used.size, paletteUnchanged: true, characterEditRegion: region, changedPixels: changed, unchangedPixelsOutsideRegion: true, dithering: false, sampling: "nearest neighbour, fixed v4 palette", importerValidated: result.images === 1 };
writeFileSync(join(out, "report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
