# Baker Street: selected right-cab composition — r41

[Animated review](index.html).

The user selected r35 option A, with the cab on the right, and requested a narrower
pavement, glow in every fanlight above the doors, a subtle driver idle, pipe smoke and lantern
flicker. This study implements those art changes. Other r35 variants remain history.

## Static reference and camera

`generated/street.png` is the revised static master, edited with built-in OpenAI
ImageGen from our r35 `street-a.png`. `generated/street-prompt.txt` records the exact
edit. All three arched fanlights glow, retaining dark glazing bars. The pavement is
narrower and the wet road extends to its new kerb. Houses, cab and camera are retained.

`convert.ts` centre-samples to 320×200 and maps to the existing 64-colour palette,
without smoothing or dithering. Reviews use vertical pixel aspect 1.2. The native
221B plaque is added reproducibly by `build.ts`, below the open doorway's fanlight.

`build-guides.py` records the new facade, pavement and foreground planes in Blender.
This is a measured game-layout reference, not a surveyed street or construction plan.
The painted pavement now lies approximately between native Y134 and Y142. The safe
candidate walking strip is Y136–142, with heroes at Y139. Existing horizon 0/fullSize
176 scaling is retained; Holmes and Watson use unchanged masters. Check door approach
and traversal with the revised room coordinates when integrating this narrow strip.
Period references remain in [r35's research notes](../room-layouts-r35/README.md).

## Driver idle

`generated/driver-nod.png` is an ImageGen edit of the static master, using the exact
`generated/driver-nod-prompt.txt`. The connected head, neck and collar were rerendered
for a small downward nod. No detached limbs or procedural body distortion is used.
Only the union region around the head/neck is extracted; the rest of the body, cab,
background and colour palette remain the static master. This is a restrained two-pose
idle study, not a full acting sequence.

Candidate view **284** has two cels, **39×29**, top-left anchor [0,0], placed at
**[265,28]**, priority 199. The 64-tick timeline holds the resting pose for most of
its **10.24 seconds**, briefly nods, then returns. Each tick is 160 ms. Exact timing
is in `guides/handoff.json`. A long first hold is intentional.

## Cab lantern

Candidate view **285** has five cels, **36×40**, top-left anchor [0,0], placed at
**[269,72]**, priority 199. Its irregular 16-tick rhythm repeats every **2.56 seconds**,
independently of the driver. Native palette changes affect only warm glass/flame and
nearby illuminated wood. Tiny flame changes stay within the glass; the housing does
not move. Fanlight illumination is static.

Both animations are opaque local replacement patches. Draw them **after the cab
foreground layer** and replace their previous cel at the same coordinates to clear
old pixels. Do not additively blend them. Cel 0 uses the static base. Assertions ensure
that no pixels outside the driver, lamp and smoke regions change in the combined preview.

The five Pixelorama projects are `room.pxo`, `foreground.pxo`, `driver.pxo` and
`cab-lamp.pxo` and `pipe-smoke.pxo`. The animated projects contain distinct cels; the JSON timelines, not
a simple sequential loop, define final playback. Eighteen exported PNGs are compared with
actual Pixelorama exports by `native-export-check.json`. GIF compression checks decoded
pixel identity. Preview actor poses are scale proofs only.

## Pipe smoke

Candidate view **286** supplies nine **32×30** cels, top-left anchor [0,0], at
**[288,22]**, priority 199. Cel 0 is transparent. Eight palette-native curl stages
rise from the pipe bowl, drift to the right, expand and break apart. Cool grey
highlights keep the puff visible against the night sky. This is deterministic native
pixel animation; no new painting or body deformation is involved.

The smoke shares the 160 ms tick and 64-entry driver timeline. Two short puffs occur
between nods, with empty holds. `guides/handoff.json` contains the exact sequence.
Draw it after the driver and cab foreground, and redraw the underlying scene each
frame so transparent cels clear previous smoke. `review/pipe-smoke.gif` shows the
combined pipe and driver detail. The static references remain unchanged.

## Integration

Root `art/art.json`, YAML, Yarn and runtime code are unchanged. This candidate picture
101 replaces the earlier r31 room only after review/integration. `guides/handoff.json`
contains the doorway, walking polygon, actor positions, patch anchors, priorities and
playback arrays. Confirm candidate IDs 284–286 when registering. The current runtime
view-226 street lamp and its old position do not match this cab lantern; replace/refit
that prop rather than overlaying it at the old location. No new dialogue is implied.

Blender, Pixelorama and the TypeScript conversion/export tools are open source.
ImageGen is the proprietary painting/pose step; exact prompts and static masters are
retained so the source and animation construction are inspectable.

## Reproduce

```sh
"$BLENDER_BIN" -b --python art/studies/baker-street-r41/build-guides.py
node --import tsx art/studies/baker-street-r41/convert.ts
node --import tsx art/studies/baker-street-r41/build.ts
node --import tsx art/source/compress-study-gifs.ts art/studies/baker-street-r41/review
PIXELORAMA_BIN="$PIXELORAMA_BIN" node --import tsx art/source/verify-study-native.ts art/studies/baker-street-r41
pnpm art check art/studies/baker-street-r41/art.json
pnpm typecheck
```

The saved generated masters are inputs; these commands do not regenerate them.
