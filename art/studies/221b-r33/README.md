# 221B in three planes — r33

[Open the animated review](index.html). This is an art study for picture 100,
following the [room-planes brief](../../../docs/room-planes-brief.md).
It does not register itself in the running game.

The composition has a foreground sitting room, a broad walnut opening, and a
chemistry room beyond. Watson, the fireplace, the landing entrance and the cropped
writing desk belong to the front room. The chemistry bench, shelves and blue rear
window sit farther back. The user's television photograph informed the overlapping
planes only; it is not included in the repository or used as painted artwork.

The user requested dimmer distant spaces after seeing the first paint pass.
`generated/depth-lighting.png` supplies that correction. Only the measured back-room
polygon and the inside of the landing doorway are imported from it. All front-room
pixels outside those regions are locked to the first painting. The palette conversion
remains the same 64 colours; dark colour clusters retain hard pixel edges.

## Camera and scale

The camera is unchanged: level and frontal, 45 mm lens, 36 mm sensor, height
3.071698 m, shift Y -0.375. Native output is 320×200 with 1.2 vertical pixel aspect.
Perspective is `horizon: 0, fullSize: 176`. Scale depends only on feet Y.

`build-guides.py` constructs the three planes in Blender before painting.
`source/221b-planes.blend` retains that scene and six hidden stand-ins. Their projected
heights are checked against `106 * feetY / 176` with less than .001 px error.
The review then places the actual unchanged Holmes master at those six positions:

| Plane | Feet | Scale |
|---|---|---|
| Front back-left | [120,160] | 91% |
| Front back-right | [289,160] | 91% |
| Front near-left | [105,195] | 111% |
| Front near-right | [297,195] | 111% |
| Front centre | [205,176] | 100% |
| Back-room proof only | [180,125] | 71% |

Painting shifted the frame, chair and door higher than the initial blockout. This
is documented rather than claiming pixel-exact geometry: `perspective.json` records
construction; `painted-fit.json` records final landmarks under the same camera.
The painted opening's foot is y138; the chair is fitted at y146, with the existing
64px seated Watson silhouette. The traversable band remains y160–195. The desk is
outside the polygon. No actor walks in the back room in this teaser.

## Layers and props

| Asset | Contract |
|---|---|
| `export/background.png` | Opaque 320×200 base, priority -1000; contains the exposed landing |
| `export/opening.png` | Walnut transom, folded panels and posts; priority 138 |
| `export/chair.png` | Chair occlusion duplicate; priority 146 |
| `export/foreground-desk.png` | Near desk occlusion duplicate; priority 199 |
| Fire 222 | Six 40×40 cels, anchor [20,39], at [35,133], 120 ms per cel |
| Lens 223 | 12×8, anchor [4,3], at [48,74]; remove when taken |
| Door 225 | Ten 64×120 cels, anchor [57,113], at [315,137]; 0–175° |
| Watson 205 | Five 72×120 cels, anchor [36,113], at [93,146] |
| Fog 280 (proposed) | Twelve 36×50 cels, anchor [0,0], at [201,26], priority 110 |
| Lamp 281 (proposed) | Six 8×15 cels, anchor [0,0], at [207,65], priority 132 |
| Steam 282 (proposed) | Twelve 16×20 cels, anchor [0,0], at [156,55], priority 132 |

Occlusion layers duplicate exact base pixels. The base stays opaque, while these
layers restore the parts that should cover actors behind them. The back/front
occlusion comparison demonstrates this at the opening's right post. The chair
and seated Watson share a floor priority; draw the chair before Watson on ties.
Treat all listed props as already fitted: do not apply actor scaling again.

The door is a real 45mm solid leaf rendered in Blender with a fixed right hinge and
holdout jambs. The native shut painting textures its front. Cel 0 reconstructs the
room exactly, cel 9 is fully clear. Use 120 ms between cels (1080 ms opening), hold
cel 9, and reverse to close. The opening frames stay static.

Watson's five cels are pixel-identical to r30: no new face, palette, body or gait.
Loop 0 is the neutral; loop 1 is neutral/pinch/lift/cross/settle. Play action cels
1–4 at 200 ms each then return to neutral, with 6–10 seconds of reading between
turns. He advances the paper from screen-left to screen-right. Timing and source
registration are in `guides/page-turn.json`.

`fire.ts` reuses r30's six painted flame sources, fits the coal baseline to this
hearth and restores fixed grate pixels in every cel. Back-room effects are small
native-pixel loops built in TypeScript, with no full-room glow or brightening:
fog excludes sash bars, the lamp changes only its warm highlight colours, steam
uses a few muted clusters. Use 240 ms per atmosphere cel. The combined review uses
100 ms samples for readability; the handoff timings are authoritative.

## Engine handoff

`guides/handoff.json` specifies the walk polygon, arrival [292,163], hero [205,176],
hotspots, view placements, layers and timing. IDs 280–282 are proposals in this
isolated manifest; confirm they are free before changing production registration.
The rear bench/window remain clickable scenery; there is no route through the
opening. Validate access to the lens from the front band, door arrivals, desk
occlusion and horizontal walking with the game side before registration.

The room is a visual-review candidate. Scene composition and masks need the user's
review. The constant-scale GIF translates the standing Holmes master solely to
check scaling; it is not a new walking animation.

## Rebuild and edit

```sh
/path/to/Blender -b --python art/studies/221b-r33/build-guides.py
node --import tsx art/studies/221b-r33/convert.ts
/path/to/Blender -b --python art/studies/221b-r33/render-door.py
node --import tsx art/studies/221b-r33/build.ts
node --import tsx art/source/compress-study-gifs.ts art/studies/221b-r33/review
pnpm art check art/studies/221b-r33/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/221b-r33
pnpm typecheck
```

`painted-fit.json` stores measured paint coordinates and recovered door dimensions;
it is versioned input to the door renderer. Edit it when changing the painting.
Eleven Pixelorama projects include the layered room and every animated prop.
Build scripts check lighting-mask invariance, closed-door reconstruction, full
opening, fixed hinge, seated-master identity and six projected scale calculations.
Native validation exports the actual Pixelorama projects and compares decoded pixels.

The original paintings were produced with the built-in ImageGen tool; exact prompts
and outputs are in `generated/`. That generation step is proprietary. The stored
masters can be edited and rebuilt with Blender, Pixelorama, TypeScript and ffmpeg
without a generation service. Save paint edits as new masters before rebuilding.

## Pixel-style conversion

The review already applies the approved workshop conversion: nearest-neighbour
sampling to 320×200, mapping to the unchanged 64-colour palette, and 960×720
aspect-corrected enlargement without smoothing or added dithering.
`guides/style-conversion.json` records dimensions and colour counts for each source.
The high-resolution images under `generated/` are source paintings; use the
filtered PNGs under `export/` or the enlarged stills under `review/` to judge the
in-game style. Reapplying this deterministic pass leaves the final pixels unchanged.
