import { rgbaPng, type Rgba } from "../../../../tools/png.ts";
import { pixelFont } from "../../../../tools/game/font.ts";

/** Small integer-pixel drawing vocabulary for the first art proof. No hidden paint state. */
export class Pixels {
  readonly data: Int16Array;
  constructor(readonly width: number, readonly height: number, colour = -1) {
    this.data = new Int16Array(width * height).fill(colour);
  }
  dot(x: number, y: number, c: number) {
    x = Math.round(x); y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) this.data[y * this.width + x] = c;
  }
  rect(x: number, y: number, w: number, h: number, c: number) {
    for (let yy = Math.round(y); yy < Math.round(y + h); yy++) for (let xx = Math.round(x); xx < Math.round(x + w); xx++) this.dot(xx, yy, c);
  }
  line(x: number, y: number, tx: number, ty: number, c: number) {
    const steps = Math.max(Math.abs(tx - x), Math.abs(ty - y));
    if (!steps) { this.dot(x, y, c); return; }
    for (let i = 0; i <= steps; i++) this.dot(x + (tx - x) * i / steps, y + (ty - y) * i / steps, c);
  }
  poly(points: [number, number][], c: number) {
    for (let y = Math.max(0, Math.floor(Math.min(...points.map((p) => p[1])))); y <= Math.min(this.height - 1, Math.ceil(Math.max(...points.map((p) => p[1])))); y++) {
      const xs: number[] = [];
      points.forEach(([x1, y1], i) => {
        const [x2, y2] = points[(i + 1) % points.length]!;
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1));
      });
      xs.sort((a, b) => a - b);
      for (let i = 0; i < xs.length - 1; i += 2) for (let x = Math.ceil(xs[i]!); x <= Math.floor(xs[i + 1]!); x++) this.dot(x, y, c);
    }
  }
  oval(cx: number, cy: number, rx: number, ry: number, c: number) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      if ((x - cx) ** 2 / rx ** 2 + (y - cy) ** 2 / ry ** 2 <= 1) this.dot(x, y, c);
    }
  }
  paste(p: Pixels, x: number, y: number) {
    for (let yy = 0; yy < p.height; yy++) for (let xx = 0; xx < p.width; xx++) {
      const c = p.data[yy * p.width + xx]!;
      if (c >= 0) this.dot(x + xx, y + yy, c);
    }
  }
  text(text: string, x: number, y: number, c: number) {
    const font = pixelFont();
    for (const ch of text) {
      const glyph = font.glyphs[ch.charCodeAt(0)]!;
      for (let yy = 0; yy < glyph.height; yy++) for (let xx = 0; xx < glyph.width; xx++) {
        if (glyph.pixels[yy * glyph.width + xx]) this.dot(x + xx, y + yy, c);
      }
      x += glyph.width;
    }
  }
  rgba(palette: string[]): Rgba {
    const colours = palette.map((c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)));
    const data = new Uint8Array(this.width * this.height * 4);
    this.data.forEach((c, i) => {
      if (c >= 0) data.set([...colours[c]!, 255], i * 4);
    });
    return { width: this.width, height: this.height, data };
  }
  png(palette: string[]) { return rgbaPng(this.rgba(palette)); }
}
