# Connected timber return stair — r36

[Review model, plan and painting](index.html).

The user rejected the distorted clock and overly broad r35 flight, then rejected
r36's first offset-flight painting because the connection was not logical. The
current version rebuilds a complete U-return stair in Blender before repainting.
`generated/stair-first-pass.png` and `source/offset-layout-rejected.py` are retained
as rejected process evidence, not proposed assets. `return-flight-prompt.txt` records
an intermediate prompt that was prepared but not executed; the final executed edit
is `verified-model-prompt.txt`.

## Construction

The new `build-guides.py` builds actual surfaces, not merely screen rectangles:

- Upper timber landing ending flush with the first flight.
- Left flight: eight closed-riser steps, each 0.38 m run and 0.15 m rise, width 0.95 m.
- Lower turning landing: 1 m deep, spanning both flights at -1.2 m, with joists/supports.
- Right return: eight steps in the opposite direction, ending at -2.4 m.
- Stringers, individual balusters, continuous inclined handrails and newels.
- Guards along the back and outer sides of the turning landing; neither stair mouth
  has a transverse rail blocking entry.
- Removable architectural shell, upper-floor slab and plain planar entrance door.

The two flights' meeting points share the turning landing's exact Y and Z coordinates.
`guides/flight-layout.json` records every tread, the continuous route and assertions.
The cyan route passes along both stair centres and across the full-depth landing.
No route segment needs to jump between platforms or pass through a guard.

`guides/stair-cutaway.png` removes the shell and shows the entire assembly, including
supports. `guides/stair-plan.png` shows the route from above. `stair-blockout.png`
restores the room shell and the actual game camera. The near upper slab hides most
of the lower flight: that occlusion is intentional geometry, not an invented visible
basement floor. The bottom remains unseen from the game camera.

The editable `.blend` contains the game, cutaway and top-plan cameras. The script
performs shell/route visibility changes while rendering the inspection views. The
saved file opens in the game state, with route and actor stand-ins hidden.

## Camera and paint

Level 45 mm camera, 36 mm sensor, height 3.071698 m, shift Y -0.375; native 320×200
with vertical pixel aspect 1.2. Existing `horizon: 0, fullSize: 176` scale is retained.
Five actor-height checks use the same projection.

Built-in OpenAI ImageGen repaints the game-camera construction with the project's
own previous stair as material/style reference, plus the cutaway and plan as geometric
references. Exact executed prompts and generated masters are versioned. The paint is
an interpretation of the verified geometry, not a pixel-exact Blender render.

`convert.ts` applies the established centre-sampled nearest-neighbour reduction and
fixed 64-colour weighted RGB mapping, without smoothing or dithering. `build.ts`
exports the base, duplicate door/frame occlusion layers, native Pixelorama projects,
actor proofs and candidate handoff. Only original project art is used as style input.
ImageGen is proprietary; Blender, Pixelorama and TypeScript form the open-source
construction/edit/export workflow.

## Reproduce

```sh
"$BLENDER_BIN" -b --python art/studies/stair-r36/build-guides.py
node --import tsx art/studies/stair-r36/convert.ts
node --import tsx art/studies/stair-r36/build.ts
PIXELORAMA_BIN="$PIXELORAMA_BIN" node --import tsx art/source/verify-study-native.ts art/studies/stair-r36
pnpm art check art/studies/stair-r36/art.json
pnpm typecheck
```

The retained generated master is used as input; these commands do not regenerate it.

## Handoff

The room is a review candidate for picture 103. Production is unchanged. Only the
upper landing is walkable. Use `guides/handoff.json` for proposed hotspots, layers,
actor placements and the story mismatch: the visible entrance is now a plain door,
with the clock on the workshop side. `rooms/103.yarn` still mentions its pendulum
being visible here, so the engineer should revise `caseClock.look` and its hotspot
when this layout is accepted. No gameplay text is silently changed in an art study.

The cast preview uses existing side-facing standing masters to verify scale; it does
not claim completed back-facing performances. Baker Street variants and other rooms
are unchanged by this study.
