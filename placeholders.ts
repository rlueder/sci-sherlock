import { readFileSync } from "node:fs";
import { ResourceType, basePalette, pixelFont, writePic, writeView, type Cel, type ResourceData } from "sci2-ts/kit";

/**
 * Stand-ins for art that hasn't been delivered yet, so the whole teaser plays from the first
 * room to the last: a plain room with its name on the wall for each missing picture, and a
 * flat figure for each missing person or prop. Each is used only while art/art.json has no
 * resource of that number; delivered art replaces it without any change here.
 *
 * Everything is drawn in the game's own palette (art/palette.json), so the stand-ins sit
 * among real art without disturbing its colours.
 */

const paletteFile = new URL("./art/palette.json", import.meta.url);

/** The palette the art builds with: its colours at 0, 1, 2..., the last at 255. */
function gamePalette() {
  const colours = (JSON.parse(readFileSync(paletteFile, "utf8")) as string[]).map((hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)) as [number, number, number]);
  const palette = basePalette();
  colours.forEach((rgb, i) => (palette.rgb[i === colours.length - 1 ? 255 : i] = rgb));
  const indices = colours.map((_, i) => (i === colours.length - 1 ? 255 : i));
  /** The palette entry nearest a colour. */
  const nearest = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)) as [number, number, number];
    let best = 0, bestDist = Infinity;
    colours.forEach(([cr, cg, cb], i) => {
      const d = (cr - r) ** 2 + (cg - g) ** 2 + (cb - b) ** 2;
      if (d < bestDist) (bestDist = d), (best = indices[i]!);
    });
    return best;
  };
  return { palette, nearest };
}

/** Writes text into pixels with sci-ts's pixel font, `scale` times its size, top-left at (x, y). */
function text(pixels: Uint8Array, width: number, s: string, x: number, y: number, colour: number, scale = 1) {
  const font = pixelFont();
  for (const ch of s) {
    const glyph = font.glyphs[ch.charCodeAt(0)];
    if (!glyph) continue;
    for (let gy = 0; gy < glyph.height * scale; gy++) for (let gx = 0; gx < glyph.width * scale; gx++) {
      if (glyph.pixels[Math.floor(gy / scale) * glyph.width + Math.floor(gx / scale)]) pixels[(y + gy) * width + x + gx] = colour;
    }
    x += glyph.width * scale;
  }
}

const textWidth = (s: string, scale = 1) => scale * [...s].reduce((w, ch) => w + (pixelFont().glyphs[ch.charCodeAt(0)]?.width ?? 0), 0);

interface RoomStandIn {
  name: string;
  wall: string;
  floor: string;
  /** Where the floor starts (the wall above). */
  horizon: number;
  /** A screen rather than a room: these lines, large, in the middle (title, end card). */
  lines?: string[];
}

const ROOMS: Record<number, RoomStandIn> = {
  100: { name: "221B BAKER STREET: THE SITTING ROOM", wall: "#4f3630", floor: "#753a20", horizon: 120 },
  101: { name: "BAKER STREET", wall: "#30374c", floor: "#404b3f", horizon: 118 },
  103: { name: "THE HIDDEN STAIR", wall: "#18151f", floor: "#271618", horizon: 110 },
  104: { name: "TITLE", wall: "#18151f", floor: "#18151f", horizon: 200, lines: ["SHERLOCK HOLMES", "", "THE STOPPED CLOCKS"] },
  105: { name: "END CARD", wall: "#18151f", floor: "#18151f", horizon: 200, lines: ["TO BE CONTINUED"] },
};

interface FigureStandIn {
  /** Coat, head and a band of colour (waistcoat, apron, collar). */
  coat: string;
  band: string;
  height: number;
  width: number;
  /** Seated (one pose) or standing (four directions). */
  seated?: boolean;
}

const FIGURES: Record<number, FigureStandIn> = {
  // Heights to the scale of Holmes (view 200, about 106 pixels standing).
  201: { coat: "#4f291d", band: "#a41f28", height: 102, width: 34 }, // Watson, standing
  202: { coat: "#24273b", band: "#e8dcc0", height: 94, width: 30 }, // Mrs Hudson
  203: { coat: "#444541", band: "#753a20", height: 96, width: 32 }, // Toby
  205: { coat: "#4f291d", band: "#a41f28", height: 76, width: 38, seated: true }, // Watson, seated
};

