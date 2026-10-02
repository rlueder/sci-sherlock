# Holmes r17 — one leg at a time

2 October 2026. An east-facing experiment using the approved master, separate leg
layers and the r16 construction. Review the near leg first, then both legs, then
restore the coat and torso. This is not yet a four-direction view-200 handoff.

Open [the interactive preview](index.html). It has play/pause, frame stepping,
travel, joint overlays, and ground-contact markers. The first two panels show a
faint torso for orientation; that ghost is only in the preview.

## The split

`source/split-master.pxo` contains four disjoint, full-canvas layers:

1. Far leg, including the trousers visible through the open coat.
2. Near leg, initially the visible pixels below the coat.
3. Lower coat panels and hem.
4. Head, neck, shoulders, arms and upper torso as one connected piece.

Reassembling these four original layers reproduces master v2 pixel for pixel.
The master itself is unchanged. Animated cels stay 72×120 with anchor [36,113],
use its existing palette, and have binary alpha.

The near thigh is mostly hidden in the standing drawing. Its animation texture
extends that occluded area using the master's trouser colours and texture. The
old coat-shadow edge at the top of the visible shin is cleaned from the trouser
layer so it does not become a moving black seam at the knee. This paintable source
is `source/near-with-hidden-thigh.png`; the unmodified extraction is retained too.

## Motion

Start with the near leg, whose hip, knee, ankle and shoe contact are annotated in
`motion.json`. The foot follows the r16 construction's horizontal trajectory at
0.68 of its displacement, with the foot path centred more closely beneath its hip.
Two-bone inverse kinematics places the knee using fixed segment lengths measured on
the sprite. The same method drives the far leg half a cycle later.

The first layered pass was accepted as an improvement but read as an elderly shuffle.
This correction lengthens the stride by 24%, raises the body over a straighter
supporting leg, and increases swing clearance from about 2.4 to 4.3 native pixels.
The upper body moves only one pixel vertically. The cadence is now 8 cels/second.
A further review asked for a slightly straighter screen-left leg (Holmes’s right).
Its hip rises up to 0.65 native pixels beneath the coat during support. This small
pelvic adjustment extends the knee while preserving both bone lengths and the
planted shoe position. The other leg and torso keep their previous motion.

Each shoe rolls about its toe near the end of stance, reaching 18 degrees at toe-off
and 24 degrees just after it leaves the ground. The ankle follows the rotated shoe
before the knee is solved; rotating a shoe after solving the leg would disconnect
it from the shin. A 3-degree early heel rise lets the trailing support leg extend
without lengthening its bones. Both shoes reuse their original drawn perspective.

A small triangle mesh inverse-samples the same leg texture for every cel. The knee
and ankle transitions blend across a few source rows. Sampling selects existing
palette indices, without antialiasing or per-frame colour generation. This is a
controlled layered sprite animation, rather than independent generated poses.

A shared pelvis backing and dark inner-coat layer sit behind both legs. The lining
fills the space bounded by the moving coat panels, so the room cannot show through
the open coat. Background remains visible naturally between the legs below the hem.
An alpha check covers that coat interior in every cel.

The torso translates as one piece. It has no separately pasted head or collar, no
width changes, and no new shoulder joints. The coat stays attached at its upper
edge and has restrained movement toward the knees near its lower edge. Layer order
puts both legs behind the coat. Each layer remains editable in Pixelorama.

For this horizontal east test, the two shoe depths in the master are preserved;
the construction's diagonal projected root movement is not used vertically.
The cycle travels 29.9953 native pixels. At 8 cels/second it covers about
30 pixels/second. These are study measurements, not a new engine setting.
The preview advances root position with the cel so contact can be inspected.
Continuous engine travel will also need testing against its movement tick rate.
Pixelorama and the browser use 8 fps. Review GIFs use 130 ms frames (about 7.69 fps)
because their frame durations use hundredths of a second; the browser is the timing reference.

## Checks and limits

- Original layers reconstruct the approved master exactly.
- Every torso pixel survives unchanged, apart from whole-layer translation.
- The coat interior has no transparent gaps above its hem.
- Thigh and shin lengths remain fixed; an unreachable foot target stops the build.
- The marked toe stays at the same world x through each stance before pixel rounding.
- Pixelorama 1.2.3 exports all eight dressed cels and the split master identically
  to their PNG references. The hidden joint layer stays out of those exports.

These checks establish useful constraints, not visual approval. The next review
should focus on the single leg's knee bend, foot clearance, toe-off, the inherited
shoe angles, and coat overlap. Torso counter-rotation, stop/start transitions, and
the remaining directions are not finished in this experiment.
Keep those separate from establishing a convincing repeatable step.

## Rebuild

From the repository root after pnpm install:

```sh
node --import tsx art/studies/holmes-r17/build.ts
node --import tsx art/studies/holmes-r17/review.ts
node --import tsx art/studies/holmes-r17/compress-gifs.ts
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/studies/holmes-r17/verify-native.ts
```

Use the pinned Pixelorama 1.2.3 exporter. The build consumes r16's checked projected
construction and the versioned Holmes master; it does not require another image
generation call. The editable animation is `source/layered-walk.pxo`, with the joint
guide hidden on its own layer. No assets from this study are registered in art/art.json.
