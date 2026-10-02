# Interface implementation handoff — 2 October 2026

New Century Schoolbook 12px is the approved dialogue/UI typeface. Implement it
without changing the upstream bitmaps or spacing. R29 supplies the four faces and
their metrics; the old r26 font conversion is rejected. R28 is the current painted
wood/velvet interface candidate, still awaiting visual approval.

This handoff was rechecked against `sci2-ts` **0.14.0** after rebasing onto current main.
Recheck the engine's current branch before implementation: another session may
already have changed these APIs. This commit delivers art and documentation, not
runtime support. Engine code belongs in `sci-ts`; game registration belongs in
`sci-sherlock` in a separate `art/art.json` commit.

## Delivery and decisions

| Work | Source | Status |
|---|---|---|
| Dialogue/UI typeface | [r29](../art/studies/typography-r29/README.md) | New Century Schoolbook 12px approved; four faces exported |
| Font masters | [upstream BDFs and licence](../art/studies/typography-r29/source/upstream/) | Authoritative unmodified source; no font generation needed |
| Font preview | [mixed styles](../art/studies/typography-r29/review/selected-dialogue.png), [all glyphs](../art/studies/typography-r29/review/selected-glyphs.png) | Art proof, not a screenshot of engine integration |
| Painted case and symbols | [r28](../art/studies/interface-r28/README.md) | Review candidate; preferred 32px, independent 24px alternative |
| Plain wood text frame | [r27](../art/studies/interface-r27/README.md) | Optional earlier proposal; no approved new dialogue frame implied |
| Portrait surround | r22 frame retained by r23 | Keep the approved gold oval surround |
| Earlier interface/font studies | r25, r26, r27 | Retained as learning/history sources; do not register as the latest design |

The original comparison's Times and 10px fonts are research references. Use only
the four `ncen*12.bdf` faces for the selected family. R28's older review captions
still contain r26 typography; use r29 for newly rendered captions and game text.

## Font asset contract

The directory `art/studies/typography-r29/export/` contains `regular`, `bold`,
`italic` and `bold-italic`, each as a PNG plus a JSON sidecar. The sidecar schema is
`sci-sherlock-bitmap-font-metrics-v1`. It is a handoff format, **not an existing
engine manifest option**.

| Property | Meaning |
|---|---|
| `pixelSize: 12` | Upstream design size; it is not the line height |
| `ascent: 11`, `descent: 3` | Shared baseline and vertical extent of all four faces |
| `lineHeight: 14` | Distance between successive baselines |
| `first: 32`, `last: 126` | Delivered ASCII character range, inclusive |
| `atlas` | PNG path relative to its JSON file; transparent background, opaque ink mask |
| `cell: [16,14]`, `columns: 16` | Packing only: atlas is 256×84, with 95 occupied cells |
| `source`, `sourceSha256`, `license` | Provenance and original font licence; paths relative to the JSON |
| `glyphs[].code` | Character code; use it for lookup, not an assumed array index |
| `rect: [x,y,w,h]` | Rectangle of the original BBX bitmap in the atlas |
| `bearingX` | Signed horizontal offset from the pen to the left edge of that bitmap |
| `top` | Offset from the line top to the bitmap top |
| `advance` | Pen advance from upstream DWIDTH, independent of bitmap width |

The glyph bitmap sits at the storage cell's upper-left. Its vertical placement is
in `top`; do not apply the cell position as a second baseline offset. A blank glyph
can have a nonzero rectangle and advance. Test alpha for ink, not the rectangle's
area or its RGB value. Colour the mask at draw time using the text foreground.

Do not trim, scale, shift, shear or embolden the upstream glyphs. Do not add one
pixel of spacing or infer an advance from rightmost ink. Use the supplied distinct
bold/italic faces. BDF is the editable master here; these fonts do not need a
Pixelorama redraw. Keep `source/upstream/COPYING` with redistributed font assets:
the Adobe/DEC licence applies to fonts, while repository MIT applies to our code.

