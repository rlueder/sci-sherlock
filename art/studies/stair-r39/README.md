# Furnished hallway — r39

[Review the scene, scale checks and Blender model](index.html).

R39 adds a framed street map on the back wall, a narrow walnut hall table with a
brass tray and folded letters, an umbrella stand and three coat hooks with a scarf.
The central walking corridor stays open. The plain walls, single middle railing,
steep flights and camera are inherited from r38.

## Placement before painting

`build-guides.py` adds simple reference geometry to r38's Blender model. The map
frame measures 1.50 × 1.10 m on the far wall. The table is 0.80 m wide, 0.34 m deep
and 0.80 m high, against the right hallway wall; it is partly cropped by the camera.
The map is dimmer than the foreground furnishings to keep the rear plane distinct.
The schematic map is original decorative artwork, not a sourced historical map or
an accurate navigational plan. No new story clue or interaction is implied.

Both flights retain eight steps with 0.21 m rise and 0.38 m run. The turning landing
is at -1.68 m and the lower return at -3.36 m. The entrance floor occludes most treads.
Model checks retain the shared landing, one central handrail, three enclosing walls
and five actor scale positions. Furniture placement is checked outside the walking
corridor; painted bounds are separately listed in `guides/handoff.json`.

## Saved art and editable sources

The built-in OpenAI ImageGen tool edited our r38 scene with the new Blender game
view as its scale/placement guide. Exact executed prompts are:

- `generated/stair-prompt.txt`: furnishings and map.
- `generated/map-readability-prompt.txt`: simplify the map's fine lines into forms
  that survive conversion to native pixels. The first attempt is retained as
  `generated/stair-map-first-pass.png`; `generated/stair.png` is the final master.

`convert.ts` applies the same 320×200 nearest-neighbour conversion and fixed 64-colour
palette, without smoothing or dithering. Reviews display at 960×720 with vertical
pixel aspect 1.2. The painted scene interprets, rather than exactly renders, the model.

`build.ts` exports the room and door, wall-return, wall-map and hall-furnishings
patches. All five have editable Pixelorama sources. These rectangular fixed-position
patches duplicate base pixels for editing/occlusion; they are not movable cutouts and
hiding them does not remove the corresponding painting from the base. No animation
or interactions are supplied. The map remains behind actors; furniture uses a candidate
priority of 158. The cast preview uses existing masters only to check room scale.

Blender, Pixelorama and the TypeScript pipeline are open source; the ImageGen painting
step is proprietary. Prompts and intermediate/final masters are retained for learning.

## Reproduce

```sh
"$BLENDER_BIN" -b --python art/studies/stair-r39/build-guides.py
node --import tsx art/studies/stair-r39/convert.ts
node --import tsx art/studies/stair-r39/build.ts
PIXELORAMA_BIN="$PIXELORAMA_BIN" node --import tsx art/source/verify-study-native.ts art/studies/stair-r39
pnpm art check art/studies/stair-r39/art.json
pnpm typecheck
```

These commands use the saved painting rather than requesting a new generation.
`native-export-check.json` records actual Pixelorama export parity.

## Handoff

This is a picture-103 review candidate; production registration is unchanged.
The upper landing remains the only walkable surface. `guides/handoff.json` records
painted decorative bounds, candidate priorities, existing hotspots and the outstanding
script mismatch: the room still describes a clock pendulum where the painting now has
a plain entrance door. The engineer should resolve that line and hotspot on integration.