export function placeholders(have: (type: ResourceType, n: number) => boolean): ResourceData[] {
  const { palette, nearest } = gamePalette();
  const skin = nearest("#d8a080");
  const out: ResourceData[] = [];

  for (const [n, room] of Object.entries(ROOMS)) {
    if (have(ResourceType.Pic, Number(n))) continue;
    const [w, h] = [320, 200];
    const pixels = new Uint8Array(w * h);
    const wall = nearest(room.wall), floor = nearest(room.floor), line = nearest("#000000"), label = nearest("#ffffff");
    for (let y = 0; y < h; y++) pixels.fill(y < room.horizon ? wall : floor, y * w, (y + 1) * w);
    if (room.horizon < h) pixels.fill(line, room.horizon * w, (room.horizon + 1) * w);
    const title = `${room.name} (STAND-IN)`;
    text(pixels, w, title, (w - textWidth(title)) >> 1, 8, label);
    const lines = room.lines ?? [];
    lines.forEach((l, i) => text(pixels, w, l, (w - textWidth(l, 2)) >> 1, 100 - lines.length * 10 + i * 20, label, 2));
    const cel = { width: w, height: h, displaceX: 0, displaceY: 0, skipColor: 254, pixels, priority: -1000, x: 0, y: 0, unknown16: 0 };
    out.push({ type: ResourceType.Pic, number: Number(n), data: writePic({ resolution: [w, h], cels: [cel], palette }) });
  }

  for (const [n, f] of Object.entries(FIGURES)) {
    if (have(ResourceType.View, Number(n))) continue;
    const coat = nearest(f.coat), band = nearest(f.band), outline = nearest("#000000");
    const cel = (facing: "side" | "front" | "back"): Cel => {
      const { width: w, height: h } = f;
      const pixels = new Uint8Array(w * h).fill(254);
      const head = Math.round(w * 0.32);
      const cx = w >> 1;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (y < head * 2) {
            if ((x - cx) ** 2 + (y - head) ** 2 <= head * head) pixels[i] = facing === "back" ? coat : skin;
          } else if (Math.abs(x - cx) <= (w >> 1) - 1 - (y > h * 0.8 ? 2 : 0)) {
            pixels[i] = y > head * 2 + 3 && y < head * 2 + 10 && facing !== "back" && Math.abs(x - cx) <= 3 ? band : coat;
          }
        }
      }
      // A dark edge round the figure, so it reads against any room.
      const edged = pixels.slice();
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (pixels[y * w + x] !== 254) continue;
        if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => pixels[(y + dy!) * w + x + dx!] !== undefined && x + dx! >= 0 && x + dx! < w && pixels[(y + dy!) * w + x + dx!] !== 254)) edged[y * w + x] = outline;
      }
      // The anchor is between the feet: the bottom middle.
      return { width: w, height: h, displaceX: 0, displaceY: 0, skipColor: 254, pixels: edged };
    };
    const loops = f.seated
      ? [{ link: -1, mirror: false, cels: [cel("front")] }]
      : [
          { link: -1, mirror: false, cels: [cel("side")] },
          { link: 0, mirror: true, cels: [] },
          { link: -1, mirror: false, cels: [cel("front")] },
          { link: -1, mirror: false, cels: [cel("back")] },
        ];
    out.push({ type: ResourceType.View, number: Number(n), data: writeView({ flags: 1, loops, palette: undefined }) });
  }

  // The lens on the mantel (view 223): a small glint, until the art arrives.
  if (!have(ResourceType.View, 223)) {
    const glass = nearest("#c0d8e0"), rim = nearest("#a07030");
    const pixels = Uint8Array.from([254, rim, rim, 254, rim, glass, glass, rim, rim, glass, glass, rim, 254, rim, rim, rim]);
    out.push({ type: ResourceType.View, number: 223, data: writeView({ flags: 1, loops: [{ link: -1, mirror: false, cels: [{ width: 4, height: 4, displaceX: 0, displaceY: 0, skipColor: 254, pixels }] }], palette: undefined }) });
  }
  return out;
}
