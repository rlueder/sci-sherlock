# Holmes r8: idle gestures from the fixed model

Historical review. [R10](../holmes-r10/README.md) supersedes this pass after feedback
on chin contact, torso narrowing, cap motion and the watch glance.

Open `/art/studies/holmes-r8/` on the local art server. Thinking, cap adjustment and
pocket-watch retrieval each return to the exact approved neutral sprite. The page
also plays the approved puff, with its repaired background. Walking is deliberately
deferred until the idle poses are settled. These are review assets, not runtime changes.

## What changed

R7 treated independently rendered complete figures as animation cels. Even with a
shared palette, head shape, coat texture and stance varied. R8 uses those renderings
only as coherent pose drawings, then keeps the fixed master authoritative for every
unchanged region. The locked layer contains the exact head, cap, pipe, stationary arm,
left coat silhouette, lower coat, legs and feet. All pixels at y >= 59 stay identical.

The active chest/shoulder/sleeve region is redrawn from complete-figure sources, not
from rotated limb fragments. `source/gesture-mask.png` defines its allowed extent;
opaque master pixels above y=28 remain protected, while fingers can meet the head's
edge. The mask covers part of the chest as well as the arm so the shoulder/sleeve can
read as one form. Every source drawing is registered by the cap/face, using one
uniform scale per sheet and translation only. The exact registration is recorded.

The three actions are restrained standing gestures: their unchanged stance makes a
linked body appropriate. This method is **not** a walking rig. A stride needs coherent
pelvis, legs, coat-skirt and weight changes; it cannot inherit this idle mask unchanged.

- Thinking: hand rises from lapel to chin, pauses, then returns.
- Cap: the same hand reaches the forward brim and gives a small adjustment. The
  head and cap silhouette stay still; this is a brim touch, not a cap lift.
- Watch: hand reaches the waistcoat pocket, draws a watch, raises it and puts it back.
  The tiny gold watch and chain receive explicit native-pixel cleanup because
  nearest sampling lost the thin source chain. These edits affect the prop only.

Three editable Pixelorama timelines contain 77 cels including timing holds. Their
first and last cels equal the master exactly. Build assertions check every pixel
outside the gesture mask, rather than merely comparing total sprite width. Drawing
colours are mapped to the master's exact colour set; the hand-cleaned watch uses
existing room gold entries. The palette remains the project's shared 64 colours.

## Sources and reproducibility

```sh
pnpm exec tsx art/studies/holmes-r8/convert.ts
pnpm exec tsx art/studies/holmes-r8/build.ts
pnpm typecheck
pnpm art check art/studies/holmes-r8/art.json
PIXELORAMA_BIN=/path/to/Pixelorama pnpm exec tsx art/studies/holmes-r8/verify-native.ts
```

- `generated/`: complete gesture sheets edited from the one fixed master with the
  built-in OpenAI ImageGen tool, plus exact prompts. This optional drafting tool is
  proprietary. Conversion, native cels, playback and export verification are open
  source and reproduce from the saved inputs without a model call.
- `source/*-registered-*.png`: converted proposals, before identity cleanup. These
  are intentionally preserved to show what still drifted despite reference prompting.
- `source/*-key-*.png`: cleaned gesture keys with the fixed model restored outside
  the reviewed change region. `*.pxo` keeps the fixed pixels locked and linked.
- `review/keys.png`, `review/joints.png`: all keys and shoulder/elbow/wrist annotations.
  Joint locations are projected drawing estimates, not an automatic anatomy test.
- `animation.json`: sequences, 8 fps timing, anchors and guide coordinates.
- `art.json`: view 206 in puff/thinking/cap/watch order, including the existing puff
  by reference. The art check covers 103 PNG cels; it does not certify good motion.
- `native-export-check.json`: actual Pixelorama 1.2.3 exports compared with all 77
  delivered new cels. The already-verified puff master remains in its reference pack.

Once a `.pxo` is edited by hand, export it natively and preserve it: running the
builder overwrites its generated timelines. Hide guides before exporting. Review
native pixels and the 4:3 room presentation; the tall display pixels have 1:1.2 aspect.

## Review limits

The current loops use four drawn keys plus holds and reverse return; there is no
synthetic limb interpolation. Extra in-between drawings may improve the cap reach.
The watch's head remains in the fixed view; a downward glance would require a named
eye/head variant instead of silently regenerating the face. Inspect these choices
in playback before integrating them. No game YAML, Yarn or engine code changed.
