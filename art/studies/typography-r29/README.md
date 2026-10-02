# Native bitmap fonts — r29

[Open the comparison](index.html). R26 is rejected. It used Libertinus Serif outline fonts rasterized at a small size, with overwide glyphs squeezed to eight pixels. It was not an original typeface. That adaptation produced uneven-looking letterforms; technical compilation checks did not establish typographic quality.

## Better source material

This comparison uses X.Org's **native bitmap** New Century Schoolbook and Times, from the official [font-adobe-75dpi 1.0.4 archive](https://www.x.org/releases/individual/font/font-adobe-75dpi-1.0.4.tar.xz). Both have regular, bold, italic and bold italic at 10px and 12px. The original BDF files and full COPYRIGHT/permission notice are retained in source/upstream. The permissive licence allows use, modification and redistribution with the notices; do not describe these fonts as our original work or rely on the repository's MIT licence for them.

The user selected **New Century Schoolbook 12px** on 2 October 2026. Times and 10px remain comparison references only. The approved family suggests traditional printing rather than reconstructing a particular 1895 typeface. Approval of the art does not mean it has been registered in production.

Other genuine low-resolution projects considered:

- [Cozette](https://github.com/the-moonwitch/Cozette): MIT, 6×13 bitmap-first design. Clear for compact terminal/UI text; stylistically less suited to this game's printed-book direction. It is not presented here as a four-face serif family.
- [Terminus](https://terminus-font.sourceforge.net/): purpose-built screen font, another legibility reference; its terminal appearance is not the proposed art direction.
- [Oldschool PC Font Pack](https://int10h.org/oldschool-pc-fonts/): many authentic hardware/text-mode designs, licensed CC BY-SA 4.0. Useful historical low-resolution references, with a different aesthetic and licence from our chosen candidates.

## What the proof preserves

`build.ts` reads upstream BDF bitmaps directly. It places every pixel using BBX offsets relative to a single baseline and advances the pen with DWIDTH. It does not rasterize outlines, condense wide letters, synthesize bold/italic or vertically recenter individual glyphs. The proof includes optional baseline guides. Enlargement uses an integer 3× scale in both axes, without the room preview's 1.2 vertical pixel aspect or CSS fractional shrink-to-fit.

```sh
node --import tsx art/studies/typography-r29/build.ts
```

The proof parses 1,520 ASCII glyphs across 16 upstream faces. Source checksums, ascent/descent, bearings and widths are recorded in guides/source-metrics.json. Glyph heights and advances vary by design; descenders extend below the baseline. Source images are shown at native pixel size, not forced into an 8×12 canvas.

## Approved delivery

Run `node --import tsx art/studies/typography-r29/export-selected.ts` after the comparison build. It produces four transparent ink-mask PNG atlases and matching JSON files under `export/`: regular, bold, italic and bold-italic. All 380 ASCII glyphs are compared pixel-for-pixel with the decoded PNG exports. The original BDFs remain the authoritative editable masters; no Pixelorama repaint is needed for upstream font assets.

Each atlas is 256×84, packed in 16×14 storage cells, 16 columns, code 32 first. **Storage cell width is not letter spacing.** A glyph's `rect` crops its original BBX bitmap; `bearingX` is BBX x, `top` is `11 - BBX y - BBX height`, and `advance` is DWIDTH. All faces use ascent 11, descent 3, line height 14. Empty space retains its source advance. A 12px font does not imply a 12px line box.

For a line top `(x, y)`, draw each cropped glyph at `(penX + bearingX, y + top)`, then advance `penX` by `advance`. Mixed styles share the same baseline `y + 11`. Measure/wrap with the advance of each run's selected face; preserve styles after wrapping. Allocate/clamp text surfaces using ink extents as well as advance widths so an initial italic overhang or final flourish is not clipped. Keep the original font metrics, rather than adding spacing to every character or recentering the ink.

`review/selected-dialogue.png` shows real dialogue wording with a bold speaker, italic publication name and bold-italic example, rendered from the exported atlas data. `review/selected-glyphs.png` shows every delivered character. Native 320px-wide counterparts are included. Proofs use integer square-pixel scaling; final in-game display still needs a check at the engine's presentation aspect.

Proposed resource mapping: font 1 regular, 3 bold, 4 italic, 5 bold italic. Font 2 stays reserved for titles; r26's old proposal to use it for bold is retired. This mapping is a handoff, not an `art.json` registration. Upstream licensing applies to all exported font data; project MIT applies only to our code.

## Before integration

See the [engine implementation handoff](../../../docs/art-interface-implementation.md)
for the asset schema, affected engine paths, serialization compatibility, styled
dialogue rules, proposed IDs and acceptance checks.

The current font-sheet compiler derives advances from rightmost ink. The SCI Font/Glyph model also uses width for both ink extent and pen advance, with no bearing field. Merely importing the atlas through that compiler would lose the source metrics. The engine needs a bearing/advance-aware font path (including resource serialization, measurement, wrapping and drawing), plus styled runs for mixed bold/italic text. Our JSON schema is an explicit handoff format, not a supported engine format. Do not resize these glyphs to satisfy the old 8-pixel width. No game files or production manifest are changed by this delivery.
