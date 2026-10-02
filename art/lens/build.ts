/**
 * The lens as a magnifying cursor, from r28's 32px lens (art/studies/interface-r28): the
 * cursor with its glass cleared (two white glints kept, so it still reads as glass), and the
 * glass alone, which the game shows the room through, twice as large. Both are anchored at
 * the middle of the glass, the cursor's hotspot.
 *
 *   pnpm exec tsx art/lens/build.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { decodePng, rgbaPng } from "sci2-ts/png";

const here = (f: string) => fileURLToPath(new URL(f, import.meta.url));
const lens = decodePng(readFileSync(here("../studies/interface-r28/export/object-look-32.png")));
const [cx, cy, r] = [9.5, 10.5, 5.6]; // the glass: inside the brass ring
const inGlass = (x: number, y: number) => (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r;
const isGlint = (x: number, y: number) => {
  const i = (y * lens.width + x) * 4;
  return lens.data[i] === 0xff && lens.data[i + 1] === 0xff && lens.data[i + 2] === 0xff && lens.data[i + 3] === 255 && y < cy && x < cx;
};
const cursor = { width: lens.width, height: lens.height, data: lens.data.slice() };
const glass = { width: lens.width, height: lens.height, data: new Uint8Array(lens.data.length) };
let cleared = 0;
for (let y = 0; y < lens.height; y++) {
  for (let x = 0; x < lens.width; x++) {
    if (!inGlass(x, y)) continue;
    const i = (y * lens.width + x) * 4;
    glass.data.set([0x51, 0x62, 0x9a, 255], i); // any opaque colour: it's a mask
    if (!isGlint(x, y)) (cursor.data[i + 3] = 0), cleared++;
  }
}
writeFileSync(here("cursor.png"), rgbaPng(cursor));
writeFileSync(here("glass.png"), rgbaPng(glass));
console.log(`art/lens: ${cleared} glass pixels cleared from the cursor; the hotspot is (${Math.floor(cx)}, ${Math.floor(cy)})`);
