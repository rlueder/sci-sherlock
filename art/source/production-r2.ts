/** Reconstruct the rejected second pass for comparison in ignored out/art/production-r2.
 * Publication is disabled. The exact art/approved/workshop-v6 composition is the visual lock.
 */
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { decodePng, rgbaPng, type Rgba } from "sci-ts/png";
import { buildArt, type ArtManifest } from "sci-ts/art";
import { Pixels } from "./pixels.ts";
import { pixeloramaProject } from "./pixelorama-project.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
assert(!process.argv.includes("--publish"), "workshop-r2 was rejected visually; publication is disabled. Use art/approved/workshop-v6 as the locked reference.");
const input = join(root, "art/production/workshop-r2");
const out = join(root, "out/art/production-r2");
for (const folder of [out, join(out, "export"), join(out, "source"), join(out, "review")]) mkdirSync(folder, { recursive: true });
const palette = JSON.parse(readFileSync(join(root, "art/studies/workshop-v6/converted/palette.json"), "utf8")) as string[];
assert.equal(palette.length, 64);
const rgb = palette.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
const colourCache = new Map<number, number>();
const colour = (r: number, g: number, b: number) => {
  const key = r * 65536 + g * 256 + b, cached = colourCache.get(key);
  if (cached !== undefined) return cached;
  let found = 0, best = Infinity;
  rgb.forEach((p, i) => { const d = 2 * (r - p[0]!) ** 2 + 4 * (g - p[1]!) ** 2 + (b - p[2]!) ** 2; if (d < best) { best = d; found = i; } });
  colourCache.set(key, found); return found;
};
const c = (hex: string) => colour(...([1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]));
const image = (name: string) => decodePng(readFileSync(join(input, name)));
type Box = { x: number; y: number; w: number; h: number };
const bounds = (im: Rgba, box: Box): Box => {
  let x0 = im.width, x1 = -1, y0 = im.height, y1 = -1;
  for (let y = box.y; y < box.y + box.h; y++) for (let x = box.x; x < box.x + box.w; x++) {
    if (im.data[(y * im.width + x) * 4 + 3]! < 220) continue;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  assert(x1 >= x0 && y1 >= y0, "empty source cell");
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
};
const resized = (im: Rgba, box: Box, w: number, h: number, opaque = false) => {
  const p = new Pixels(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = box.x + Math.floor((x + .5) * box.w / w), sy = box.y + Math.floor((y + .5) * box.h / h);
    const i = (sy * im.width + sx) * 4;
    if (!opaque && im.data[i + 3]! < 220) continue;
    p.dot(x, y, colour(im.data[i]!, im.data[i + 1]!, im.data[i + 2]!));
  }
  return p;
};
const copy = (p: Pixels) => { const q = new Pixels(p.width, p.height); q.data.set(p.data); return q; };
// Keep the approved room's hue ramps, but discard isolated low-contrast speckle.
// One conservative pass preserves edges, grain lines, silhouettes and clue details.
const clusterShading = (p: Pixels) => {
  const before = p.data.slice();
  for (let y = 1; y < p.height - 1; y++) for (let x = 1; x < p.width - 1; x++) {
    const i = y * p.width + x, index = before[i]!;
    if (index < 0) continue;
    const near = [before[i - 1]!, before[i + 1]!, before[i - p.width]!, before[i + p.width]!];
    for (const shade of near) {
      if (shade < 0 || near.filter((v) => v === shade).length < 3) continue;
      const delta = rgb[shade]!.reduce((n, channel, k) => n + (channel - rgb[index]![k]!) ** 2, 0);
      if (delta < 2400) p.data[i] = shade;
    }
  }
};
const propPalette = [1,4,7,10,13,17,18,20,21,23,28,29,32,34,36,39,40,44,48,51,53,58,60,62];
const simplifyProp = (p: Pixels) => {
  for (let i = 0; i < p.data.length; i++) {
    const from = p.data[i]!; if (from < 0) continue;
    p.data[i] = propPalette.reduce((best, index) => {
      const d = (at: number) => rgb[at]!.reduce((n, channel, k) => n + [2,4,1][k]! * (channel - rgb[from]![k]!) ** 2, 0);
      return d(index) < d(best) ? index : best;
    });
  }
  clusterShading(p);
};
// Remove isolated flecks from sheet gutters after resampling. Keep the small pipe
// silhouette at head height, and never discard a connected hand or foot.
const cleanGutter = (p: Pixels) => {
  const seen = new Set<number>();
  for (let start = 0; start < p.data.length; start++) {
    if (p.data[start]! < 0 || seen.has(start)) continue;
    const component = [start]; seen.add(start);
    for (let n = 0; n < component.length; n++) {
      const i = component[n]!, x = i % p.width, y = Math.floor(i / p.width);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, next = ny * p.width + nx;
        if (nx < 0 || ny < 0 || nx >= p.width || ny >= p.height || seen.has(next) || p.data[next]! < 0) continue;
        component.push(next); seen.add(next);
      }
    }
    if (component.length < 8 && component.every((i) => Math.floor(i / p.width) > p.height * .3))
      component.forEach((i) => { p.data[i] = -1; });
  }
};
const save = (name: string, p: Pixels) => writeFileSync(join(out, "export", `${name}.png`), p.png(palette));
const master = (name: string, layers: string[], frames: Pixels[][], tags: { name: string; from: number; to: number }[] = []) =>
  writeFileSync(join(out, "source", `${name}.pxo`), pixeloramaProject(palette, layers, frames, tags));
