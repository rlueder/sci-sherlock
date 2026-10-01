import { fileURLToPath } from "node:url";
import { buildArt } from "sci-ts/art";
import { ResourceType, writeView, type Cel, type ResourceData } from "sci-ts/kit";

/** The game's art enters through the existing resource hook, alongside future sounds. */
export default (): ResourceData[] => {
  const art = buildArt(fileURLToPath(new URL("./art/art.json", import.meta.url))).resources;
  const has = (n: number) => art.some((r) => r.type === ResourceType.View && r.number === n);
  return [...art, ...(has(250) ? [] : [{ type: ResourceType.View, number: 250, data: placeholderLens() }])];
};

/**
 * A stand-in for the lens (view 250) until the art arrives: a ring with a handle in black
 * and white (palette entries 0 and 255). Loop 0 is the 24x24 icon, loop 1 a 12x12 cursor
 * with its hotspot in the glass; both anchored as the visual spec asks.
 */
function placeholderLens() {
  const draw = (size: number, ring: [number, number, number], handle: boolean, hotspot: [number, number]): Cel => {
    const pixels = new Uint8Array(size * size).fill(254);
    const [cx, cy, r] = ring;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= r + 0.5 && d >= r - 1.5) pixels[y * size + x] = 0;
        else if (d < r - 1.5) pixels[y * size + x] = 255;
        else if (handle && x === y && x > cx + r - 2) for (const o of [0, 1]) if (x + o < size) pixels[y * size + x + o] = 0;
      }
    }
    return { width: size, height: size, displaceX: (size >> 1) - hotspot[0], displaceY: size - 1 - hotspot[1], skipColor: 254, pixels };
  };
  return writeView({
    flags: 1,
    loops: [
      { link: -1, mirror: false, cels: [draw(24, [10, 10, 8], true, [0, 0])] },
      { link: -1, mirror: false, cels: [draw(12, [5, 5, 4], true, [5, 5])] },
    ],
    palette: undefined,
  });
}
