# sci-sherlock: The Stopped Clocks

An original Sherlock Holmes workshop scene running on [sci-ts](https://github.com/rlueder/sci-ts),
an SCI2 adventure game engine in TypeScript. This is the first playable art proof for the
[four-room teaser](docs/teaser.md), not the complete story. Everything here is original:
the art, the scripts and the rooms; the engine, its class library and the tools come from
sci-ts.

## Setup

sci-ts is a dependency, linked from a checkout next to this one:

```sh
git clone https://github.com/rlueder/sci-ts ../sci-ts   # once
(cd ../sci-ts && pnpm install)
pnpm install
```

The game imports the engine and tools through the package (`sci-ts`, `sci-ts/kit`,
`sci-ts/build`, `sci-ts/art`, `sci-ts/png`, `sci-ts/viewer`, `sci-ts/vite`), and the
`sci-ts` command builds, serves and checks it.

## Play

```sh
pnpm dev        # this repository's workshop page: http://127.0.0.1:5173/
pnpm play       # the same game in sci-ts's player
pnpm edit       # sci-ts's live editor for its rooms
```

`pnpm dev` builds the game into out/game and serves index.html with Vite (`--port` to
choose another port). Re-run it after changing art or rooms, then reload the browser.

## Docs

- [The teaser plan](docs/teaser.md): story, rooms, art direction, production gates
- [Visual elements](docs/visual-spec.md): every image the teaser needs, and its contract
- [Art workflow](docs/art-workflow.md): exports, the palette, the manifest
- [Art research](docs/art-research.md): references and tool decisions

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
pnpm art check art/art.json
pnpm preview
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
pnpm art build art/art.json  # also writes an importable palette.gpl
# Set PIXELORAMA_BIN to your installed executable, or put pixelorama on PATH.
pnpm export-art --check               # compare masters with committed exports
pnpm export-art                       # export, validate, then update PNGs
pnpm preview
```

The native export check was run successfully with Pixelorama 1.2.3 on macOS: all 36 images
matched pixel for pixel. Native editor installation is optional for playing and CI.
See [the workflow](docs/art-workflow.md) for palette/alpha rules, source ownership,
frame mapping and export settings; see [the research](docs/art-research.md) for
reference games and the open-source tool choice.

Art → PNGs → `art/art.json` → `resources.ts` → SCI resources. Placement and walk polygons
belong in `rooms/102.room.yaml`; dialogue, clue flags and reveal choreography belong in
`rooms/102.yarn`. Compiled archives and screenshots stay under ignored `out/`.
