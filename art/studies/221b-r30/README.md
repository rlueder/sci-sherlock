# 221B: camera-first repaint and texture revision — r30

[Open the review](index.html). This implements the art side of
[the room camera brief](../../../docs/room-camera-brief.md) for picture 100.
It is a review study, not production registration. R13 remains in the game.

The camera is level, front-facing, without scene yaw or roll, at 3.071698 m above
floor. A 45 mm lens, 36 mm sensor and vertical shift -0.375 put the vanishing point
at native [160,0]. The 320×200 canvas retains 1.2 vertical pixel aspect. Actor scale
is exclusively `feetY / 176`; no per-column correction is used in any r30 proof.
Blender's Euler X=90° orients its local -Z along world +Y while Z remains up; this
is a level camera, not 90° downward pitch.

## Geometry, painting and the user's texture correction

`build-guides.py` constructs the camera, floor and room furniture before painting.
The five 1.85 m stand-ins project to the expected heights with less than .001 pixel
numerical error. `guides/blockout.png` is the actual Blender render supplied as the
paintover geometry reference, alongside the approved workshop for pixel treatment.

The first generated room reintroduced an angled window wall. A targeted edit
restored a frontal sash window, cabinet and wall. The user then preferred r13's
more interesting pixel texture to r30's smooth surfaces. A further material-only
pass used r13 as the texture reference: broken olive colours, mottled walnut,
velvet, worn boards and rug colour clusters. The smoother pass remains under
`generated/room-before-texture.png` for comparison. Final `generated/room.png`
is the texture-revised source. It is sampled once to the original 64-colour palette;
no new global colour reduction, noise overlay or alternate palette is introduced.

The painting is not a pixel-exact Blender render. Keep that distinction visible:
`perspective.json` records the initial geometry and camera; `painted-fit.json`
records the final door rectangle and seated anatomical guide under that same
camera. `fit-props.py` recovers the door's physical plane from its painted bounds
and records the hinge. `render-door.py` now renders the actual ten cels from a 45mm-thick leaf in Blender Cycles, using the native door painting as its front-face texture. Four camera-ray holdout meshes represent the jamb/lintel/threshold and keep a receding door behind the frame. Cel 0 retains the exact painted extraction; subsequent cels use the Blender renders, converted to the shared palette. The earlier flat-triangle software projection is retired. The camera and actor size rule never move to fit
an individual prop. The door's fitted width/height are about .93 m / 2.26 m.
Other hotspot rectangles are measured from the painting, not copied blindly from
the blockout. Final artistic scale/texture fit still needs visual review.

## Deliverables

| Resource | Assets | Placement / contract |
|---|---|---|
| Picture 100 | `export/background.png` | 320×200, priority -1000; contains the landing, no moving leaf, fire, lens or people |
| Foreground | `export/foreground-desk.png` | Exact occlusion duplicate, priority 199; desk feet fall below the crop; priority is clamped to the engine maximum |
| Fire 222 | `export/fire-0..5.png` | 40×40, anchor [20,39], at [158,141]; fixed grate stays in front of flames |
| Mantel lens 223 | `export/mantel-lens.png` | 12×8, anchor [4,3], at [160,77]; hide it when taken |
| Door 225 | `export/door-0..9.png` | 64×120, anchor [57,113], at [313,137]; angles 0/20/40/60/80/100/120/140/160/175°, opens away into landing |
| Seated Watson 205 | `export/watson-seated.png`, `watson-page-0..4.png` | 72×120, anchor [36,113], at [94,146]; body height 64px, pre-fitted to chair |

The empty-room review includes the closed leaf. It is not the runtime background.
The background plus cel 0 reconstructs the source painting pixel-for-pixel. All
ten door cels fit their shared canvas and use the same 3D hinge. The landing was
painted separately; only its measured [263,36,313,137] patch is imported, preserving
all room pixels outside the opening. The fire composites from the clean hearth
on every cel so no previous flame is left behind.

Watson is a complete coherent redraw from the pinned r13 seated character, not
replacement limbs attached to a standing sprite. After the first seated fit was rejected for a turned pelvis and low placement, the complete figure was redrawn squarely front-on, with level knees and evenly planted feet. It is placed seven pixels higher and centred farther back on the cushion,
retaining brown suit, oxblood waistcoat, moustache and watch chain. His new neutral
master is hashed in the handoff. The joint guide checks seated crown, pelvis, bent
knees, feet and hands. The page turn now uses four separately rendered action keys registered over this
master. Only the documented forearm/hand/newspaper mask changes; all pixels outside
it are checked against the master. The source sheet retains the complete coherent
poses, so anatomy is redrawn before animation rather than constructed from added limbs. Do not apply automatic actor
scaling to these pre-fitted seated/prop assets a second time.

Holmes is the unchanged master v2, scaled only by the floor rule. The five review
placements are [120,145], [280,145], [120,195], [280,195], [200,170]. The left and right
ends of each row are identical in scale. The GIF named `constant-scale` moves a
standing sprite at y176 to isolate scaling: it is deliberately not a walking demo.

## Engine handoff