const enlarged = (p: Pixels, scale = 3, aspect = true) => {
  const a = p.rgba(palette), w = p.width * scale, h = Math.round(p.height * scale * (aspect ? 1.2 : 1));
  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const at = (Math.floor(y * p.height / h) * p.width + Math.floor(x / scale)) * 4;
    data.set(a.data.subarray(at, at + 4), (y * w + x) * 4);
  }
  return rgbaPng({ width: w, height: h, data });
};

const backgroundSource = image("background-source.png");
const background = resized(backgroundSource, { x: 0, y: 0, w: backgroundSource.width, h: backgroundSource.height }, 320, 200, true);
clusterShading(background);
const ink = c("#18151f"), brass = c("#b68d62"), paper = c("#d3b895"), light = c("#f5d8b1"), wood = c("#753a20");
// Reconstruct the hands on native pixels so the story time never depends on generated text.
const dial = (p: Pixels, x: number, y: number, rx: number, ry: number, details = false) => {
  p.oval(x, y, rx + 1, ry + 1, brass); p.oval(x, y, rx, ry, paper); p.oval(x - 1, y - 1, rx - 2, ry - 2, light);
  for (let h = 0; h < 12; h++) { const a = h * Math.PI / 6; p.dot(x + Math.sin(a) * (rx - 1), y - Math.cos(a) * (ry - 1), ink); }
  const minute = 17 / 60 * Math.PI * 2, hour = (3 + 17 / 60) / 12 * Math.PI * 2;
  p.line(x, y, x + Math.sin(minute) * (rx - 2), y - Math.cos(minute) * (ry - 2), ink);
  p.line(x, y, x + Math.sin(hour) * rx * .52, y - Math.cos(hour) * ry * .52, wood);
  p.dot(x, y, ink);
  if (details) {
    p.text("XII", x - 7, y - ry + 4, ink); p.text("III", x + rx - 16, y - 3, ink);
    p.text("VI", x - 5, y + ry - 10, ink); p.text("IX", x - rx + 4, y - 3, ink);
    // Fresh pale scratch beneath the stopped minute hand.
    p.line(x + 15, y + 11, x + 27, y + 15, brass); p.line(x + 15, y + 10, x + 27, y + 14, light);
  }
};
dial(background, 123, 46, 10, 10); dial(background, 169, 30, 8, 7); dial(background, 218, 38, 12, 11);
// A distinct sash latch, on the window's central crossbar.
background.rect(47, 70, 6, 1, brass); background.rect(51, 69, 1, 3, light);

