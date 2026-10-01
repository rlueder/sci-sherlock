import { fileURLToPath } from "node:url";
import { buildArt } from "../../tools/art/build.ts";

/** The game's art enters through the existing resource hook, alongside future sounds. */
export default () => buildArt(fileURLToPath(new URL("./art/art.json", import.meta.url))).resources;
