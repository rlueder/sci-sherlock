# Speaking portraits — r18

2 October 2026. Priority moved here by the user: portraits, remaining room/card/interface art, then return to Holmes's walk. This is a review delivery, not production registration.

[Open the combined art preview](index.html). Watson, Mrs Hudson and Toby use views 210–212. Each has a 56×64 canvas and [0,0] anchor, one bust in loop 0, three mouth overlays in loop 1 (closed first), and three eye overlays in loop 2 (open first). The closed-mouth/open-eye composite is pixel-identical to its fixed master.

## Identity and construction

The r13 cast lineup supplied the identity and costume references. Watson keeps his square jaw, sturdy neck, moustache, brown coat and oxblood waistcoat. Hudson retains her grey bun, high-neck navy dress and apron. Her exact face and age are adaptation choices, not claimed Doyle descriptions. Toby is the original young clockmaker's apprentice, not the dog from Doyle. He keeps his worried expression, brown hair and oversized work coat. See [canon notes](../baker-street-r13/canon-and-scale.md).

Built-in OpenAI image generation supplied three original neutral bust paintings; exact prompts and originals are in generated/. No animation frames were independently generated. convert.ts applies one fixed crop/scale per character, the shared 64-colour palette, nearest sampling and binary alpha. Portraits display with 1.2 vertical pixel aspect.

The resulting source/*-master.png files are pinned by SHA-256 in models.json. Native mouth and eye cels are authored over those fixed masters in build.ts. The full-canvas overlays include local skin coverage to replace the neutral features; everything else is transparent. Masks preserve the outside face silhouette. Pixelorama projects have a linked locked bust layer, mouth layer and eye layer. The construction grids and landmark rectangles are under guides/.

The image-generation service is not open source. The editable production workflow is: TypeScript conversion and indexed cels, Pixelorama 1.2.3 projects, PNG/JSON exports, and ffmpeg lossless GIF compression. An artist can replace the source painting or edit native layers without the service.

## Rebuild and check

From the repository root:

```sh
node --import tsx art/studies/portraits-r18/convert.ts
node --import tsx art/studies/portraits-r18/guides.ts
node --import tsx art/studies/portraits-r18/build.ts
pnpm art check art/studies/portraits-r18/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/portraits-r18
node --import tsx art/source/compress-study-gifs.ts art/studies/portraits-r18/review
```

The build checks master reconstruction and overlay containment; native-export-check.json records actual Pixelorama exports compared against composite reference PNGs. The animated preview tests overlays, not voice synchronization. GIF playback uses 130 ms frames; browser playback uses 125 ms.

Review the face identity, mouth placement, moustache stability and blink before registration. Current cels are not phoneme-specific, and there is no jaw/head motion. Nothing in this study replaces room YAML, Yarn or runtime choreography.
