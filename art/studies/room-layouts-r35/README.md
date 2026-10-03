# Terrace variations and straight stair — r35

[Review all options](index.html). These are composition studies, not registered game
resources. They respond to the user's rejection of r34's sideways stair and isolated
Baker Street frontage. The workshop r34 and 221B interior r33 are unchanged.

## Options

| Option | Composition | Tradeoff |
|---|---|---|
| A | Cab body and wheel cropped at right; 221B left of centre | Strong foreground frame; horse and far cab lamp are outside the crop |
| B | Cab cropped at left; 221B right of centre | Preferred: two cab lamps readable and broad actor space |
| C | Close horse/neck at right with a sliver of cab | Strongest intimacy; less of the vehicle and one lamp visible |
| Stair | Paired newels; straight flight descending away through a framed opening | Keeps the far landing/bottom unseen; cast needs final back-facing performance |

Every street option puts the carriage nearest the camera, the actors on a narrow
pavement behind it, and 221B among connected terraced houses. Doors, basement area
railings, sash windows and shared facades make this a residential row. The near cab
can conceal actors crossing behind it. It need not fit entirely within the picture.

## Research before painting

The project costume brief uses 1895, so research focused on late nineteenth-century
London rather than an undifferentiated medieval cobbled street.

- [Hansard, 13 February 1891](https://api.parliament.uk/historic-hansard/lords/1891/feb/13/london-streets)
  records several different road materials along one London omnibus route, including
  granite, wood, asphalt and macadam. Paving itself is not an anachronism.
- [Historic England, 231–243 Baker Street](https://historicengland.org.uk/listing/the-list/list-entry/1066506)
  records early nineteenth-century attached houses, stock brick, stucco ground floors,
  sash windows and fanlit doorways. It supports the terrace vocabulary, not an exact
  reconstruction of fictional 221B or of every frontage in 1895.
- [Crown Estate Paving Commission, streets manual](https://cepc.org.uk/wp-content/uploads/2025/06/CEPC-A-Special-Precinct-Streets-Manual-C.pdf)
  describes nineteenth-century rectangular stone-slab footways and York stone around
  residential terraces. Stone flags belong on the footway, with a distinct kerb and
  a different texture in the carriageway.
- [W. J. Gordon's 1889 account of street cleaning](https://www.victorianlondon.org/health/disposal.htm)
  describes London road dirt as a mixture of paving wear, horse waste and soot, becoming
  mud in rain. The artistic response is dull, dirty surfaces with selective reflections.
- [London Museum on Holmes's London](https://www.londonmuseum.org.uk/blog/sherlock-holmes-london-behind-stories/)
  distinguishes the fictional address from the real surrounding city.

No exact surface record for the fictional doorway was established. The small worn
stone setts in these options are a plausible choice, not proof that this section of
Baker Street had that material in 1895. No archival image or television artwork is
copied into the assets. Sources above were used for materials and architecture.

## Geometry and source workflow

`build-guides.py` creates four editable Blender scenes. They share the level camera,
horizon 0 and fullSize 176. The stair is rebuilt in world geometry: constant X centre,
increasing Y, decreasing Z, paired rails, horizontal tread edges. It has no lateral
run. A relatively shallow long flight allows the treads to remain visible from the
fixed level camera; it is an art construction, not a surveyed period stair.

The first street paintings gave too little height to the doors. A second edit increases
the door and ground-storey height and crops most of the upper storey. Both source
versions are retained. Painting still shifts thresholds and footways from the guide:
`guides/painted-fit.json` records the final proposed bands. Do not copy the initial
Blender walking polygons into the engine without this painted-fit review.

`generated/*-prompt.txt` stores the exact built-in OpenAI ImageGen prompts. That is a
proprietary paint step. The remaining construction, conversion and editable source
workflow uses open-source Blender, Pixelorama and TypeScript. The native sources and
export scripts are retained so manual pixel editing can replace generated paint.

`convert.ts` uses the established 320×200 centre-sampled nearest-neighbour reduction,
fixed 64-colour weighted RGB mapping, no dithering or smoothing, and 1.2 vertical pixel
aspect for display. `build.ts` adds readable native 221B plates, extracts initial
foreground masks, exports editable Pixelorama projects and makes scale/cast proofs.
The Holmes and Watson masters are unchanged. Five final painted-band checks per option
are supplied, in addition to the Blender construction checks.

Street actor feet are around y149–164 because the painted pavement is farther away
than the interior's y176 standing line. The existing feetY/176 perspective rule still
applies. This is a framing change, not a redraw of the character proportions.

## Rebuild

From the repository root, with Blender and Pixelorama installed:

```sh
# Repeat for street-b, street-c and stair.
"$BLENDER_BIN" -b --python art/studies/room-layouts-r35/build-guides.py -- street-a
node --import tsx art/studies/room-layouts-r35/convert.ts
node --import tsx art/studies/room-layouts-r35/build.ts
PIXELORAMA_BIN="$PIXELORAMA_BIN" node --import tsx art/source/verify-study-native.ts art/studies/room-layouts-r35
pnpm art check art/studies/room-layouts-r35/street-a.art.json
pnpm art check art/studies/room-layouts-r35/street-b.art.json
pnpm art check art/studies/room-layouts-r35/street-c.art.json
pnpm art check art/studies/room-layouts-r35/stair.art.json
pnpm typecheck
```

Each option has its own manifest because the three street options are alternatives
for picture 101, not three resources to register together. No game scripts, root art
registry, walkables or hotspot coordinates are changed in this study.

After composition selection: refine the foreground alpha edges; preserve separate
clock/frame depths for the stair; create actor-free prop masters for the selected
street's lamps/horse; animate breath/flicker; finalize script approaches and actor
staging. The current foregrounds are pixel-exact duplicates over an opaque base,
not reconstructed clean plates underneath the cropped objects.
