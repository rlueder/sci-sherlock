# Interface — r20

2 October 2026. Original hand-authored pixel interface in the game's existing palette. [Combined preview](../portraits-r18/index.html#interface). No image generation is used for these graphics.

- Font 1: 152×60 transparent PNG, 19 columns × 5 rows of 8×12 cells; ASCII 32–126, spacing 1, space 3, line height 12. Uses sci2-ts's original MIT pixel glyphs, preserving lowercase and descenders, with one row of top padding. It is a clear small dialogue font rather than a new historical typeface.
- View 260: eight 8×8 frame tiles, anchored [0,0]. Order: top-left, top-right, bottom-right, bottom-left, top, right, bottom, left. Tile the edges, and fill the box with paper colour.
- Views 261–265: 16×16 walk, look, use, talk, wait cursors. Anchors are the point, glass centre, fingertip, speech-tail tip and hourglass centre respectively; see art.json.
- View 266: six 24×24 icons, in walk/look/do/talk/inventory/menu order. Loop 0 normal, loop 1 selected.
- View 250: 24×24 inventory lens, anchor [0,0], loop 0; 16×16 cursor with hotspot [6,5], loop 1.

Box colours are paper #f5d8b1 (62), ink #110c14 (2), border #9f784c (48). The same values and cel ordering are in colours.json. Each loop has an editable Pixelorama project; loops with differing dimensions remain separate projects. Palette, alpha and sizes are checked by the art compiler. Source projects are verified through Pixelorama's actual exporter.

```sh
node --import tsx art/studies/interface-r20/build.ts
pnpm art check art/studies/interface-r20/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/interface-r20
```

This is a visual review delivery. Registration in the production manifest and selecting these resources in the game's UI remain separate. Font-sheet glyphs derive from sci2-ts 0.10.0, MIT; see node_modules/sci2-ts/tools/game/font.ts and that package's LICENSE. Other shapes are original to this study. All sources and exports follow the repository's MIT license.
