/**
 * The published site, in out/site: this game's page (index.html, built by Vite) with the
 * game beside it in game/, and the SoundFont in soundfonts/ if it's in assets/soundfonts
 * (the Pages workflow fetches it), and the notes on how it's made in docs/ (docs-site.ts).
 * Relative paths throughout, so it works from any folder.
 *
 *   pnpm site
 */
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import { writeResourceArchive } from "sci2-ts";
import { buildGame } from "sci2-ts/build";
import { buildDocs } from "./docs-site.ts";

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
// With the build's version: the player fetches every game file with it, so a new deploy is
// never mixed with files a browser cached from the last one.
const version = createHash("sha256");
for (const name of Object.keys(files).sort()) version.update(name).update(files[name]!);
writeFileSync(join(out, "game/files.json"), JSON.stringify({ "": Object.keys(files), version: version.digest("hex").slice(0, 12) }));

// The dialogue font's licence goes with it: its notices belong with any copy.
mkdirSync(join(out, "licences"), { recursive: true });
cpSync(join(root, "art/studies/typography-r29/source/upstream/COPYING"), join(out, "licences/new-century-schoolbook.txt"));

const docs = buildDocs(join(out, "docs"));

const soundFont = join(root, "assets/soundfonts/GeneralUser-GS.sf2");
if (existsSync(soundFont)) cpSync(soundFont, join(out, "soundfonts/GeneralUser-GS.sf2"));
console.log(`out/site: the page, the game (${game.resources.length} resources), ${docs.pages} pages of notes${existsSync(soundFont) ? " and the SoundFont" : "; no SoundFont, so music is silent"}`);