## Engine work

In 0.14.0 the relevant code is:

| Engine path | Current constraint / required work |
|---|---|
| `tools/art/font.ts` | PNG sheet importer derives width from rightmost ink plus spacing; add an explicit metric-aware import path |
| `tools/art/build.ts` | Manifest validation/build has no metrics option; define and validate a backward-compatible entry for these assets |
| `packages/sci/src/text/font.ts` | `Glyph.width` also serves as advance; extend the model, serialization, measurement, wrapping and standalone rendering |
| `packages/sci/src/vm/kernels/text.ts` | Runtime drawing has its own glyph loop; update it too, along with TextSize/TextWidth and text-edit behavior |
| Dialogue/text library and Yarn message pipeline | Carry face selection through styled runs, layout, drawing and any progressive text reveal |

The legacy SCI bitmap resource stores width, height and pixels only. Changing the
PNG importer alone cannot preserve a negative bearing and an independent advance.
Define a versioned extension or supplemental metrics resource in the engine; do
not silently reinterpret existing SCI font bytes. Legacy fonts must still load
with zero bearings and `advance = width`, rendering exactly as before. Font caches
must retain the new metrics along with pixels. The binary representation and exact
manifest syntax are engineering decisions; this doc does not prescribe unsupported
JSON fields in the production manifest.

For each glyph, with a line top `(lineX, lineY)` and pen starting at `lineX`:

```text
drawX = penX + bearingX
drawY = lineY + top
draw the rect's ink mask at (drawX, drawY)
penX += advance
next lineY = lineY + 14
```

All faces share baseline `lineY + 11`. Use advance sums for normal pen movement,
word wrapping and alignment. Also compute the union of actual ink extents for
allocation/clipping: italic letters can begin before the pen or extend past their
advance. Include negative leading and positive trailing overhang in text-box
padding or bitmap bounds, keeping the logical pen origin stable. Do not clamp each
glyph to its advance width. The box's text origin/padding must accommodate the
actual line ink; shifting each glyph individually changes spacing.

Use the same layout result for measurement and rendering. An outline font rendered
at 12px in a browser is not a substitute for these specific bitmap strikes.

## Styles and dialogue content

Proposed font IDs are **1 regular, 3 bold, 4 italic, 5 bold italic**. Keep **2**
reserved for titles; check latest registrations before allocating. R26's proposal
to use font 2 for bold is retired. These IDs are not registered by this commit.

Style rules: regular for body text, bold for the speaker/short heading, italic for
publication titles or emphasis, bold italic when both apply. Keep content strings
and line IDs stable. In the actual dialogue:

- `100-018`: italicize `Standard` within the otherwise regular sentence.
- `100-020`: bold the `Watson:` label, keeping the following sentence regular.
- The extra bold-italic sentence in the proof demonstrates the available face;
  it is not an instruction to duplicate a dialogue line in the game.

Carry semantic style on text spans. A word split across spans must remain a single
word for wrapping; a style boundary does not add a space or cause a line break.
Measure each glyph with its selected face. Keep styles across wrapped lines,
pagination and character reveal; speaker labels must not be rendered twice.
Preserve the plain-text path for existing content and narration/voice lookup.

Choose and document the supported Yarn markup or message metadata when implementing
that pipeline. This delivery intentionally supplies no invented working Yarn tags.
Validate that markup does not leak to the player, subtitles, speech or line lookup.

Only ASCII 32–126 is exported. Audit message strings and UI labels at build time;
report unsupported characters with the line ID. Do not silently drop accented
letters, smart punctuation or other missing characters. Expanding the repertoire
from the upstream BDFs or agreeing a punctuation normalization policy is a follow-up,
not permission to replace the selected family with a system font.

## UI art integration after approval

