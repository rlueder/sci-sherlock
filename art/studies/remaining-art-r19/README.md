# Remaining rooms and cards — r19

2 October 2026. First review pass for Baker Street (101), the hidden stair (103), title (104), end card (105) and gas lamp (226). [Combined preview](../portraits-r18/index.html#rooms).

All pictures are 320×200, displayed 4:3 with 1.2 vertical pixel aspect. Layers are full-canvas. Every image uses the existing 64-colour palette and binary alpha. Original AI source paintings and their exact built-in ImageGen prompts are under generated/; converted native paintings and editable Pixelorama sources are under source/.

## Room layers and perspective

Baker Street has the warm 221 entrance, a static horse and two-wheeled hansom, and a cold open foreground crossing. The gas lamp is also a separate foreground layer, with proposed priority 158. Its four flicker cels retain the housing and change selected glass colours. Place view 226 at [106,158], anchor [18,138], 40×140 canvas. The blank lower canvas preserves the floor anchor. The static lamp remains in the base painting; overlay cels cover its changing region completely.

The stair uses an oblique camera from the upper landing and a separate near-newel layer, proposed priority 181. No Holmes figure is baked into either room. Layer masks and proposed placement/route data are in guides/layer-placement.json. These are handoff suggestions; the engineer must fit floor boundaries, scaling, hotspots and sorting to the final art.

build-guides.py creates real editable Blender camera/geometry blockouts. render-guides.ts turns projected vertices into construction drawings. They are **pre-painting composition guides**, not calibrated matches for every edge in the generated paintings. The preview shows them separately for that reason. Street scale relationships between the entry, cab and actor still need a visual fit in-game; do not copy blockout coordinates into collision data. Native pixel masks were traced from the final paintings.

Title lettering is separate from the pocket-watch/workbench illustration. The end card reuses the stair with a deterministic dark palette remap and separate lettering. Both have baked-lettering picture layers: omit engine-drawn duplicate titles when integrating, or use only their background layers. The font is the engine's original MIT pixel font.

## Rebuild

```sh
/path/to/Blender -b --python art/studies/remaining-art-r19/build-guides.py
node --import tsx art/studies/remaining-art-r19/render-guides.ts
node --import tsx art/studies/remaining-art-r19/convert.ts
node --import tsx art/studies/remaining-art-r19/build.ts
pnpm art check art/studies/remaining-art-r19/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/remaining-art-r19
node --import tsx art/source/compress-study-gifs.ts art/studies/remaining-art-r19/review
```

Blender 4.5.14 LTS, Pixelorama 1.2.3, TypeScript and ffmpeg are the editable open-source workflow. ImageGen is an optional proprietary source-painting step; the saved paintings and prompts make that boundary explicit. The study manifest is separate from art/art.json until visual review. Native export checks establish file correctness, not perspective approval.