const props = image("props-source.png");
const clockBox = bounds(props, { x: 0, y: 0, w: 380, h: props.height });
const tableBox = bounds(props, { x: 380, y: 350, w: 900, h: props.height - 350 });
const lampBox = bounds(props, { x: 1280, y: 350, w: props.width - 1280, h: props.height - 350 });
const table = resized(props, tableBox, 118, 74), foreground = new Pixels(320, 200);
simplifyProp(table);
foreground.paste(table, -9, 157);
save("workshop", background); save("workshop-front", foreground);
master("workshop", ["base", "foreground-181"], [[background, foreground]]);

const sheet = image("holmes-aged-sheet-source.png");
const sourceCells: Box[][] = [];
for (let row = 0; row < 3; row++) {
  const list: Box[] = [];
  for (let col = 0; col < 7; col++) {
    const x = Math.floor(col * sheet.width / 7), y = Math.floor(row * sheet.height / 3);
    list.push(bounds(sheet, { x, y, w: Math.floor((col + 1) * sheet.width / 7) - x, h: Math.floor((row + 1) * sheet.height / 3) - y }));
  }
  sourceCells.push(list);
}
// Classic-adventure sprite budget, within the shared room palette. Broad cloth
// ramps replace fine source shading; grey hair remains distinct from warm skin.
const actorPalette = ["#07050d", "#18151f", "#24273b", "#30374c", "#5f1c22", "#722625", "#4f3630", "#77573d", "#9f784c", "#754833", "#b68d62", "#d3b895", "#a69ca7", "#f5d8b1"].map((hex) => palette.indexOf(hex));
assert(actorPalette.every((i) => i >= 0));
const actorMap = rgb.map((from) => actorPalette.reduce((best, index) => {
  const distance = (i: number) => rgb[i]!.reduce((sum, channel, k) => sum + [2, 4, 1][k]! * (channel - from[k]!) ** 2, 0);
  return distance(index) < distance(best) ? index : best;
}));
const simplifyActor = (p: Pixels) => {
  for (let i = 0; i < p.data.length; i++) if (p.data[i]! >= 0) p.data[i] = actorMap[p.data[i]!]!;
  const before = p.data.slice(), cloth = new Set(actorPalette.slice(0, 6));
  for (let y = Math.floor(p.height * .23); y < p.height - 2; y++) for (let x = 1; x < p.width - 1; x++) {
    const i = y * p.width + x;
    if (!cloth.has(before[i]!)) continue;
    const near = [before[i - 1]!, before[i + 1]!, before[i - p.width]!, before[i + p.width]!];
    for (const shade of cloth) if (near.filter((v) => v === shade).length >= 3) { p.data[i] = shade; break; }
  }
};
const actorScale = 60 / Math.max(...sourceCells.flat().map((b) => b.h));
const directions = ["east", "south", "north"];
const actors: Pixels[][] = sourceCells.map((row, r) => row.map((box, frame) => {
  const sprite = resized(sheet, box, Math.max(1, Math.round(box.w * actorScale)), Math.round(box.h * actorScale));
  cleanGutter(sprite);
  simplifyActor(sprite);
  assert(sprite.width <= 32 && sprite.height <= 60);
  const p = new Pixels(32, 64);
  // Torso centre, rather than swinging hands/feet, fixes the registration point.
  const torsoXs: number[] = [];
  for (let y = Math.floor(sprite.height * .30); y < sprite.height * .53; y++) {
    const xs: number[] = [];
    for (let x = 0; x < sprite.width; x++) if (sprite.data[y * sprite.width + x]! >= 0) xs.push(x);
    if (xs.length) torsoXs.push((xs[0]! + xs.at(-1)!) / 2);
  }
  torsoXs.sort((a, b) => a - b);
  const center = Math.round(torsoXs[Math.floor(torsoXs.length / 2)]!);
  const left = Math.max(0, Math.min(32 - sprite.width, 16 - center));
  p.paste(sprite, left, 63 - sprite.height);
  save(`holmes-${directions[r]}-${String(frame).padStart(2, "0")}`, p);
  return p;
}));
for (const row of actors) assert.equal(new Set(row.map((p) => Buffer.from(p.data.buffer).toString("base64"))).size, 7, "duplicate standing/walk frames");
master("holmes", ["body"], actors.flat().map((p) => [p]), directions.map((name, i) => ({ name, from: i * 7 + 1, to: i * 7 + 7 })));

