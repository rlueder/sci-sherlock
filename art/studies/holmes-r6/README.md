# Holmes r6: complete figures before animation

Status: four full-figure costume key poses approved by the user on 2026-10-01.
The [r7 motion study](../holmes-r7/README.md) animates this model. These replace the rejected r5
character method; they are not completed animation loops. Room art and runtime
manifests are unchanged. Open `/art/studies/holmes-r6/` on the local art server.

The user rejected adding limbs onto an existing torso. Every pose here redraws the
whole body, including shoulders, torso response, arms, sleeves and coat. Neutral,
thinking, cap adjustment and watch inspection are independent whole-figure renders.

## Costume revision

Read the [1895 costume and canonical pipe brief](../../../docs/holmes-costume.md).
`period-pose-source.png` and `period-pose-prompt.txt` are the current source and exact
prompt. `full-pose-source.png` and its prompt retain the earlier anatomy-only pass.
The revised source uses dark clay-pipe styling, older grey temples, straight fuller
trousers and late-Victorian clothing layers while retaining the chosen deerstalker.

`walk-pre-period-source.png` and `cap-pre-period-source.png` preserve exploratory
whole-figure animation sheets with their prompts. They predate the costume brief,
have not passed phase/loop continuity review, and are not exported as animations.
In particular, opposite walk contact poses need better separation and the cap
sequence's final resting pose needs to match its beginning.

## Reproduce the native assets

```sh
pnpm exec tsx art/studies/holmes-r6/convert-poses.ts
pnpm art check art/studies/holmes-r6/art.json
```

The converter thresholds alpha at 200, finds each whole figure's bounds, establishes
a single scale from the neutral figure's 106-pixel target height, samples nearest
pixels, and maps colours to the approved 64-entry palette. It does not rotate,
stretch, graft or interpolate body parts. The canvas is 72×120 with anchor [36,113].
`conversion.json` records measurements; `source/*.pxo` are editable Pixelorama
masters. `review/` provides native-scale room composites and a comparison sheet;
display copies use nearest sampling with 1:1.2 pixel aspect.

## Tools and limits

Source artwork was generated with the built-in ImageGen tool. That generation step
is proprietary and is not reproducible offline. The saved prompts and PNG sources
document it; the same pipeline also accepts whole-figure artwork drawn in Pixelorama
or Krita. Conversion, editable masters and export use the project's open-source
TypeScript/Pixelorama workflow. No generated high-resolution source is a runtime asset.

Technical palette/alpha validation does not establish historical or visual approval.
Review mature facial features at native resolution, pipe readability, watch-chain
attachment, consistent body volume, and near/far feet before proceeding to animation.
