# Enclosed steep stair — r38

[Review the painting and Blender guides](index.html).

The user asked to retain only the middle railing, replace all side/back wooden
structures with plain walls, then steepen the flights to communicate a deeper drop.
R37 remains available for comparison. This study is not registered in the game.

## Geometry before paint

`build-guides.py` creates a connected U-return stair inside a three-wall box. The
left flight descends away from the entrance; the right return comes back beneath it.
Both flights are 0.95 m wide, with eight steps of 0.21 m rise and 0.38 m run. Their
pitch is 28.9°, up from 21.5°. The supported turning landing is 1 m deep and now
1.68 m below the entrance; the second flight ends 3.36 m below it.

Only the shared central guard remains. The outer rails, outer newels, back guard,
wall panelling and timber opening frame are removed. The plain walls meet the tread
edges and turning landing. Stringers and landing supports remain underneath the
stairs. The separate entrance door retains its ordinary wooden jamb.

The game camera, upper floor and actor scale remain fixed. At this steeper pitch,
the entrance floor hides almost all tread surfaces. The descending middle rail,
low landing strip and dark shaft communicate depth; exposing every tread would
contradict the modeled camera. The cutaway shows the full route, including the lower
return that cannot be seen from the game camera.

- `guides/stair-blockout.png`: actual game-camera visibility.
- `guides/stair-walls.png`: enclosure inspection with the near/right side hidden.
- `guides/stair-cutaway.png`: shell removed to inspect the full assembly.
- `guides/stair-plan.png`: both flights and turning route from above.
- `guides/flight-layout.json`: dimensions, shared landing and railing-count checks.
- `source/stair-planes.blend`: editable model with all three cameras.

The model saves in the game-camera state. The shell is hidden only while rendering
inspection views. Five character scale checks retain horizon 0 and fullSize 176.

## Paint and conversion

The built-in OpenAI ImageGen tool edited our r37 artwork. Executed prompt sequence:

1. `generated/stair-prompt.txt`: remove outer/back rails and replace framing with plaster.
2. `generated/header-cleanup-prompt.txt`: remove the remaining wooden header.
3. `generated/steeper-stair-prompt.txt`: initial steepening attempt, rejected because it
   invented fanned tread edges. Its output is labelled `steepening-rejected-fanned-treads.png`.
4. `generated/steep-occlusion-prompt.txt`: final edit from the accepted plain-wall image,
   using the steeper game-camera guide to constrain visibility and parallel tread edges.

`generated/stair-before-steepening.png` is the accepted plain-wall intermediate;
`generated/stair.png` is the final selected master. Paint interprets the physical
model; it is not a pixel-exact Blender render.

`convert.ts` uses the established nearest-neighbour centre sampling and fixed
64-colour mapping, without smoothing or dithering, at 320×200. The 960×720 review
uses vertical pixel aspect 1.2. `build.ts` exports the base, door and plain wall-return
occlusion layers, three editable Pixelorama files, scale proofs and handoff notes.
The layers duplicate the corresponding base pixels and reassemble identically.

Blender, Pixelorama and the TypeScript export pipeline are open source. The optional
ImageGen painting step is proprietary. Only original project art is used as style input.

## Reproduce and verify

```sh
"$BLENDER_BIN" -b --python art/studies/stair-r38/build-guides.py
node --import tsx art/studies/stair-r38/convert.ts
node --import tsx art/studies/stair-r38/build.ts
PIXELORAMA_BIN="$PIXELORAMA_BIN" node --import tsx art/source/verify-study-native.ts art/studies/stair-r38
pnpm art check art/studies/stair-r38/art.json
pnpm typecheck
```

These commands use the saved generated masters and do not regenerate the paintings.
`native-export-check.json` records the actual Pixelorama export comparison.

## Handoff

Picture 103 remains a review candidate. Only the upper landing is walkable. Proposed
hotspots and occlusion priorities are in `guides/handoff.json`; the visible stair is
not a playable route yet. The cast preview uses existing standing masters for scale.
The room script still describes a visible clock pendulum, whereas this composition
has the entrance door. The engineer should revise `caseClock.look` and its hotspot
when integrating the accepted room. No runtime text or registration changes here.
