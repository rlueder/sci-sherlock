# The Stopped Clocks: art sources

This folder contains the workshop's original style-proof art: a 32-colour palette,
36 PNG exports and five native Pixelorama 1.2.3 masters. Run `pnpm sherlock` from the
repository root to play it; see [controls and commands](../README.md).

Production limits: **320×200 room layers, at most 64 opaque colours shared across all
assets**, binary alpha and exact palette membership. The current palette has 32 entries;
keep its colour direction as we refine the new art. `maxColours: 64` in `art.json` makes
the cap part of the validator and game build. Generated studies remain outside this
production contract until adapted to real pixels and the shared palette.

```sh
pnpm art check games/sherlock/art/art.json
pnpm art build games/sherlock/art/art.json
```

Import `out/art/sherlock/palette.gpl` into Pixelorama. Edit the masters under `source/`,
then run `pnpm sherlock:export` with `PIXELORAMA_BIN` pointing to Pixelorama 1.2.3.
Use `--check` to verify that masters and committed PNGs match without changing them.
The native export check has passed for all 36 images on macOS.

Keep native masters, exports, palette, manifest and credits together. The TypeScript
drawing source seeds new drafts under `out/art/sherlock-draft/`; it never replaces
production masters. These drawings are original project art under MIT, not copied
reference-game assets. The user’s art review on 1 October 2026 requires a revision toward
The Lost Files of Sherlock Holmes and Return of the Phantom: naturalistic perspective,
proportions and material shading. The current cartoon-like composition is a technical
prototype, not the approved visual target. See the updated direction below.

- [Art direction, shot briefs, IDs and production gates](../../../docs/sherlock-teaser.md)
- [Export contract and commands](../../../docs/art-workflow.md)
- [Reference games and open-source tool research](../../../docs/art-research.md)
