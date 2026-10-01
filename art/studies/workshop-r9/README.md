# Workshop r9: cabinet perspective and room atmosphere

Open `/art/studies/workshop-r9/` on the local art server. Each effect can be switched
off independently. Use **Original drawers** and **Cabinet guides** for the furniture
comparison, and **Show mouse** to inspect any of three routes without waiting.
The revised r10 idles and master-v2 puff are available in the same room preview.
Walking remains deferred. No engine code, room YAML or Yarn changed.

## Cabinet beneath the window

The user clarified that the affected furniture was the cabinet under the window,
not the large foreground desk. Only its drawer bank changes. The foreground layer
is reused byte for byte from r5, and the tabletop, books, cabinet sides and room
composition remain outside the correction mask. Original chair-arm pixels in front
of the drawers are restored after the plane correction.

All six drawers now share a single projective plane. Horizontal rows converge at
native [300,72], with vertical dividers. This is an artist-chosen local perspective
fit, not a claimed whole-room camera calibration. Each original drawer's continuous
wood texture is mapped into the corrected grid with nearest sampling. Old knobs
are patched locally and all six knobs are placed on the new plane. The builder
asserts that every background change is inside the cabinet mask.

`cabinet-perspective.svg` is the editable vector construction overlay;
`export/cabinet-guides.png` is the native-pixel overlay used by the preview.
`source/cabinet.pxo` contains the locked original room and the separate correction.
`review/cabinet-comparison.png` shows original on the left, revised on the right.

## Motion and timing

| Effect | Authoring and behavior | Editable source |
|---|---|---|
| Rain | Forty-eight 320×200 transparent cels at 8 fps (16 native pixels/second). Sparse short streaks appear only on a mask of window glass colours, behind mullions, books and curtain | `source/rain.pxo` |
| Sky | Sixteen palette states, one every four seconds: clear → overcast → clear over 64 seconds. Glass-only, shared palette, no blended colours | `source/sky.pxo` |
| Lamp | Four light-cluster variations, with an uneven hold sequence at 8 fps. Metal housing stays pixel-identical; no full-screen brightness pulse | `source/lamp.pxo` |
| Pendulum | Twenty-four cels at 12 fps, a two-second cycle. Original rod/bob pixels rotate about [35,57] in the 64×140 clock cel, ±0.065 radians. Rotation accounts for 1:1.2 display pixels | `source/pendulum.pxo` |
| Mouse | Four directional sets of four 20×10 cels at 16 fps, three paths lasting 1.8–2.3 seconds. One mouse at a time, then 18–35 seconds quiet. The next automatic route differs from the previous one | `source/mouse*.pxo` |

The pendulum's fixed case and the lamp's fixed housing are locked linked layers;
their moving pixels occupy a separate layer. Clock hands and face remain unchanged.
Rain's glass-only mask and lamp's unchanged housing are checked by the builder.
The mouse uses a small muted palette and furniture occlusion, with cabinet, clock
and workbench starting points. Its first preview visit happens after four seconds;
later visits use the longer interval. Pause freezes the preview's animation clock.

**Story integration:** the user requested pendulum motion after the original teaser
specified stopped clocks. This study implements that request as a switchable visual
effect. Resolve when it is active with the story/engine session before publishing
it into gameplay. The art session does not silently rewrite the stopped-clock clue.

## Files, reproduction and verification

```sh
pnpm exec tsx art/studies/workshop-r9/build.ts
pnpm exec tsx art/studies/workshop-r9/check-routes.ts
pnpm typecheck
pnpm art check art/studies/workshop-r9/art.json
PIXELORAMA_BIN=/path/to/Pixelorama pnpm exec tsx art/studies/workshop-r9/verify-native.ts
```

The build writes only this study. It regenerates `.pxo` files, so preserve any manual
edits before rebuilding and use native export for an edited source. Pixelorama 1.2.3
is the verified pin. Nine actual native projects export 109 images, compared pixel
for pixel with the corresponding outputs. The manifest checks 111 PNGs using the
existing shared 64-colour palette and binary transparency.

- `animation.json`: drawer geometry, timing, route points, anchors, palette and
  story caveat. The preview uses these data for mouse routes and lamp timing.
- `art.json`: isolated review resources 260 rain, 261 lamp, 262 pendulum 263 mouse-right, 264 sky, 265 mouse-away-right, 266 mouse-left and 267 mouse-away-left.
  These IDs are study-local proposals, not silent production reservations. The room
  has a separate mouse-occlusion layer, proposed priority 150; engine sorting needs
  explicit review when integrating a mouse actor.
- `review/ambience.gif`: ambient room motion. `review/mouse-route-*.gif`: short
  repeatable demonstrations of each easter-egg path; actual preview visits are sparse.
- `generated/mouse.png`, `mouse-away.png` and their `*-prompt.txt` files: original four-pose mouse sheet and
  exact prompt, generated with the built-in proprietary OpenAI ImageGen tool.
  All further conversion, perspective construction, motion, editing and validation
  use open-source project tools and Pixelorama. No generation call is needed to rebuild.

The room, lamp, clock and cabinet texture come from the project's existing approved
art and editable sources. Rain is a deterministic pixel effect. Technical checks
establish palette, masks, export fidelity and stationary geometry; visual review
still determines whether the drawer drawing, flicker intensity and motion feel right.

## Corrections after motion review

The original rain mask included the blue-lit interior jamb. It now ends at the actual
glass edge, explicitly excludes mullions, and never reaches native x=58. Rain speed
drops from 72 to 16 pixels/second. **Weather preview** selects clear, gathering clouds,
overcast or clearing without waiting for the slow cycle. The weather GIF accelerates
this cycle for review; the live preview uses the full 64 seconds.

The old pendulum polygon omitted several left-edge gold pixels. The clean plate now
removes the full bob footprint and rod before the moving cel is composited. The case
and face remain fixed. Native project FPS now matches each exported effect's timing.

The cabinet and clock mouse routes now cross the floor before turning away into the
bench shadow. Dedicated rear three-quarter cels handle those turns; left/right sets
are exported explicitly. The under-workbench path retains its accepted points and
sideways cels. The cabinet mask no longer blankets a large triangle of open floor,
and leg masks follow the narrower furniture edges. Endpoint checks assert zero
visible mouse pixels at every entrance/exit; `review/routes-contact.png` shows the
paths at 0/20/40/60/80/100 percent. The **Mouse route** scrubber and **Show occlusion**
overlay let contributors inspect crossings in the actual room.

### Clock route angle follow-up

The first directional pass still sent a sideways mouse downhill from the clock,
then used a shallow rear-quarter drawing for a 62° retreat. Endpoint occlusion
checks passed, but did not detect this drawing/path mismatch. The corrected points
are `[260,149] → [244,149] → [230,149] → [217,138]`: the two left-facing stretches
are horizontal, and the rear-quarter stretch is 45.4° after applying the 1:1.2
display pixel aspect. The direction change is beside the bench leg. Cabinet and
under-workbench paths are unchanged. `review/clock-route-closeup.gif` makes this
small movement easier to judge; no sprite scaling or rotation is used in playback.
