/**
 * Original first-pass pixel art for The Stopped Clocks. MIT, like the repository.
 * Native source stays editable; this generator writes ONLY out/art/sherlock-draft.
 * Approved PNGs under art/export are copied deliberately, never overwritten by a build.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { Pixels } from "./pixels.ts";
import { pixeloramaProject } from "./pixelorama-project.ts";

const palette = JSON.parse(readFileSync(new URL("./workshop-legacy-palette.json", import.meta.url), "utf8")) as string[];
const out = resolve("out/art/sherlock-draft");
mkdirSync(out, { recursive: true });
const save = (name: string, p: Pixels) => writeFileSync(join(out, `${name}.png`), p.png(palette));
const hash = (x: number, y: number) => ((Math.imul(x + 137, 374761393) ^ Math.imul(y + 331, 668265263)) >>> 0) % 101;

function dial(p: Pixels, x: number, y: number, r: number) {
  p.oval(x + 1, y + 2, r + 2, r + 2, 1);
  p.oval(x, y, r + 1, r + 1, 22);
  p.oval(x, y, r, r, 13);
  p.oval(x, y, r - 1, r - 1, 14);
  p.oval(x - 1, y - 1, r - 2, r - 2, 15);
  for (let h = 0; h < 12; h++) {
    const a = h * Math.PI / 6;
    p.dot(x + Math.sin(a) * (r - 2), y - Math.cos(a) * (r - 2), 10);
  }
  // Exactly 3:17. At small radii the hands nearly overlap; view 224 makes it legible.
  const minute = 17 / 60 * Math.PI * 2, hour = (3 + 17 / 60) / 12 * Math.PI * 2;
  p.line(x, y, x + Math.sin(minute) * (r - 3), y - Math.cos(minute) * (r - 3), 1);
  p.line(x, y, x + Math.sin(hour) * (r * .5), y - Math.cos(hour) * (r * .5), 10);
  p.dot(x, y, 1);
}

function workshop() {
  const p = new Pixels(320, 200, 1);
  // Plaster walls: broad controlled light groups, with a little wear in the mortar.
  p.poly([[0, 15], [104, 26], [104, 139], [0, 158]], 2);
  p.poly([[104, 26], [319, 19], [319, 144], [104, 139]], 16);
  p.poly([[113, 31], [211, 28], [231, 124], [116, 139]], 17);
  p.poly([[142, 60], [190, 55], [225, 121], [138, 139]], 18);
  for (let y = 31; y < 139; y += 12) {
    p.line(108, y, 319, y - 4, 16);
    for (let x = 115 + (y % 24 ? 17 : 0); x < 317; x += 39) p.line(x, y - 1, x, y + 9, 16);
  }
  // Picture rail and ceiling beams establish the room's vanishing point.
  p.poly([[0, 0], [320, 0], [320, 20], [103, 28], [0, 16]], 8);
  p.poly([[0, 7], [104, 22], [320, 13], [320, 19], [104, 28], [0, 15]], 20);
  p.line(0, 15, 104, 28, 11); p.line(105, 27, 319, 19, 21);
  p.rect(101, 27, 7, 117, 8); p.rect(101, 28, 2, 114, 21);
  p.poly([[0, 136], [104, 124], [320, 128], [320, 147], [104, 144], [0, 159]], 8);
  p.line(0, 136, 104, 124, 21); p.line(108, 125, 319, 129, 21);
  // Floor boards, warmer in the lantern's pool, quiet and darker near the edges.
  p.poly([[0, 155], [106, 137], [320, 142], [320, 200], [0, 200]], 20);
  p.poly([[67, 153], [173, 141], [285, 154], [252, 185], [107, 189], [39, 174]], 9);
  p.poly([[129, 151], [180, 142], [247, 154], [226, 171], [146, 176], [93, 167]], 10);
  for (let x = -150; x < 620; x += 43) {
    p.line(160 + (x - 160) * .28, 138, x, 199, 8);
    p.line(161 + (x - 160) * .28, 139, x + 1, 199, 21);
  }
  for (const y of [148, 162, 181, 199]) p.line(0, y, 320, y + 3, 8);
  for (let y = 147; y < 200; y++) for (let x = 0; x < 320; x++) {
    if (hash(x, y) < 2 && p.data[y * 320 + x] === 20) p.rect(x, y, 3, 1, 9);
  }
  // Sash window: cold panes and London rooftops with the fog kept inside the silhouette.
  p.poly([[18, 30], [87, 39], [87, 112], [18, 123]], 8);
  p.poly([[23, 36], [82, 43], [82, 107], [23, 117]], 4);
  p.poly([[25, 39], [79, 46], [79, 75], [25, 75]], 5);
  p.poly([[26, 74], [40, 59], [45, 64], [45, 51], [51, 51], [51, 66], [63, 78], [79, 70], [79, 104], [26, 113]], 3);
  p.poly([[25, 89], [49, 84], [79, 87], [79, 92], [25, 98]], 4);
  p.line(24, 105, 79, 99, 5);
  p.line(24, 38, 24, 115, 6); p.line(26, 115, 80, 106, 5);
  p.poly([[48, 41], [52, 41], [52, 112], [48, 113]], 8);
  p.line(53, 43, 53, 111, 21);
  p.poly([[23, 75], [83, 74], [83, 79], [23, 80]], 8);
  p.line(24, 80, 80, 79, 21);
  p.poly([[15, 121], [87, 109], [93, 114], [18, 129]], 21);
  p.line(17, 121, 85, 110, 22);
  p.rect(70, 78, 9, 2, 23); p.rect(77, 78, 2, 4, 22); // latch
  // Tall shadow of the hidden stair; the movable clock fully covers it while shut.
  p.rect(253, 43, 35, 107, 8); p.rect(257, 49, 27, 101, 0);
  p.poly([[258, 149], [283, 145], [283, 115], [272, 132]], 2);
  for (let y = 130; y < 151; y += 5) p.line(261, y + 3, 283, y, 3);
  // Clockmaker's board, shelves, weights and wall clocks.
  p.rect(119, 87, 85, 3, 8); p.line(119, 86, 204, 86, 22);
  p.rect(124, 89, 3, 7, 20); p.rect(197, 89, 3, 7, 20);
  p.rect(117, 93, 81, 5, 20); p.rect(122, 95, 73, 1, 22);
  p.rect(121, 50, 29, 31, 8); p.rect(124, 53, 23, 24, 20); p.rect(126, 54, 19, 24, 21);
  p.poly([[118, 51], [135, 37], [153, 51]], 8); p.line(121, 50, 135, 40, 22);
  dial(p, 135, 62, 10);
  p.rect(132, 75, 1, 7, 22); p.oval(132, 81, 3, 2, 23);
  p.rect(159, 33, 30, 3, 8); p.rect(163, 35, 22, 31, 20);
  p.rect(164, 36, 2, 29, 22); dial(p, 174, 48, 9);
  p.rect(169, 62, 10, 15, 8); p.line(174, 62, 174, 74, 22); p.oval(174, 74, 4, 4, 23);
  p.rect(162, 78, 25, 4, 20); p.line(162, 78, 186, 78, 22);
  dial(p, 219, 46, 15);
  p.line(212, 64, 211, 90, 22); p.line(225, 64, 226, 83, 21);
  p.rect(209, 83, 4, 11, 20); p.rect(209, 83, 1, 10, 23);
  p.rect(224, 77, 4, 10, 20); p.rect(224, 77, 1, 9, 22);
  // Left cabinet, spare movements, ledgers.
  p.poly([[17, 134], [88, 123], [96, 130], [24, 142]], 21);
  p.poly([[24, 142], [95, 131], [95, 159], [24, 172]], 8);
  p.poly([[27, 144], [91, 134], [91, 154], [27, 166]], 20);
  p.line(28, 155, 92, 143, 8); p.line(57, 140, 57, 158, 8);
  p.rect(40, 149, 3, 2, 22); p.rect(74, 143, 3, 2, 22);
  p.rect(25, 166, 4, 9, 8); p.rect(86, 156, 4, 9, 8);
  for (let i = 0; i < 5; i++) {
    p.rect(29 + i * 7, 122 - i % 2 * 3, 5, 14, i % 2 ? 24 : 17);
    p.rect(30 + i * 7, 123 - i % 2 * 3, 1, 11, 21);
  }
  // Back workbench. The lamp is an independent sprite on top of this surface.
  p.poly([[113, 114], [208, 109], [224, 120], [118, 128]], 8);
  p.poly([[115, 113], [209, 108], [223, 117], [119, 124]], 22);
  p.line(118, 124, 222, 117, 13);
  p.poly([[119, 127], [220, 120], [220, 132], [119, 139]], 20);
  p.line(122, 128, 216, 122, 21);
  p.rect(123, 137, 6, 18, 8); p.rect(210, 132, 5, 17, 8);
  p.line(130, 145, 209, 140, 20);
  p.poly([[138, 112], [158, 111], [166, 117], [144, 119]], 14);
  p.line(143, 114, 157, 113, 21); p.line(145, 116, 161, 115, 21);
  p.line(170, 120, 180, 115, 8); p.rect(178, 113, 5, 2, 23);
  p.oval(126, 114, 5, 2, 8); p.oval(126, 113, 4, 2, 23);
  p.oval(126, 113, 2, 1, 20);
  // Tools hanging beside the bench, each with a little breathing space.
  for (const [x, y, h] of [[116, 99, 9], [129, 99, 8], [145, 99, 7], [160, 97, 8]]) {
    p.line(x!, y!, x!, y! + h!, 8); p.rect(x! - 1, y! + h! - 2, 3, 4, 22);
  }
  // Copper filings: clustered along a readable route, not a blanket of random glitter.
  for (const [x, y] of [[195, 144], [201, 145], [208, 149], [216, 150], [224, 151], [234, 149], [242, 151], [249, 152]]) {
    p.rect(x!, y!, 2, 1, 22); p.dot(x! + 1, y! - 1, 13);
  }
  p.line(252, 156, 283, 155, 11); p.line(253, 158, 276, 157, 21); // scrape, under case
  // Vignette is drawn from opaque pixel shapes, no postprocessing or renderer dependency.
  p.poly([[0, 0], [9, 0], [9, 157], [0, 172]], 8);
  p.poly([[310, 0], [320, 0], [320, 200], [309, 186]], 8);
  return p;
}

function foreground() {
  const p = new Pixels(320, 200);
  // Near bench at y=181 occludes feet when Holmes passes behind it.
  p.poly([[0, 177], [78, 164], [117, 177], [30, 194], [0, 189]], 8);
  p.poly([[0, 174], [77, 161], [115, 174], [30, 190], [0, 184]], 20);
  p.line(0, 174, 77, 161, 22); p.line(77, 161, 115, 174, 21);
  p.line(31, 190, 115, 174, 11);
  p.poly([[31, 194], [110, 179], [110, 200], [31, 200]], 8);
  p.rect(15, 191, 7, 9, 1); p.rect(94, 185, 7, 15, 1);
  for (let i = 0; i < 7; i++) p.line(3 + i * 7, 176 + i, 76 + i * 4, 163 + i * 2, 9);
  // Open ledger, loupe and a dismantled clock movement on the near bench.
  p.poly([[38, 171], [56, 168], [71, 173], [52, 177]], 13);
  p.poly([[55, 169], [72, 167], [85, 173], [68, 175]], 14);
  p.line(56, 169, 68, 175, 10);
  p.line(44, 172, 54, 170, 21); p.line(47, 174, 57, 172, 21);
  p.oval(23, 178, 7, 3, 22); p.oval(23, 178, 4, 2, 8);
  p.line(28, 181, 34, 183, 21);
  p.oval(88, 171, 5, 3, 21); p.oval(88, 171, 3, 2, 8);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4; p.dot(88 + Math.cos(a) * 6, 171 + Math.sin(a) * 4, 22);
  }
  return p;
}

function clock(frame: number) {
  const p = new Pixels(76, 132);
  const t = frame / 7, left = 7 + Math.round(t * 35), w = 38 - Math.round(t * 18);
  p.poly([[left + 1, 21], [left + w - 3, 18], [left + w, 124], [left, 128]], 8);
  p.rect(left + 3, 27, w - 6, 92, 20);
  p.rect(left + 4, 29, 2, 87, 22);
  p.rect(left + w - 7, 28, 2, 89, 9);
  p.rect(left + 8, 52, Math.max(4, w - 16), 52, 8);
  p.rect(left + 10, 54, Math.max(2, w - 20), 47, 9);
  p.line(left + w / 2, 56, left + w / 2, 88, 22);
  p.oval(left + w / 2, 91, Math.max(3, w / 6), 6, 21);
  p.oval(left + w / 2 - 1, 90, Math.max(2, w / 7), 5, 22);
  p.rect(left + 2, 111, w - 4, 10, 9);
  p.line(left + 4, 112, left + w - 5, 112, 21);
  p.rect(left - 2, 121, w + 4, 6, 20); p.line(left - 2, 121, left + w + 1, 121, 22);
  p.rect(left, 127, 5, 4, 8); p.rect(left + w - 5, 127, 5, 4, 8);
  p.rect(left - 2, 21, w + 4, 29, 20);
  p.line(left - 2, 21, left + w + 1, 21, 22);
  p.rect(left, 24, 2, 23, 23); p.rect(left + w - 2, 24, 2, 23, 9);
  if (frame < 5) dial(p, left + w / 2, 35, Math.min(11, w / 2 - 4));
  else {
    p.oval(left + w / 2, 35, 5, 11, 13); p.line(left + w / 2, 35, left + w / 2 + 3, 37, 8);
  }
  p.poly([[left - 4, 21], [left - 1, 17], [left + w / 2, 7], [left + w + 2, 17], [left + w + 4, 21]], 8);
  p.line(left - 1, 17, left + w / 2, 7, 22);
  p.line(left + w / 2, 8, left + w, 17, 21);
  p.oval(left + w / 2, 7, 3, 4, 20); p.dot(left + w / 2, 3, 23);
  p.rect(left + w - 9, 74, 2, 3, 23);
  return p;
}

function lantern(frame: number) {
  const p = new Pixels(19, 30);
  p.oval(9, 6, 4, 5, 22); p.oval(9, 6, 2, 3, -1);
  p.poly([[4, 10], [14, 10], [16, 26], [2, 26]], 8);
  p.rect(5, 12, 9, 12, 12); p.rect(6, 12, 7, 11, 13);
  p.poly([[6, 22], [8, 17 - frame % 2], [10 + frame % 2, 13], [12, 21], [10, 24]], 15);
  p.line(8, 20, 9, 16 + frame % 3, 31);
  p.line(4, 11, 3, 25, 21); p.line(14, 11, 15, 25, 23);
  p.rect(3, 9, 13, 3, 22); p.rect(4, 9, 9, 1, 14);
  p.rect(2, 25, 15, 3, 22); p.rect(4, 28, 11, 2, 8);
  return p;
}

function holmes(direction: "east" | "south" | "north", frame: number) {
  const p = new Pixels(28, 58);
  const stride = frame === 0 ? 0 : Math.sin((frame - 1) * Math.PI / 3);
  const bob = frame !== 0 && frame % 3 === 0 ? 1 : 0;
  const side = direction === "east", back = direction === "north";
  const legA = Math.round(stride * (side ? 5 : 2)), legB = -legA;
  // Tailored trousers and small, grounded shoes. Canvas and planted-foot anchor never move.
  p.poly([[10, 34], [14, 34], [14 + legA, 53], [10 + legA, 54]], 1);
  p.poly([[15, 34], [18, 34], [19 + legB, 53], [15 + legB, 54]], 2);
  p.line(16, 40, 17 + legB, 51, 3);
  p.rect(9 + legA, 53, 7, 3, 8); p.rect(14 + legB, 53, 7, 3, 8);
  p.rect(10 + legA, 53, 4, 1, 3); p.rect(16 + legB, 53, 4, 1, 3);
  p.poly([[10, 15 + bob], [17, 15 + bob], [20, 22], [20, 40], [15, 43], [13, 38], [9, 42], [7, 39], [8, 22]], 1);
  p.poly([[11, 16 + bob], [17, 17 + bob], [18, 34], [16, 40], [14, 36], [12, 40], [10, 38], [10, 23]], 2);
  p.line(9, 22, 9, 35, 3); p.line(17, 22, 18, 35, 3);
  if (!back) {
    p.poly([[12, 16 + bob], [16, 16 + bob], [15, 26], [12, 22]], 14);
    p.line(14, 19 + bob, 15, 26, 24);
    p.poly([[10, 18], [12, 16], [13, 24], [10, 21]], 4);
    p.line(16, 18, 17, 21, 4);
    p.dot(15, 29, 21); p.dot(15, 33, 21);
  } else p.line(14, 18, 14, 36, 3);
  const arm = Math.round(-stride * 3);
  p.poly([[8, 19 + bob], [11, 20], [10 + arm, 33], [7 + arm, 32]], 2);
  p.rect(7 + arm, 32, 3, 4, back ? 11 : 12);
  p.dot(9 + arm, 33, 13);
  // Long neck, swept hair, narrow face. No likeness to an actor or adaptation.
  p.rect(12, 11 + bob, 4, 7, 11);
  p.rect(13, 11 + bob, 3, 5, 13);
  if (side) {
    p.poly([[10, 4 + bob], [15, 3 + bob], [18, 6 + bob], [18, 8 + bob], [21, 10 + bob], [18, 11 + bob], [18, 14 + bob], [15, 16 + bob], [11, 12 + bob]], 12);
    p.rect(15, 6 + bob, 3, 6, 13); p.dot(18, 10 + bob, 14);
    p.dot(17, 8 + bob, 1); p.line(17, 13 + bob, 19, 13 + bob, 10);
    p.poly([[9, 6 + bob], [10, 3 + bob], [14, 2 + bob], [17, 3 + bob], [19, 5 + bob], [14, 5 + bob], [12, 10 + bob], [10, 10 + bob]], 8);
    p.line(11, 4 + bob, 16, 3 + bob, 20); p.dot(12, 9 + bob, 13);
  } else {
    p.oval(14, 9 + bob, 5, 7, back ? 8 : 12);
    if (!back) {
      p.rect(13, 7 + bob, 4, 6, 13); p.dot(14, 12 + bob, 14);
      p.dot(11, 8 + bob, 1); p.dot(16, 8 + bob, 1); p.line(13, 14 + bob, 15, 14 + bob, 10);
    }
    p.poly([[9, 7 + bob], [10, 3 + bob], [14, 2 + bob], [18, 4 + bob], [19, 8 + bob], [16, 5 + bob], [13, 6 + bob], [10, 10 + bob]], 8);
    p.line(11, 4 + bob, 15, 3 + bob, 20);
    if (back) p.line(10, 9 + bob, 11, 12 + bob, 20);
  }
  return p;
}

const base = workshop(), front = foreground();
save("workshop", base); save("workshop-front", front);
for (let f = 0; f < 8; f++) save(`clock-${String(f).padStart(2, "0")}`, clock(f));
for (let f = 0; f < 4; f++) save(`lantern-${String(f).padStart(2, "0")}`, lantern(f));
const sheet = new Pixels(28 * 7, 58 * 3);
for (const [row, direction] of (["east", "south", "north"] as const).entries()) {
  for (let f = 0; f < 7; f++) {
    const cel = holmes(direction, f);
    save(`holmes-${direction}-${String(f).padStart(2, "0")}`, cel);
    sheet.paste(cel, f * 28, row * 58);
  }
}
save("holmes-sheet", sheet);
const proof = new Pixels(320, 200); proof.paste(base, 0, 0);
proof.paste(clock(0), 245, 26); proof.paste(lantern(0), 181, 82);
proof.paste(holmes("east", 0), 132, 113); proof.paste(front, 0, 0);
save("workshop-proof", proof);
const closeup = new Pixels(120, 112, 8);
closeup.rect(2, 2, 116, 108, 20); closeup.rect(5, 5, 110, 102, 21);
dial(closeup, 60, 49, 37);
closeup.line(82, 69, 86, 73, 10); closeup.line(85, 71, 87, 73, 15);
closeup.text("SEVENTEEN PAST THREE", 11, 94, 14);
save("dial-inspection", closeup);
const project = (name: string, layers: string[], frames: Pixels[][], tags: { name: string; from: number; to: number }[] = []) =>
  writeFileSync(join(out, `${name}.pxo`), pixeloramaProject(palette, layers, frames, tags));
project("workshop", ["base", "foreground-181"], [[base, front]]);
project("clock", ["case"], Array.from({ length: 8 }, (_, f) => [clock(f)]), [{ name: "open", from: 1, to: 8 }]);
project("lantern", ["lamp"], Array.from({ length: 4 }, (_, f) => [lantern(f)]), [{ name: "flame", from: 1, to: 4 }]);
project("holmes", ["Holmes"], (["east", "south", "north"] as const).flatMap((d) => Array.from({ length: 7 }, (_, f) => [holmes(d, f)])),
  ["east", "south", "north"].map((name, i) => ({ name, from: i * 7 + 1, to: i * 7 + 7 })));
project("dial-inspection", ["dial"], [[closeup]]);
console.log(`Draft art exported to ${out}; production exports have not been modified.`);
