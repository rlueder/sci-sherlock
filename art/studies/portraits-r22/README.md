# Ornate Victorian portrait surround — r22

[Animated preview](index.html). This replaces r21's plain brass oval after the user supplied an ornate gilt oval frame reference: ribbon bow, floral shoulders, laurel ornament and an inner bead course. The photograph inside the reference is not used. Existing character paintings and facial animation remain from r21; no characters were regenerated.

The built-in image-generation tool created only the empty frame. Its original transparent PNG and exact prompt are in `generated/`. The reference photo is not redistributed. `build.ts` reduces the saved source to 72×88 with nearest sampling, binary alpha and the shared 64-colour palette, then flood-fills the enclosed aperture for a dark backing. Openwork in the ribbon remains transparent. Normal reproduction uses the saved image; it needs no image-generation service or API key.

## Keep the face size; extend the surround

The face and facial overlays remain **56×64, anchor [0,0]**. Views 210–212 keep r21's six loops: right bust/mouth/eyes 0/1/2, left 3/4/5. Old frame pixels are removed from the bust, and all parts are clipped to the new opening. Neutral mouth and eye cels reconstruct the bust. The left-facing identity is inherited from the same reflected r21 master.

The separate static `export/surround.png` is **72×88**, drawn at the portrait origin minus **[8,18]**. It includes the backing and gilt ornament. Draw it first, then bust, mouth, eyes. `export/frame.png` contains only the ornament and can be drawn last as protection. Neither surround nor frame is reflected, so their lighting remains fixed. The face is never resized to make room for the ornament.

Suggested screen coordinates: left surround [4,4], face [12,22]; right surround [244,4], face [252,22]. Choose the inward-facing loops at dialogue-line start from speaker screen position. See `guides/facing-contract.json`. The preview demonstrates this placement with a dialogue box beside the frame.

**Engine handoff:** the portrait-only study manifest deliberately leaves the shared surround unregistered until the engineer assigns its resource. Registering face PNGs alone would omit the frame. The engine also needs the previously documented automatic facing/placement selection and the separate surround draw. Game code and production `art/art.json` are unchanged.

## Editable source and reproduction

Six 72×88 Pixelorama projects contain the surround, fixed portrait, independent mouth/eyes and a protected frame layer. The full project is larger than the exported facial cels because it is a composite authoring surface. Each project has seven review combinations.

```sh
node --import tsx art/studies/portraits-r22/build.ts
pnpm art check art/studies/portraits-r22/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/portraits-r22
node --import tsx art/source/compress-study-gifs.ts art/studies/portraits-r22/review
```

The native export check compares all 42 composite exports pixel-for-pixel. The frame reduction retains its clear ribbon-and-leaf silhouette; very small floral details become deliberate pixel clusters at game resolution. Image generation supplies the source artwork, while palette conversion, clipping, assembly and editable animation use the reproducible open-source project workflow.
