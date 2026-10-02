# Victorian framed portraits — r21

The user requested more detail, round Victorian frames, and both facings selected according to the speaker's position. [Open the animated review](index.html). This revision supersedes r18's unframed portrait delivery; r18 remains as the source-painting record. The room/card/interface studies are unchanged.

## Detail without identity drift

The same saved source paintings are sampled with a 12% closer crop, retaining 56×64 native pixels and the shared palette. This gives the face more pixels and crops the bust closer to the collar. Native accents clarify the eyes, moustache, hair, facial creases and collar; Hudson has a small cameo-style brooch. Models and source painting hashes are in models.json.

The oval brass frame has a raised rim, bead course, inner shadow, small engraved curls and top/bottom ornaments. It is authored in native indexed pixels on a separate Pixelorama layer. A dark velvet backing keeps faces legible against any room. Outside the oval is transparent, with binary alpha. No new source paintings or image-generation calls are used in this pass.

Each left-facing face and its mouth/eye cels are exact horizontal reflections of the same right-facing pixels. The frame and backing are **not** reflected: their upper-left illumination remains fixed. This preserves identity rather than independently rendering another face. Reflection reverses hair parting and costume asymmetry; these are UI facing variants, not an anatomical turnaround reference. Both variants are explicit PNG cels anchored [0,0], avoiding mirrored-anchor ambiguity.

## Six loops per existing portrait view

| Facing | Bust | Mouth | Eyes |
|---|---:|---:|---:|
| Right | 0 | 1 | 2 |
| Left | 3 | 4 | 5 |

Views remain Watson 210, Hudson 211, Toby 212. Each bust loop has one cel. Mouths are closed/part-open/open; eyes are open/half/closed. Neutral facial overlays reconstruct the bust exactly. The frame is invariant through all facial animation. Every layer and cel stays 56×64; anchor [0,0].

The existing engine compiler (sci2-ts 0.10.0, packages/content/src/room.ts) creates portrait parts with fixed loops 0/1/2 and the target's fixed screen position. Merely adding the new PNGs does **not** implement automatic facing.

Suggested handoff: choose from speaker screen x when dialogue starts. A speaker in the left half gets the right-facing cameo at [8,8] with text to its right; a speaker in the right half gets the left-facing cameo at [256,8] with text to its left. Switch bust, mouth and eye loops together and reset animated parts to cel 0. Hold the selection for that line to avoid flipping while an actor crosses the midpoint. The interactive room preview demonstrates this policy; game code and room YAML are not changed. See guides/facing-contract.json.

## Reproduce

```sh
node --import tsx art/studies/portraits-r21/convert.ts
node --import tsx art/studies/portraits-r21/guides.ts
node --import tsx art/studies/portraits-r21/build.ts
pnpm art check art/studies/portraits-r21/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/portraits-r21
node --import tsx art/source/compress-study-gifs.ts art/studies/portraits-r21/review
```

Six editable Pixelorama 1.2.3 projects have linked/locked backing, face and frame layers plus independent mouth and eye layers. Native export checks compare every composite cel, and build assertions check neutral reconstruction, reflection identity and frame protection. Visual approval and production registration remain separate.
