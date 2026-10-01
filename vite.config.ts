import { defineConfig } from "vite";
import { sciGame } from "sci-ts/vite";

/**
 * The workshop page (index.html), playing the game `pnpm build` writes to out/game. Music
 * plays when a SoundFont is in assets/soundfonts (not part of the repository).
 */
export default defineConfig({
  publicDir: false,
  server: { host: "127.0.0.1" },
  plugins: [sciGame({ game: "out/game", soundfonts: "assets/soundfonts" })],
});
