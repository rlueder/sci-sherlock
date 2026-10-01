# Holmes r10: gesture corrections on master v2

Open `/art/studies/holmes-r10/` for the idle loops, frame stepping, native-model
comparison and joint guides. `/art/studies/workshop-r9/` combines these with the
room atmosphere. Walking remains deferred. These are art-review assets; no game
YAML, Yarn or engine integration is changed.

## Corrections from the r8 review

- **Thinking:** a new complete pose drawing places the index finger against the
  chin, with the thumb under the jaw. Its coherent sleeve/hand region replaces the
  earlier lapel-height gesture. The mask now permits intentional chin contact.
- **Cap:** the exact master cap lifts one native pixel during the held adjustment,
  exposes a hair row, then settles. A reusable torso plate retains the coat and
  waistcoat breadth behind the raised arm instead of removing that volume.
- **Watch:** named 0.12- and 0.25-radian downward head variants accompany retrieval
  and inspection. The rigid head/cap/pipe rotation accounts for the 1:1.2 pixel
  aspect; limbs are not rotated. The waistcoat chain is permanent in master v2,
  all neutral returns, the puff and the other gestures. The extended watch chain
  is cleaned at native resolution.

The torso plate removes the original resting hand/sleeve and exposes cloth sampled
from the same master's waistcoat and coat. It is shared across the gestures. The
active sleeve comes from complete rendered pose sources, rather than newly attached
limb shapes. The lower coat, planted feet and opposite side remain fixed. Every
pixel outside the explicit variation mask is checked against the master, as are
exact neutral returns. Named head/cap changes are exceptions to the old frozen-head
rule, not permission to regenerate the character independently for each cel.

## Sources and rebuilding

```sh
pnpm exec tsx art/reference/holmes-master-v2/build.ts
pnpm exec tsx art/studies/holmes-r10/convert.ts
pnpm exec tsx art/studies/holmes-r10/build.ts
pnpm art check art/studies/holmes-r10/art.json
PIXELORAMA_BIN=/path/to/Pixelorama pnpm exec tsx art/studies/holmes-r10/verify-native.ts
```

`generated/thinking.png` and `thinking-prompt.txt` preserve the new whole-pose
ImageGen edit and its exact prompt. This drafting service is proprietary; saved
inputs make all conversion, native editing, playback and verification reproducible
with open-source tools and no generation call. Cap/watch and the transition drawing
reuse `../holmes-r8/source/*-registered-*.png`; those historical sources are retained.

`source/torso-plate.png` records the reusable body under the moving arm.
`source/*-key-*.png` are cleaned keys. Three editable `.pxo` timelines have locked,
linked unchanged pixels and separate pose variations. Builders overwrite generated
projects, so preserve hand-edited `.pxo` files and export them natively.

Pixelorama 1.2.3 exports all **77 new timeline cels** identically to the delivered
PNGs. The manifest also checks the 26 master-v2 puff cels: **103 PNGs**, restricted
to the existing 64-colour palette and binary alpha. These checks establish fidelity,
not anatomical quality. `review/keys.png`, `review/joints.png` and the player support
visual judgment. The four keys per action use holds and reversed return, not synthetic
limb interpolation; smoother reaches would need additional coherent drawings.
