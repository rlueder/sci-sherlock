# Holmes r11 — investigation key poses

First pass for view **204**, following the art-spec delivery list. Four keys each for
the clock reach (loop0) and kneeling with a lens (loop1). These are review drawings
with timed holds and a reversed return, not finished production choreography.

Open [the review](http://127.0.0.1:5176/art/studies/holmes-r11/) while the repository's
static server is running. Pause, step through keys, scrub, or enable joint/contact
guides. The source links download editable Pixelorama projects.

## Drawing and registration

1. `plan.ts` stages the major joints before drawing. The rough guide is retained
   separately from the later joint trace.
2. Built-in ImageGen rendered coherent whole figures using the fixed master plus
   each staging guide. Exact prompts and original transparent sheets are in
   [generated](generated/). This generative step is not open source or deterministic.
3. `convert.ts` uses one scale per sheet, derived from its neutral standing figure,
   and the master's palette. The x/y ratio compensates for 1:1.2 display pixels.
   Kneeling figures are never independently enlarged to fill the canvas.
   Registration translations and source bounds are recorded in `registration.json`.
   Four pixels of pose translation keep the complete kneeling silhouette in bounds.
4. `build.ts` returns to the exact pinned neutral. Reach uses the whole redrawn
   chest and sleeve, retaining the unchanged master head and lower stance. Kneeling
   uses whole-body redraws with three named master-derived downward head variants
   (0.22, 0.30 and 0.40 radians in display space). These are small head rotations,
   not a limb-deformation system.
5. Native cleanup reconnects the lens rim at its tiny output size and clears old
   pipe pixels before placing the named head variant. The lowered stance naturally
   hides the watch chain; it remains visible in neutral and the exposed waistcoat.
6. Pixelorama projects contain full-body keys and a hidden joint-construction layer.
   The overlays trace visible joints and estimate joints under the coat. They are
   review aids, not a skeleton solve or automatic proof of anatomy.

## Contract and review limits

- Native canvas **72×120**, anchor **[36,113]**, standing height **106px**.
- The shared64-color palette and binary transparency are preserved.
- First/return neutral equals masterv2 byte-for-byte in decoded pixels.
- No frame-by-frame scaling, synthesized limb interpolation or new runtime logic.
- The clock reach currently contacts the case and eases back. It does **not** yet
  track a hand along the entire swinging case; that requires the clock-reveal pass.
- Kneeling needs visual review for weight, coat folds and lens-to-floor distance.
  Four keys establish the action; added timing alone cannot supply missing anatomy.
- All files remain studies. Walking stays after the pending idle review.

## Reproduce and verify

From the repository root:

```sh
pnpm exec tsx art/studies/holmes-r11/plan.ts
pnpm exec tsx art/studies/holmes-r11/convert.ts
pnpm exec tsx art/studies/holmes-r11/build.ts
pnpm art check art/studies/holmes-r11/art.json
PIXELORAMA_BIN=/path/to/Pixelorama pnpm exec tsx art/studies/holmes-r11/verify-native.ts
pnpm exec tsx art/studies/holmes-r11/compress-gifs.ts
pnpm typecheck
```

Pixelorama1.2.3 (MIT) is the editable native tool. TypeScript helpers are in this
MIT repository. Optional FFmpeg packaging uses the exact project palette, checks
decoded RGB frames, and changes compression only. No paid editor is required.

`art.json` exposes eight unique keys as view204. `animation.json` separately
records review timing, contacts and joint locations; it is not an engine scheduler.