const lamp = new Pixels(19, 30); lamp.paste(resized(props, lampBox, 14, 27), 3, 2);
simplifyProp(lamp);
const lamps = Array.from({ length: 4 }, (_, frame) => {
  const p = copy(lamp);
  // Confine flicker to the chimney; the housing and anchor are identical in every cel.
  for (let y = 11; y <= 19; y++) for (let x = 7; x <= 12; x++) {
    const i = y * p.width + x, existing = p.data[i]!;
    if (existing >= 0 && rgb[existing]![0]! > 180 && rgb[existing]![1]! > 100) p.data[i] = c(frame % 2 ? "#e5bc6a" : "#f5d8b1");
  }
  p.line(9, 19, 9 + [0, 1, 0, -1][frame]!, 13 + [0, 1, 2, 1][frame]!, frame < 2 ? light : c("#de8f3b"));
  save(`lantern-${String(frame).padStart(2, "0")}`, p); return p;
});
master("lantern", ["lantern"], lamps.map((p) => [p]));

const closed = resized(props, clockBox, 44, 126);
simplifyProp(closed);
dial(closed, 22, 31, 8, 9);
const angles = [0, 12, 25, 40, 55, 68, 78, 86];
const clocks = angles.map((angle, frame) => {
  const p = new Pixels(76, 132), ratio = Math.cos(angle * Math.PI / 180), hinge = 43;
  const left = Math.round(hinge - 43 * ratio);
  for (let y = 0; y < 126; y++) for (let x = left; x <= hinge; x++) {
    const sx = Math.max(0, Math.min(43, Math.round(43 - (hinge - x) / ratio)));
    const index = closed.data[y * 44 + sx]!;
    if (index >= 0) p.dot(x, y + 6, index);
  }
  if (frame) {
    // The fixed right hinge and solid cabinet edge remain visible through the turn.
    p.rect(44, 22, 2, 107, ink); p.line(44, 23, 44, 128, wood);
  }
  save(`clock-${String(frame).padStart(2, "0")}`, p); return p;
});
master("clock", ["case"], clocks.map((p) => [p]));

const filings = [new Pixels(32, 16), new Pixels(32, 16)];
for (let f = 0; f < 2; f++) {
  const p = filings[f]!;
  for (let i = 0; i < (f ? 37 : 21); i++) {
    const x = f ? 2 + i * 7 % 28 : 9 + i * 5 % 14;
    const y = f ? 4 + Math.floor((28 - x) / 7) + i % 3 : 6 + i * 3 % 8;
    p.line(x, y, x + (i % 3 === 0 ? 1 : 0), y, i % 4 === 0 ? light : brass);
  }
  save(`filings-${String(f).padStart(2, "0")}`, p);
}
master("filings", ["filings"], filings.map((p) => [p]));
const scratches = new Pixels(16, 12);
for (let i = 0; i < 3; i++) { scratches.line(2, 4 + i * 2, 12, 1 + i * 2, wood); scratches.line(2, 5 + i * 2, 12, 2 + i * 2, brass); }
save("scratches", scratches); master("scratches", ["scratches"], [[scratches]]);

const inspection = new Pixels(120, 112, ink);
inspection.rect(2, 2, 116, 108, wood); inspection.rect(4, 4, 112, 104, c("#65453a"));
inspection.oval(60, 49, 49, 41, ink); inspection.oval(60, 49, 47, 39, brass);
dial(inspection, 60, 49, 44, 36, true);
inspection.text("3:17", 50, 89, light); inspection.text("FRESH SCRATCH", 30, 100, paper);
save("dial-inspection", inspection); master("dial-inspection", ["dial"], [[inspection]]);

