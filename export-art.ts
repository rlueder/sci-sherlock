import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildArt } from "sci2-ts/art";
import { decodePng } from "sci2-ts/png";

// Pixelorama 1.2.3's CLI keeps the project basename even when --output names a file.
// Stage each project separately, map its native names explicitly, then validate everything.
const art = fileURLToPath(new URL("./art/", import.meta.url));
const check = process.argv.includes("--check");
if (process.argv.slice(2).some((arg) => arg !== "--check")) throw new Error("usage: pnpm export-art [--check]");
const bin = process.env.PIXELORAMA_BIN ?? "pixelorama";
const pad = (n: number, length: number) => String(n).padStart(length, "0");
const sequence = (name: string, count: number) => Array.from({ length: count }, (_, i) => [`${name}_${pad(i + 1, 4)}.png`, `${name}-${pad(i, 2)}.png`] as const);
const projects: { name: string; split?: boolean; files: readonly (readonly [string, string])[] }[] = [
  { name: "workshop", split: true, files: [["workshop(base) _0001.png", "workshop.png"], ["workshop(foreground-181) _0001.png", "workshop-front.png"]] },
  { name: "holmes", files: ["east", "south", "north"].flatMap((direction, row) => Array.from({ length: 7 }, (_, i) => [`holmes_${pad(row * 7 + i + 1, 4)}.png`, `holmes-${direction}-${pad(i, 2)}.png`] as const)) },
  { name: "lantern", files: sequence("lantern", 4) },
  { name: "clock", files: sequence("clock", 8) },
  { name: "filings", files: sequence("filings", 2) },
  { name: "scratches", files: [["scratches.png", "scratches.png"]] },
  { name: "dial-inspection", files: [["dial-inspection.png", "dial-inspection.png"]] },
];
const stage = mkdtempSync(join(tmpdir(), "sherlock-art-"));
try {
  mkdirSync(join(stage, "export"));
  for (const name of ["art.json", "palette.json"]) copyFileSync(join(art, name), join(stage, name));
  for (const project of projects) {
    const out = join(stage, project.name); mkdirSync(out);
    const result = spawnSync(bin, ["--headless", "--quit-after", "120", "--", "--export", ...(project.split ? ["--split-layers"] : []), "--output", join(out, `${project.name}.png`), join(art, "source", `${project.name}.pxo`)], {
      encoding: "utf8", timeout: 30_000, maxBuffer: 10 * 1024 * 1024,
    });
    if (result.error) throw new Error(`Cannot run Pixelorama 1.2.3: ${result.error.message}. Set PIXELORAMA_BIN to its executable.`);
    if (result.status !== 0) throw new Error(`Pixelorama failed for ${project.name}: ${result.stderr}`);
    if (!result.stdout.includes("Pixelorama v1.2.3-")) throw new Error("This export mapping requires Pixelorama 1.2.3; verify a new release before changing the pin.");
    assert.deepEqual(readdirSync(out).sort(), project.files.map(([name]) => name).sort(), `${project.name}: unexpected native export filenames or frame count`);
    for (const [native, exported] of project.files) copyFileSync(join(out, native), join(stage, "export", exported));
  }
  const built = buildArt(join(stage, "art.json"));
  const files = projects.flatMap((p) => p.files.map(([, name]) => name));
  for (const name of files) {
    if (check) assert.deepEqual(decodePng(readFileSync(join(stage, "export", name))), decodePng(readFileSync(join(art, "export", name))), `${name}: master and committed PNG differ; run pnpm export-art`);
  }
  // No committed file is touched until every project exported and the complete set passed validation.
  if (!check) for (const name of files) copyFileSync(join(stage, "export", name), join(art, "export", name));
  console.log(`${check ? "Verified" : "Exported"} ${built.images} PNGs from Pixelorama 1.2.3; ${built.resources.length} SCI resources validated.`);
} finally { rmSync(stage, { recursive: true, force: true }); }
