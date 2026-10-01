import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeResourceArchive } from "../../packages/sci/src/index.ts";
import { buildGame } from "../../tools/game/build.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const game = await buildGame(join(root, "games/sherlock"));
const out = join(root, "out/games/sherlock");
const archive = writeResourceArchive(game.resources);
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "RESOURCE.MAP"), archive.map);
writeFileSync(join(out, "RESOURCE.000"), archive.volume);
const port = process.env.PORT ?? "5175";
console.log(`Sherlock workshop: http://127.0.0.1:${port}/sherlock.html`);
const server = spawn(process.execPath, [join(root, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", port, "--strictPort"], {
  cwd: join(root, "apps/viewer"), env: { ...process.env, SCI_GAME: out }, stdio: "inherit",
});
server.on("error", (error) => { console.error(error); process.exitCode = 1; });
server.on("exit", (code) => { process.exitCode = code ?? 0; });
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => server.kill(signal));