Use [guides/handoff.json](guides/handoff.json) for the proposed polygon, arrival,
prop positions, hotspots and manifest references. Replace the current per-column
perspective correction with `perspective: { horizon: 0, fullSize: 176 }` when
integrating this room. Suggested door arrival is [285,148], hero [200,176]. Keep
walkable feet off the foreground desk: the polygon's left edge stays at x104 or
farther right. Check door arrival for Hudson/Toby and exit for Holmes in play.

The isolated `art.json` delivers picture 100 and views 205/222/223/225 only. It does
not replace cast walking sprites, portraits, interface resources or room scripts.
Update production registration in its own commit after visual review, alongside
the game side's floor/hotspot changes. Check actor/foreground ordering, lens pickup,
closed/open door transitions and seated Watson in actual rendered game frames.
Baker Street's exterior camera revision is the next room task, not part of r30.

## Reproduce and learn

The built-in ImageGen tool created the source painting, the geometry correction,
texture edit, landing and complete seated Watson. All exact prompts and source
outputs are stored in `generated/`. Image generation itself is proprietary; stored
masters plus the following open-source pipeline need no generation API to rebuild.

```sh
/path/to/Blender -b --python art/studies/221b-r30/build-guides.py
/path/to/Blender -b --python art/studies/221b-r30/fit-props.py
node --import tsx art/studies/221b-r30/convert.ts
/path/to/Blender -b --python art/studies/221b-r30/render-door.py
node --import tsx art/studies/221b-r30/build.ts
node --import tsx art/source/compress-study-gifs.ts art/studies/221b-r30/review
pnpm art check art/studies/221b-r30/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/221b-r30
pnpm typecheck
```

Blender 4.5.14 LTS, Pixelorama 1.2.3, TypeScript and ffmpeg are the local workflow.
Six editable Pixelorama projects cover the room layers, desk foreground, door,
fire, lens and Watson. Rebuilds regenerate these; save intentional paint edits as
new source masters before rebuilding. Native export parity validates delivery,
not artistic approval. No third-party game artwork is included.

The revised door source is `source/door-solid.blend`, with packed native texture, keyed hinge rotation, 45mm depth and frame holdouts. `guides/door-solid.json` records every angle and projected hinge endpoint. Visible opening poses must differ; late cels can match once the leaf is fully hidden behind the right jamb. Cel 9 must be entirely transparent. The contact sheet is available in the review. The previous seated pose and its source are retained solely for comparison.

## Animation timing and handoff

View 205 loop 0 cel 0 is the neutral seated master. Loop 1 has five cels:
0 neutral, 1 pinch, 2 lift, 3 cross, 4 settle. To trigger a page turn, play
1–4 at 200 ms each, then explicitly return to loop 0/cel 0. The review holds
neutral for 2.8 seconds and rests another .4 seconds afterward; use a less
frequent 6–10 second reading pause in play. Do not cycle loop 1 continuously
at walking speed. `guides/page-turn.json` specifies the timeline, source-cell
registration and motion mask. Head and gaze remain fixed on the paper in this
pass; the newspaper, fingers and flexing forearms supply the action.

View 225 opens through cels 0–9 at 120 ms between changes (1080 ms to fully open),
then holds cel 9. Closing reverses that order. Begin the arrival actor only when
the leaf has cleared its route, and keep the door at its fixed floor priority.
View 222 cycles six flame cels at 120 ms each. These are proposed timings for
integration, independent of the combined review GIF’s 100 ms sampling and shortened door hold.

Review `page-in-room.gif` at room scale and `watson-page.gif` enlarged. The five
keys are also exposed as a contact sheet. Native Pixelorama project
`source/watson-seated.pxo` contains all five keys. The four-frame rendered source,
exact prompt and conversion/registration code are retained for teaching and edits.

Integration checklist: use the clean background, overlay door cel 0 at startup,
place seated Watson without a second perspective scale, preserve the fixed anchor
through page turns, set the new floor/arrival/hotspots, test lens removal and foreground
occlusion, and retain all existing dialogue. Registration remains a separate engineer
commit after visual review; this study does not change the running game.

## Full swing, organic fire and forward reading correction

The door now continues to 175°, nearly folded back into the landing, clearing the
opening completely. `door-solid.json` is the authoritative animation sequence;
`painted-fit.json` retains the earlier construction measurements.

The fire uses six new painted keys in `generated/fire-keys.png`, with curling and
splitting tongues, embers and occasional sparks. `fire.ts` registers all coal beds
at one baseline and uses one shared scale. Each cel starts from the clean hearth;
the grate pixels remain identical. The larger 40×40 canvas raises the available
flame area seven pixels while keeping its world anchor at [158,141].
`guides/fire.json` records bounds, conversion and timing. Inspect `fire-detail.gif`
and `fire-keys.png` in the review.

Watson now advances the newspaper: his anatomical right hand lifts the page on
screen-left and carries it across to screen-right. New complete poses are stored
in `generated/watson-page-forward.png` with the exact prompt beside them. The
neutral master, head, torso and legs remain fixed; this is a new hand/paper action,
not reversed playback of the old turn.
