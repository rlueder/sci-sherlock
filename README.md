# The Stopped Clocks

An original Sherlock Holmes workshop scene built with sci-ts. This is the first playable
art proof for the [four-room teaser](../../docs/sherlock-teaser.md), not the complete story.
It uses only this repository's original assets and class library; no Sierra game is needed.

## Play

From the sci-ts repository root, after `pnpm install`:

```sh
pnpm sherlock
```

Open <http://127.0.0.1:5175/sherlock.html>. The command builds the game and starts a local
server. Stop it with Ctrl-C. Set `PORT=5176` to use another port. Re-run the command after
editing art or room files, then reload the browser. Viewer code uses Vite hot reload.

- **Walk / 1:** click the floor to move Holmes.
- **Look / 2:** inspect an object. Click the scene to advance dialogue.
- **Use / 3:** interact. Right-click also cycles the engine's verbs, including Talk.
- **Restart:** start the scene again with its clue flags cleared.

To complete the scene, look at the wall clocks and the brass filings on the floor beside
the grandfather clock, then use the grandfather clock. The preview supplies Holmes's lens;
acquiring it in 221B belongs to the planned full route. Watson remains offscreen.

Delivered: original 320×200 workshop, foreground occlusion, four-direction Holmes walking
(west mirrored), animated lantern, 3:17 inspection and clock opening. No audio, cast
portraits, other rooms, or save/load interface is included yet. Art proportions and the
clock's opening motion remain a style proof for review.

## Validate and review

```sh
pnpm art check games/sherlock/art/art.json
pnpm sherlock:check
pnpm check
```

The headless playthrough uses actual mouse input. It checks walking, lantern frames,
zero/one/two clue gating, inspection visibility, reveal completion, returned control,
revisit persistence and missing kernels. It saves workshop, foreground, dial and reveal
screenshots in `out/art/sherlock-preview/`. This same scenario runs in the test suite.

## Edit the art

Open the `.pxo` masters in `art/source/` using **Pixelorama 1.2.3**. The five masters and
36 reviewed PNGs are committed. `art/source/workshop.ts` generated the initial original
art; it writes draft outputs separately so it cannot replace an artist's edited masters.

```sh
pnpm art build games/sherlock/art/art.json  # also writes an importable palette.gpl
# Set PIXELORAMA_BIN to your installed executable, or put pixelorama on PATH.
pnpm sherlock:export --check               # compare masters with committed exports
pnpm sherlock:export                       # export, validate, then update PNGs
pnpm sherlock:check
```

The native export check was run successfully with Pixelorama 1.2.3 on macOS: all 36 images
matched pixel for pixel. Native editor installation is optional for playing and CI.
See [the workflow](../../docs/art-workflow.md) for palette/alpha rules, source ownership,
frame mapping and export settings; see [the research](../../docs/art-research.md) for
reference games and the open-source tool choice.

Art → PNGs → `art/art.json` → `resources.ts` → SCI resources. Placement and walk polygons
belong in `rooms/102.room.yaml`; dialogue, clue flags and reveal choreography belong in
`rooms/102.yarn`. Compiled archives and screenshots stay under ignored `out/`.
