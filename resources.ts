import { fileURLToPath } from "node:url";
import { buildArt } from "sci-ts/art";

/** The game's art enters through the existing resource hook, alongside future sounds. */
export default () => buildArt(fileURLToPath(new URL("./art/art.json", import.meta.url))).resources;
