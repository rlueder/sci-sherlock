# Clock r12 — walnut surfaces and concealed stair

This review pass finishes the exposed surfaces of the r4 perspective construction.
The same Blender projection supplies all eight angles; this pass changes native
surface drawings and the concealed opening, not the camera or hinge.

[Open the local review](http://127.0.0.1:5176/art/studies/clock-r12/).

- Fixed native UV plates provide walnut grain, inset fields, bevels and rails.
- The reverse of the ornamental front is wood and joinery, never a reversed dial.
- The threshold drops into darkness. Small tread edges sit below its lip, avoiding
  the earlier ascending-looking triangle of steps.
- The room uses r9's corrected cabinet, master v2 Holmes, and separate lamp/clock.
- All four visible dials use explicit 3:17 angles. Small handset clusters are restored
  locally; rims, numerals, clock silhouette and the wider room remain intact.

## Sources and editable files

`textures.ts` draws the native indexed plates; PNG plates and a reverse-front
Pixelorama file are in `source/`. `clock.pxo` contains the eight review
cels. `export-pixels.ts` rasterizes the saved `projection.json` with
perspective-correct nearest sampling and a depth buffer.

The editable camera and rigid volumes remain in
[the r4 Blender source](../clock-perspective-r4/clock-guide.blend); its
[build script](../clock-perspective-r4/build-guide.py) records their construction.
This pass uses that saved projection without changing geometry. It introduces no
new generated imagery. Room/front provenance remains in the r3/r4/v6 sources.

## Reproduce

```sh
pnpm exec tsx art/studies/clock-r12/export-pixels.ts
pnpm art check art/studies/clock-r12/art.json
PIXELORAMA_BIN=/path/to/Pixelorama pnpm exec tsx art/studies/clock-r12/verify-native.ts
pnpm exec tsx art/studies/clock-r12/compress-gifs.ts
```

`report.json` records hinge drift, camera fit, cel bounds and dial endpoints.
A zero closed-reconstruction difference means this pass reconstructs its own corrected
closed room; it does **not** mean no pixels changed from v6. Pixelorama verification
compares each exported RGBA cel independently.

## Handoff limits

Review only; the gameplay resources remain separate. View 221 keeps an 88×168
canvas, anchor [60,150], placed at world [292,150] (top-left [232,0]).
The opening is a separate background surface covered by the closed clock.

The [r11 contact gesture](../holmes-r11/README.md) still needs choreography
against the case travel. The r9 moving pendulum uses its own full-case images;
it must adopt this dial correction when the production asset set is consolidated.
The standalone stair room and threshold transition are later deliverables.
