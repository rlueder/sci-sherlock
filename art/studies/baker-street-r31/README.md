# Baker Street — camera and style preservation, r31

[Open the review](index.html). This is a review candidate for picture 101, not a
production registration. It follows [the camera brief](../../../docs/room-camera-brief.md)
and preserves r24's graphic pixel treatment after the user rejected a realistic repaint.

## Camera and staging

Blender uses the same level camera as r30: height 3.071698 m, 45 mm lens, 36 mm
sensor, shift Y -0.375, horizon 0, full-size feet at 176. Canvas 320×200, display
pixel aspect 1.2. The entrance faces the camera. The cab itself turns 40 degrees
away into the street; the camera has no yaw, pitch or roll. This allows a full-size
cab, horse and rear driver to fit without shrinking the vehicle relative to Holmes.
The source is `source/street-camera.blend`; projected construction is recorded in
`guides/perspective.json`. Five physical stand-ins satisfy the scale equation.

Image generation does not preserve every projected edge. `guides/handoff.json`
therefore records the final painted placements separately. The final five actual
Holmes proofs use feet [44,149], [290,149], [44,193], [290,193], [122,171]. Both ends
of each row have identical scale, with no x-dependent correction. The review shows
standing poses, not walking animation.

The first paintover reused too much of the old composition. A geometry-led repaint
then became too realistic and was explicitly rejected by the user. The final pass
returns to broad olive fog shapes, stepped shading, simpler cab/horse forms and the
earlier warm/cool palette. Earlier attempts are retained as rejected source history;
only `generated/street.png` supplies the exports. No production room is overwritten.

## Script and layers

The scene retains the two hansom lamps, cabby seated at the rear, horse breath,
visible hall lamp and November-night fog required by `rooms/101.yarn`. The cab is
in the road; the short entrance pavement remains at the left. The horse faces
away/right. The proposed route skirts both cab wheels before reaching [248,170].
The engineer must refit `cab.do`, arrival, hotspots and floor together; the old
[190,156] approach falls inside the new cab.

- Background: 320×200, priority -1000, no protagonists.
- Lamp and near-left railing: exact occlusion duplicates, priorities 132 and 133.
  These bases lie behind the walk band; do not force them over actors standing in front.
- Gas lamp 226: four 24×113 cels, anchor [11,112], at [99,132], 450 ms per cel.
  Only the housing/light is redrawn. No automatic prop scaling.
- Camera: `perspective: { horizon: 0, fullSize: 176 }`.
- Proposed floor/route/feature rectangles: `guides/handoff.json`.

Horse breath and carriage lamps are static painted details in this pass. Watson's
raised-collar costume variant and cast walks remain separate work. The isolated
manifest registers only picture 101 and view 226. Integration requires visual review,
then a separate production `art/art.json` commit and the engineer's room changes.

## Rebuild

```sh
/path/to/Blender -b --python art/studies/baker-street-r31/build-guides.py
node --import tsx art/studies/baker-street-r31/build.ts
pnpm art check art/studies/baker-street-r31/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/baker-street-r31
node --import tsx art/source/compress-study-gifs.ts art/studies/baker-street-r31/review
```

Blender and Pixelorama are editable open-source sources; TypeScript makes the
palette conversion, extraction, proofs and GIF. The original ImageGen paintings
and prompts are retained, so export rebuilding needs no image-generation service.
Conversion samples once to the shared 64-colour palette with binary transparency.
Native export parity verifies file delivery, not artistic approval.
