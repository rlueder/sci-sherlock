# Baker Street: script-led exterior — r24

[Open the review](index.html). This replaces r19's exterior **for visual review**. The game still uses r19 until approval and integration. Source of truth: `rooms/101.yarn`, `rooms/101.room.yaml`, `docs/teaser.md` and the picture-101 brief in `docs/visual-spec.md`.

## What the script requires

| Source | Requirement | Art response |
|---|---|---|
| teaser story / 101-002 | A cold November night in 1895; little visible through fog | Dark slate/olive atmosphere; terraces lose contrast into broad fog shapes, with no clear landmark skyline |
| 101-001 | Hansom waits at the kerb; two lamps blur in the fog | One two-wheeled cab in the road beside the pavement; two distinct warm carriage lights |
| 101-003 | Horse steaming in the cold | Breath painted at the muzzle, clear of the horse silhouette |
| 101-004 / 101-005 | Holmes and Watson address the cabby | Bundled driver perched at the rear of the cab, with reins to the horse |
| 101-006 | Gas lamp makes a small room of light | One public lamp with a localized warm patch and slow four-cel glass flicker |
| 101-007 | Mrs Hudson's lamp still burns in the hall | Hall lamp visible through the ajar door; restrained warm transom light; native 221B plaque |
| picture-101 brief | Short side-on departure from door to cab | Open foreground approach, separate near lamp and railing layers |
| 101-009 | Watson's collar is up | **Cast handoff still needed:** the current standing Watson shown in the scale preview has his indoor collar. He is not baked into the room. |

r19 made the street too clear and blue, omitted the cabby and obvious horse breath, and showed only one cab light. Its warm entrance did not clearly expose the lamp inside the hall. The new painting is built around those script details.

The first r24 source mistakenly parked the cab and horse on an oversized pavement. The second, targeted edit puts their wheels and hooves in the cobbled road, recedes the kerb behind them, and moves the driver behind the passenger compartment. `generated/street-attempt-1.png` is a rejected intermediate, never an export source. `generated/street.png` is the selected source.

## Perspective and staging

`build-guides.py` makes an editable Blender blockout in metres: door, steps, kerb, two-wheel cab envelope, high rear driver, horse, public lamp and 1.8 m actor references. It exports projected vertices and a camera guide, with a horizon near y83. The painting is not a calibrated render of the blockout: object positions changed during generation. The final painted layout is measured separately and must not inherit blockout coordinates blindly.

The review proposes horizon y80 and full-size actor feet at y176; the saved Holmes master is not redesigned. Scale is evaluated using actual Holmes and Watson sprites, with a route from [48,139] through [71,150] and [121,153] to [191,151]. The horizon and route are **handoff proposals for an in-game fit**, not shipped collision data. The foreground road extends lower than the proposed route; do not make its entire painted surface walkable without checking actor scale.

The current r19 room uses horizon123/fullSize170, lamp [106,158], and cab approach [190,156]. Those placements must be refitted before switching the production picture. The script's current approach is recorded only for comparison; this art task does not edit Yarn or room YAML.

## Layers and resources

All room layers are 320×200 with 1.2 vertical pixel aspect, shared 64-colour palette and binary alpha.

- `export/background.png`: complete scene, no protagonists. Cab, driver, horse, breath and carriage lights are static as allowed by the brief.
- `export/lamp-foreground.png`: near lamp cutout; proposed floor priority135.
- `export/rail-foreground.png`: near-left railing cutout; proposed priority146.
- `export/door-number.png`: native 3×5 letterforms for the plaque, already composited into the background.
- View226: four 32×128 cels, anchor[15,127], proposed world[101,135], draw origin[86,8]. Only the gas-lamp glass colours change. Blank lower rows preserve a floor anchor while limiting animation to the housing.

The study manifest uses picture101 and view226 in isolation. `art/art.json` is unchanged. Register the replacement in its own integration commit after visual review, alongside the engine-side floor/hotspot/lamp changes. Layer masks are native traced polygons; check occlusion at the door and lamp in play.

## Reproduce and learn

```sh
/path/to/Blender -b --python art/studies/baker-street-r24/build-guides.py
node --import tsx art/studies/baker-street-r24/render-guides.ts
node --import tsx art/studies/baker-street-r24/convert.ts
node --import tsx art/studies/baker-street-r24/build.ts
pnpm art check art/studies/baker-street-r24/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/baker-street-r24
node --import tsx art/source/compress-study-gifs.ts art/studies/baker-street-r24/review
```

The required editable/rebuild workflow is Blender 4.5.14 LTS, Pixelorama 1.2.3, TypeScript and ffmpeg. Optional proprietary built-in ImageGen supplied the source painting and spatial correction; both exact prompts and saved outputs are committed with the study so reproduction needs no image-generation service. Conversion uses nearest sampling and the project's fixed palette, not a new adaptive palette. Native Pixelorama exports are compared pixel-for-pixel; this verifies file delivery rather than artistic or perspective approval.

## References

- Approved workshop v6: pixel treatment, shape economy and shared palette.
- New Blender construction: scale and composition, with the final-painting limitations described above.
- [Science Museum Group: late-19th-century hansom](https://collection.sciencemuseumgroup.org.uk/objects/co25602): two wheels, one horse, enclosed passenger body and elevated rear driver. Used as a structural reference; no museum imagery is copied into the assets.
