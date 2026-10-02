/**
 * The published site, in out/site: this game's page (index.html, built by Vite) with the
 * game beside it in game/, and the SoundFont in soundfonts/ if it's in assets/soundfonts
 * (the Pages workflow fetches it). Relative paths throughout, so it works from any folder.
 *
 *   pnpm site
 */
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { writeResourceArchive } from "sci2-ts";
import { buildGame } from "sci2-ts/build";

const root = fileURLToPath(new URL(".", import.meta.url));
const out = resolve(root, "out/site");

await build({ root, base: "./", logLevel: "warn", build: { outDir: out, emptyOutDir: true } });

const game = await buildGame(root);
for (const w of game.warnings) console.warn(`warning: ${w}`);
const { map, volume } = writeResourceArchive(game.resources);
const files: Record<string, Uint8Array> = { "RESOURCE.MAP": map, "RESOURCE.000": volume, ...game.files };
mkdirSync(join(out, "game"), { recursive: true });
for (const [name, data] of Object.entries(files)) writeFileSync(join(out, "game", name), data);
// The player lists the game's files from this, in place of the dev server's listings.
writeFileSync(join(out, "game/files.json"), JSON.stringify({ "": Object.keys(files) }));

const soundFont = join(root, "assets/soundfonts/GeneralUser-GS.sf2");
if (existsSync(soundFont)) cpSync(soundFont, join(out, "soundfonts/GeneralUser-GS.sf2"));
console.log(`out/site: the page, the game (${game.resources.length} resources)${existsSync(soundFont) ? " and the SoundFont" : "; no SoundFont, so music is silent"}`);
