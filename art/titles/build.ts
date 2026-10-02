/**
 * The lettering for the title and end screens (pictures 104 and 105) and the page's heading,
 * set in the game's own New Century Schoolbook (fonts 1, 3 and 4, from art/art.json), in the
 * palette's cream, tan and brown, as the r19 lettering was. Transparent PNGs: the screens'
 * lettering layers, 320x200, and the heading at 1x for the page to scale.
 *
 *   pnpm exec tsx art/titles/build.ts
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildArt } from "sci2-ts/art";
import { parseFont, renderText, ResourceType, type Font } from "sci2-ts";
import { rgbaPng } from "sci2-ts/png";

const here = (f: string) => fileURLToPath(new URL(f, import.meta.url));
const { resources } = buildArt(here("../art.json"));
const font = (n: number): Font => parseFont(resources.find((r) => r.type === ResourceType.Font && r.number === n)!.data);
const [regular, bold, italic] = [font(1), font(3), font(4)];

const CREAM = [0xf5, 0xd8, 0xb1], TAN = [0xca, 0xb0, 0x8f], BROWN = [0x9f, 0x78, 0x4c];

/** A transparent canvas to set lines on. */
function canvas(width: number, height: number) {
  const data = new Uint8Array(width * height * 4);
  const dot = (x: number, y: number, rgb: number[]) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    data.set([...rgb, 255], (y * width + x) * 4);
  };
  return {
    width, height, data,
    /** A line of text centred on cx, its top at y, at `scale` pixels a pixel. */
    text(f: Font, s: string, cx: number, y: number, rgb: number[], scale = 1) {
      const bmp = renderText(f, [s]);
      const x0 = Math.round(cx - (bmp.width * scale) / 2);
      for (let by = 0; by < bmp.height; by++) {
        for (let bx = 0; bx < bmp.width; bx++) {
          if (!bmp.pixels[by * bmp.width + bx]) continue;
          for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) dot(x0 + bx * scale + sx, y + by * scale + sy, rgb);
        }
      }
      return bmp.width * scale;
    },
    rule(x0: number, x1: number, y: number, rgb: number[]) {
      for (let x = x0; x <= x1; x++) dot(x, y, rgb);
    },
  };
}

// The title screen: the lettering on the dark left of the painting, centred on x 95.
const title = canvas(320, 200);
title.text(regular, "SHERLOCK HOLMES", 95, 22, TAN);
title.text(italic, "The Case of the", 95, 40, TAN);
const wide = Math.max(title.text(bold, "Clerkenwell", 95, 56, CREAM, 2), title.text(bold, "Clocks", 95, 84, CREAM, 2));
title.rule(95 - (wide >> 1), 95 + (wide >> 1), 114, BROWN);
title.text(italic, "A Victorian Mystery", 95, 118, TAN);
writeFileSync(here("title-lettering.png"), rgbaPng(title));

// The end card: over the darkened stair, in the middle.
const end = canvas(320, 200);
const endWide = end.text(bold, "To Be Continued", 160, 70, CREAM, 2);
end.rule(160 - (endWide >> 1), 160 + (endWide >> 1), 104, BROWN);
end.text(italic, "The Case of the Clerkenwell Clocks", 160, 110, TAN);
writeFileSync(here("end-lettering.png"), rgbaPng(end));

// The page's heading: two lines at 1x; the page shows it at whole multiples.
const heading = canvas(160, 32);
heading.text(italic, "The Case of the", 80, 0, TAN);
heading.text(bold, "Clerkenwell Clocks", 80, 15, CREAM);
writeFileSync(here("heading.png"), rgbaPng(heading));
console.log(`art/titles: title and end lettering, heading (Clerkenwell ${wide}px wide at 2x)`);