Use [r28's measured handoff](../art/studies/interface-r28/guides/handoff.json) and
empty skins with dynamic objects. Do not use its composed review PNG as a toolbar
or inventory background: those include demonstration objects/text.

- Preferred toolbar: 320×48, 32×32 icons at x `16,58,100,142,226,268`, y `8`, ordered
  walk, look, use, talk, inventory, menu. Active-item slot is `[184,8]`.
- Case: 256×144 at screen `[32,30]`; four columns, two rows. Slot origins in case
  coordinates are `[13,28]`, `[73,28]`, `[133,28]`, `[193,28]`, then the same x at
  y `75`. Item inset is `[7,7]`. Add the case origin once when building hitboxes.
- In 0.14.0 `lib/system.sh` defines `ICON_SIZE 24`; `lib/991.sc` uses it for layout.
  Update size, spacing, selected states, hitboxes and active-item placement together
  for 32px. Do not use 32px sprites with 24px hitboxes. If 24px is chosen instead,
  use r28's independent `art-24.json` exports and a matching layout.
- View 266 supplies normal/picked loops. R28's isolated view 250 contains **only**
  the inventory icon; retain the existing 16px cursor loop and its hotspot when
  merging the resource. Render only items the player actually holds.
- R27/r28 propose 68 colours: indices 0–62 preserve existing RGBs, four purples
  occupy 63–66, white moves from 63 to 67. Update palette references and any code
  using white's old index together; recheck all registered resources. Never paste
  new indices into the old palette. The proposal is not applied to production.
- Font line height changes text-box dimensions. Measure after wrapping, then add
  frame/text padding. Verify dialogue beside both portrait facings and multiline
  narration near the bottom of the screen. This handoff does not approve r25's
  ornate panels or prescribe a new frame where none has been accepted.

The Baker Street replacement is a separate room task. Its script checklist,
resource/layer mapping, suggested actor route and perspective constraints are in
[r24's handoff](../art/studies/baker-street-r24/README.md). Refit the floor/hotspots
before replacing picture 101; its coordinates are proposals, not shipped geometry.

## Validation and merge sequence

1. Add the engine format/import/rendering support while keeping legacy fonts intact.
   Test negative bearings, blank-space advance, trailing overhang and source pixel
   parity for all 380 glyphs after resource serialization and reload. Compare both
   standalone and VM text rendering: they currently have separate drawing paths.
2. Test real wrapping and mixed styles: `100-018`, `100-020`, initial italic `j`,
   `f` beside punctuation, descenders `g j p q y`, `M W`, digits, explicit newlines,
   a word whose style changes midway, narrow boxes, and long uninterrupted text.
   No clipping, dropped glyphs, added gaps or baseline jumps; measure and draw agree.
3. Publish/use the supporting engine version, then add the four approved fonts to
   `art/art.json` in a dedicated game registration commit. Keep font 2's title role.
   Connect the actual message style mechanism and UI font selection in game code.
4. Reproduce art outputs with the commands below. Review at 320px native width and
   the actual game presentation aspect; square 3× proof scaling alone does not
   verify the game's 4:3 presentation. Avoid browser fractional downscaling when
   judging pixels. Capture actual in-game narration, dialogue and UI screenshots.
5. Run the game's `pnpm check` and `pnpm tsx preview.ts` for the integration change.
   Verify existing portrait animation, voice/line lookup, inventory, save/load and
   modal input behavior. Register r28 only after its visual/layout decisions are
   accepted, separately from the already-approved font family.

Art regeneration and current checks (from the repository root):

```sh
node --import tsx art/studies/typography-r29/build.ts
node --import tsx art/studies/typography-r29/export-selected.ts
pnpm typecheck
pnpm art check art/studies/interface-r28/art.json
pnpm art check art/studies/interface-r28/art-24.json
```

The export check verifies decoded PNG pixels against source BDF ink for all 380
glyphs. The source metrics/checksums and `guides/selected-validation.json` are
retained in r29. Those are asset checks, not a claim that the engine accepts this
font format. Mark delivery complete only after game screenshots match the approved
font and the legacy/mixed-style checks pass.
