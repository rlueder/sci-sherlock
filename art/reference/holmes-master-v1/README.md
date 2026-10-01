# Holmes: one fixed character master

Open `/art/reference/holmes-master-v1/` on the local dev server. The page shows the
fixed model, a stronger pipe puff against the actual workshop, and comparisons with
the earlier poses. This is an authoring reference and smoke proof, not a completed
replacement walk or a runtime asset update.

## Why the workflow changed

The r6 poses established the desired costume and appearance. Independently generated
r7 frames introduced different head shapes, colour placement and body widths. A shared
64-colour palette prevented new colours outside the room palette, but did not keep
the same colours on the same materials. Skeleton guides helped pose planning without
locking the character's identity. Generating a wider walk alone would preserve that
underlying problem; its superseded draft is retained in
`../../studies/holmes-r7/generated/walk-width-superseded.png`.

`master.png` is a byte-for-byte copy of the approved r6 neutral sprite, selected as
the single identity reference. It contains 43 colours from the existing 64-colour
room palette. Its head, deerstalker, period costume, black clay pipe, 106-pixel
height, 72×120 canvas and [36,113] anchor are fixed. Display uses 1:1.2 pixel aspect.
`contract.json` pins the source and palette hashes. Do not silently replace this
model when making a new action; a revised identity needs a new reference version.

## Draw variations from the reference

1. Open `source/master.pxo` or `source/walk-drawing-template.pxo` in Pixelorama 1.2.3.
   Import `character-palette.gpl`. Keep the locked reference visible beside the drawing.
   Named material ramps in the contract are a drawing brief, not automatic material
   segmentation or an automated guarantee about colour placement.
2. Plan the complete pose around the joint guides. Preserve shoulder/chest/pelvis
   volume, near/far perspective and the overcoat's length and overlapping skirts.
   Do not stretch a thin finished frame or graft arbitrary limbs onto a frozen torso.
3. Reuse exact linked cels for genuinely unchanged content. When a pose changes the
   torso or head orientation, redraw those affected forms coherently. A new head
   angle needs a named reference variant; it must not become a different face.
4. Enable previous/next-frame onion skins in the timeline. Compare silhouette, head,
   colour placement, planted feet and coat motion at native resolution and in-room.
   A wire skeleton is a construction aid, not proof of good anatomy.
5. Hide the guide layers before exporting. The eight-frame drawing template has the
   master on the left and **blank drawing cels** over guides on the right. Export only
   the right 72×120 area, never the entire 144×120 reference workspace.

Pixelorama's [linked cels](https://pixelorama.org/concepts/cel/) share image data
within a layer. Its [timeline](https://pixelorama.org/user_manual/user_interface/timeline/)
provides layer locks and onion skins. The files here use actual native linked-cel
metadata, verified by exporting through Pixelorama. They do not rely on a custom
preview pretending to be an editable animation project.

## Stronger pipe puff: first fixed-model proof

`source/fixed-puff.pxo` has a locked, linked full-body cel across 26 timeline frames
and a separate editable smoke layer. Only the smoke changes: the build asserts zero
changed opaque character pixels in every composite. This intentionally simple effect
proves exact identity reuse; it does not prove the walk or gesture redraws are solved.

The earlier puff disappeared into the workshop. The replacement grows to a
19-native-pixel curl using three brighter existing palette entries, holds its peak
for half a second at 8 fps, then breaks apart. Review `review/puff-room.gif` against
the room and `review/puff-comparison.gif` beside the older generated animation.
The GIF's 130 ms frame interval approximates the native 125 ms timeline.

The in-room preview also repairs five old mouth/pipe pixels left in R3's background
by its coarse character extraction. `background-cleanup.json` records the exact
coordinates. The repair samples R3's existing hidden-surface source with the same
palette mapping; `source/pipe-cleanup.pxo` keeps the correction on a separate layer
over the locked original room. `review/pipe-cleanup-comparison.png` shows before
(left) and after (right). The build checks that only those five background pixels
change. This repair does not modify the pinned sprite or historical R3 exports.

The smoke source alone was generated with proprietary OpenAI ImageGen. Its exact
prompt and transparent source are saved in `generated/`; no body was generated for
this proof. Conversion, editable timelines and export checks use open-source tools
and need no further model call. The r6 master retains its documented source provenance.

## Reproduce and verify

From the repository root:

```sh
pnpm exec tsx art/reference/holmes-master-v1/build.ts
pnpm art check art/reference/holmes-master-v1/art.json
pnpm typecheck
PIXELORAMA_BIN=/path/to/Pixelorama pnpm exec tsx art/reference/holmes-master-v1/verify-native.ts
```

`build.ts` reconstructs the initial reference projects and proof from saved inputs.
After hand-editing a `.pxo`, preserve that edited master and export it natively;
rerunning the builder overwrites its generated projects.

- `proof.json`: 26 frames, zero changed opaque character pixels; source registration
  and smoke palette recorded.
- `native-export-check.json`: four Pixelorama 1.2.3 projects, 36 exports checked;
  all puff pixels match, linked body metadata is present, and all eight drawing
  template frames preserve the exact master in their reference half. The layered
  background cleanup exports exactly to the repaired room PNG.
- `drift-report.json`: diagnostic width bands, registered head differences and
  colours outside the master's exact set for earlier r7 poses. Sleeve movement,
  head turns and occlusion can legitimately change these measurements. A low score
  is not automatic art approval, and palette membership cannot detect wrong placement.

The first three old walk cels have mean waist silhouettes around 20–22 pixels versus
25.3 in the master; the comparison makes the reported thinness visible. Correcting
that walk consistently, drawing stable head variants, and completing gesture
transitions remain the next character work. Existing r7 poses are action references,
not approved final animation cels. No game YAML, Yarn or runtime asset was changed.
