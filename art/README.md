# The Stopped Clocks: art sources

For learning and contributing, start with the [art learning guide](../docs/art-learning-guide.md).

**Current character reference:** [fixed Holmes master](reference/holmes-master-v1/README.md).
Open `/art/reference/holmes-master-v1/` for the stronger in-room pipe puff, exact
linked character cels, material ramps and pose-drift comparisons. This replaces
independent generated frames as the production method. The walk redraw is pending.

**Earlier character review:** [r7 — anatomy-guided motion](studies/holmes-r7/README.md).
Open `/art/studies/holmes-r7/` for four idle loops, a walk study, frame stepping and
joint overlays. The [r6 costume poses](studies/holmes-r6/README.md) were approved as
the character model; motion and runtime integration remain under review.
The [r5 workshop study](studies/workshop-r5/README.md) retains desk corrections and
interactive clues, but its character animation was rejected for anatomy.

**Latest construction study:** [clock perspective](studies/clock-perspective-r4/README.md).
Open `/art/studies/clock-perspective-r4/` on the dev server for the rigid hinge turn
and construction overlay. Blender and Pixelorama sources are included; side drawing
and approval remain pending.
Keep the editable guides, source files, comparisons and lessons with each delivery;
the [study template](../docs/templates/art-study.md) describes the expected documentation.

**Approved target:** [the exact v6 composition](approved/workshop-v6/README.md).
The r2 adaptation below is rejected visually and remains an experimental technical
delivery. Its publication command is disabled. The review page defaults to v6.

**Current motion review:** [v6 artwork in motion](production/workshop-r3/README.md).
Run `pnpm dev` and open `/art/production/workshop-r3/` for the actual reference-derived
walking cycle and extracted assets. It has its own manifest and editable masters.

The workshop revision delivers **39 unique PNGs, seven editable Pixelorama 1.2.3
masters and one shared 64-colour palette**. Holmes is about 60, with natural proportions,
grey temples, deerstalker and pipe. Run `pnpm dev`, then open
`/art/production/workshop-r2/` for the art review page and animation controls.
See [delivery and engine handoff](production/workshop-r2/README.md).

Production limits: **320×200 room layers, at most 64 opaque colours shared across all
assets**, binary alpha and exact palette membership. The palette has 64 entries from
the reviewed study. `maxColours: 64` in `art.json` makes
the cap part of the validator and game build. Generated studies remain outside this
production contract until adapted to real pixels and the shared palette.

```sh
pnpm art check art/art.json
pnpm art build art/art.json
```

Import `out/art/sherlock/palette.gpl` into Pixelorama. Edit the masters under `source/`,
then run `pnpm export-art` with `PIXELORAMA_BIN` pointing to Pixelorama 1.2.3.
Use `--check` to verify that masters and committed PNGs match without changing them.
There are 39 unique exports; the manifest lists 40 because view 224 aliases view 240
until the engine session updates the inspection ID.

Keep native masters, exports, palette, manifest and credits together. Saved sources and
prompts document optional AI-assisted drafting. OpenAI ImageGen is proprietary; ongoing
editing, conversion, export and validation use open-source tools without that service.
The sources are original project art under MIT; no reference-game artwork is included.

`source/production-r2.ts` reconstructs the delivery in ignored `out/art/production-r2/`.
Its `--publish` option is disabled because this pass was rejected. Once a master is edited
by hand, use the native export workflow. The older `source/workshop.ts` retains its
own 32-colour palette and writes only legacy drafts. Room integration remains separate.

- [Art direction, shot briefs, IDs and production gates](../docs/teaser.md)
- [Export contract and commands](../docs/art-workflow.md)
- [Reference games and open-source tool research](../docs/art-research.md)