const cel = (png: string, anchor: [number, number]) => ({ png: `export/${png}.png`, anchor });
const sequence = (name: string, n: number, anchor: [number, number]) => ({ cels: Array.from({ length: n }, (_, i) => cel(`${name}-${String(i).padStart(2, "0")}`, anchor)) });
const manifest: ArtManifest = {
  version: 1, maxColours: 64, palette: "palette.json",
  pictures: [{ number: 102, layers: [{ png: "export/workshop.png", priority: -1000 }, { png: "export/workshop-front.png", priority: 181 }] }],
  views: [
    { number: 200, loops: [sequence("holmes-east", 7, [16, 62]), { link: 0, mirror: true }, sequence("holmes-south", 7, [16, 62]), sequence("holmes-north", 7, [16, 62])] },
    { number: 220, loops: [sequence("lantern", 4, [9, 29])] },
    { number: 221, loops: [sequence("clock", 8, [22, 131])] },
    { number: 227, loops: [sequence("filings", 2, [16, 15])] },
    { number: 228, loops: [{ cels: [cel("scratches", [8, 11])] }] },
    { number: 240, loops: [{ cels: [cel("dial-inspection", [0, 0])] }] },
    // Compatibility alias until the engine session switches its room prop to view 240.
    { number: 224, loops: [{ cels: [cel("dial-inspection", [0, 0])] }] },
  ],
};
writeFileSync(join(out, "art.json"), JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(join(out, "palette.json"), JSON.stringify(palette, null, 2) + "\n");
writeFileSync(join(out, "palette.gpl"), `GIMP Palette\nName: Sherlock shared 64\nColumns: 8\n#\n${rgb.map((r, i) => `${r.join(" ")}\t${palette[i]}`).join("\n")}\n`);
const built = buildArt(join(out, "art.json"));

const review = (name: string, p: Pixels) => { writeFileSync(join(out, "review", `${name}-native.png`), p.png(palette)); writeFileSync(join(out, "review", `${name}.png`), enlarged(p)); };
const composite = (open: boolean, heroX = 147, heroY = 171) => {
  const p = copy(background);
  p.paste(lamps[0]!, 190 - 9, 111 - 29); p.paste(clocks[open ? 7 : 0]!, 267 - 22, 157 - 131);
  p.paste(filings[open ? 1 : 0]!, 225 - 16, 154 - 15);
  if (open) p.paste(scratches, 251, 145);
  p.paste(actors[0]![0]!, heroX - 16, heroY - 62); p.paste(foreground, 0, 0);
  return p;
};
review("workshop-closed", composite(false)); review("workshop-open", composite(true, 239, 168)); review("workshop-occlusion", composite(false, 74, 175));
const contact = new Pixels(7 * 40, 3 * 72, c("#303d36"));
actors.forEach((row, r) => row.forEach((p, f) => contact.paste(p, f * 40 + 4, r * 72 + 4)));
writeFileSync(join(out, "review/holmes-contact.png"), enlarged(contact, 3, false));
const propContact = new Pixels(8 * 78, 134, c("#303d36")); clocks.forEach((p, i) => propContact.paste(p, i * 78 + 1, 1));
writeFileSync(join(out, "review/clock-contact.png"), enlarged(propContact, 1, true));
writeFileSync(join(out, "review/dial.png"), enlarged(inspection, 3, true));
const report = { paletteColours: palette.length, listedImages: built.images, uniqueExports: readdirSync(join(out, "export")).length, resources: built.resources.length, actorCanvas: [32, 64], actorAnchor: [16, 62], maxActorHeight: 60, actorPalette: actorPalette.map((i) => palette[i]), sourceCells, propBounds: { clockBox, tableBox, lampBox }, clockAngles: angles, clockHinge: [43, 131], compatibilityAliases: { "224": 240 } };
writeFileSync(join(out, "report.json"), JSON.stringify(report, null, 2) + "\n");
if (process.argv.includes("--publish")) {
  for (const folder of ["source", "export"]) for (const file of readdirSync(join(out, folder))) copyFileSync(join(out, folder, file), join(root, "art", folder, file));
  for (const file of ["palette.json", "art.json"]) copyFileSync(join(out, file), join(root, "art", file));
  for (const file of readdirSync(join(out, "review"))) copyFileSync(join(out, "review", file), join(input, file));
  copyFileSync(join(out, "report.json"), join(input, "report.json"));
  copyFileSync(join(out, "palette.gpl"), join(root, "art/palette.gpl"));
}
console.log(`${out}: ${built.images} listed images, ${palette.length} shared colours, ${built.resources.length} resources${process.argv.includes("--publish") ? "; published" : "; staged for review"}`);
