# Art delivery status — 2 October 2026

The workshop is in the game as of `975b29c`. The approved workshop v6 remains the
style and scale reference. Technical validation, visual approval and integration
are separate statuses.

## In the game

The workshop uses r12's actor-free corrected background, r9 foreground/atmosphere,
master v2 Holmes, investigation gestures, idles and the opening clock. 221B's r13
room layers, fire, mantel lens, door and seated Watson are now registered, along
with the neutral Watson, Hudson and Toby sprites. Holmes and the cast still need
finished directional walks. The game's title/end screens are implemented; finished
art for those screens is now available for review in r19.

## Current priority — user change, 2 October

**Latest decision:** New Century Schoolbook 12px is approved for dialogue/UI.
R29 now supplies four bitmap atlases and exact source metrics, plus a mixed-style
dialogue proof. Font integration remains with the engine: preserve glyph bearings
and advances and support styled text runs. R26 is rejected. R28 is the current UI
art candidate; its earlier caption rasterizations are historical review output.

[Implementation handoff](art-interface-implementation.md): exported font schema,
engine entry points, backward compatibility, mixed-style dialogue, UI layout/palette
contracts, and the acceptance checks required before production registration.

1. **Portraits:** r23 supersedes r22 with fixed neutral masters and individual mouth anatomy, both facings and separate mouth/blink overlays for
   Holmes (new 213), Watson, Hudson and Toby, retaining r22’s ornate surround, plus editable sources and an animated review. Automatic facing and dialogue-side placement need engine support.
2. **Remaining art:** r19 supplies Baker Street, hidden stair, title/end artwork,
   foreground layers and gas-lamp flicker. R20 supplies the font, box frame, cursors,
   action icons and inventory lens. These are review studies, not runtime registration.
3. **Return to Holmes's walk:** finish mirrored west and front/back references and
   cycles from r17's layered approach after the portrait/remaining-art review.

[Open the combined r18–r20 review](../art/studies/portraits-r18/index.html).
Reach/case timing, Watson's page turn and cast walks remain queued afterward.

## Ordered art queue

The original numbered queue is retained below for resource coverage; the current priority above supersedes its order.

| Order | Deliverable | Available | Next work |
|---|---|---|---|
| 1 | Status and setup | Workshop registration recorded here; AGENTS.md read; dependencies installed in the isolated art worktree | Keep this document current and use Conventional Commits |
| 2 | Holmes walk, 200 | Fixed master v2; game loops repeat the side standing cel; [r14 rejected](../art/studies/holmes-r14/README.md) for dancing motion and disconnected shoulders/torso | [r17 layered east test](../art/studies/holmes-r17/README.md): one leg, both legs, dressed figure; coat gap closed and gait revised with longer stride, straighter support and toe-off; review before remaining directions; retains 72×120 and [36,113] |
| 3 | Reach/case timing | r11 has four reach cels; r12 has eight opening cels; game currently plays these sequentially | Review contact in the combined room and deliver concrete frame timing or extra contact cels |
| 4 | 221B, 100 | r13 room/foreground, fire 222, lens 223, door 225 and seated Watson 205 are integrated | Finish Watson page-turn loop and review scene animation |
| 5 | Cast 201–203 | r13 fixed neutral models are registered; guides delivered | Watson walking for rooms 101–103; Hudson and Toby west arrival walk first, then remaining directions; Holmes's scale |
| 6 | Portraits 210–213 | r23 static masters, character-specific mouth keys, Holmes portrait and right/left facial loops; approved r22 surround retained | Review r23 mouths and Holmes; engineer must register the surround and wire facing/placement |
| 7 | Street 101 and stair 103 | r19 paintings, foregrounds, lamp 226 and Blender construction sources | Review camera, cast scale and masks; engineer fits floor and hotspots |
| 8 | Title 104 and end card 105 | r19 paintings and separate lettering; screens already exist in the game | Review and integrate without duplicate engine-drawn lettering |
| 9 | Interface | r28 painted case/icons under review; r29 New Century Schoolbook 12px approved, four faces exported | Engine must preserve font metrics and support mixed styles; register approved resources separately |
| 10 | Optional mouse contrast | r9 directional sprites/routes are in play | Lift selected highlights against the dark floor while retaining small scale |

## Contracts for delivery

| Resource | Contract |
|---|---|
| Holmes 200 | 72×120; anchor [36,113]; loop 0 east, 1 mirrored west, 2 toward, 3 away; cel 0 standing, following cels walking |
| Gestures 204 | r11 reach loop 0 and kneel loop 1; four existing keys each |
| Idles 206 | Puff 0, thinking 1, cap 2, watch 3; master v2 canvas/anchor |
| Opening clock 221 | 88×168, anchor [60,150], eight cels, world [292,150] |
| Closed pendulum 272 | 64×140, anchor [30,136], world [268,150]; same closed world placement as 221 |
| Atmosphere 270–277 | Rain, lamp, pendulum, mouse-right, sky, mouse-away-right, mouse-left, mouse-away-left |
| Dialogue font | Approved r29 New Century Schoolbook 12px, ASCII 32–126; ascent 11/descent 3/line height 14; original bearings and advances in JSON beside four PNGs; supersedes 8×12 contract |
| Frame 260 | Eight cels: four corners then four edges, top-left anchors; alternatively specify paper/ink/border palette colours |
| Cursors 261–265 | Walk, look, use, talk, wait; at most 16×16; anchor is hotspot |
| Icon bar 266 | Six 24×24 cels: walk, look, do, talk, inventory, menu; loop 0 normal, loop 1 picked |
| Lens 250 | Loop 0: 24×24 inventory icon; loop 1: cursor |
| Portraits 210–213 | 56×64, [0,0]; right bust/mouth/eyes loops 0/1/2, left 3/4/5; separate 72×88 surround offset [-8,-18] |

## Work and review rules

Use a worktree based on origin/main; install dependencies in that checkout before
its first commit. Read [AGENTS.md](../AGENTS.md). The package/import name is now
sci2-ts. Commit messages follow Conventional Commits.

Studies supply art, guides and timing data. Engine scripts, room YAML/Yarn and
hotspot/floor changes stay with the implementing session. Registering approved
assets in art/art.json belongs in a separate commit. Never concatenate study
manifests blindly: the closed pendulum and opening case are alternative actors,
and review timelines may repeat keys without adding unique cels.

Pin model identities and colour ramps, draw coherent whole-body poses, and review
the animation in place and moving through the actual room before calling it ready.

Portrait frame correction: [r22 review](../art/studies/portraits-r22/index.html) follows the user’s ornate gilt-frame reference. Facial cels stay 56×64; the shared 72×88 surround is separate, offset [-8,-18] from the face. Both facings and all mouth/blink cels are included. See the study README for the draw order and integration contract.

[Portrait anatomy correction r23](../art/studies/portraits-r23/index.html): saved neutral masters are hash-checked before animation; unique lip-line masks replace the old generic mouth overlays. Holmes is proposed as view 213. Mouth keys and anatomical guides are exposed in the review.

Latest r23 review correction: Watson’s mouth seam moved up two native pixels to the moustache edge. Holmes, Watson and Hudson have individually fitted near/far eyelids; Toby’s blink stays unchanged. Eye landmarks, frozen-cel preview controls and blink comparison sheets are included.

Hudson's open-eye cleanup is recorded as r23 master revision 2: three stray pixels below the near eye are corrected in the saved neutral reference and regenerated in both bust/open-eye facings. Prior reference retained; half/closed cels and all other characters are unchanged.

## Baker Street revision after script review

[r24 exterior review](../art/studies/baker-street-r24/index.html) replaces r19 for review: dense nighttime fog, visible hall lamp, two cab lamps, horse breath and a rear cabby. The cab now sits in the road beside the kerb. New Blender construction, native foreground layers, gas-lamp cels, actual-sprite scale review and measured placement proposals accompany the art. The running game remains on r19; refit room101 and cab approach before registering r24. Watson’s raised-collar street variant is still a cast task.

## Victorian interface revision — r25

The user rejected r20's plain UI alongside the detailed room art. [R25](../art/studies/interface-r25/index.html)
provides painted 24×24 action buttons with a shared gilt bezel, selected states,
matching cursors and lens, and a carved/beaded dialogue frame paired with the approved
Holmes portrait. The font is unchanged. The exact generation prompt, original master,
deterministic palette conversion and eleven editable Pixelorama projects are retained.

R25 corrects frame cel order to the current engine's TL/TR/BL/BR/top/bottom/left/right.
The frame now uses 14×14 canvases. Its compact 320×40 dark toolbar is a layout proposal:
the current engine derives toolbar height from dialogue-frame margins and would show
68 pixels with this frame. The review includes both layouts, and the handoff preserves
a slot for the active inventory item. Separate toolbar layout/styling work is required
before integration. This study is not registered in art/art.json and awaits visual review.

## Typography revision — r26

[The font review](../art/studies/typography-r26/index.html) supplies regular, bold,
italic and bold italic serif bitmap sheets (proposed fonts 1–4). Each uses the
8×12 ASCII contract and the same baseline. Pinned Libertinus Serif outlines,
OFL licence, deterministic glyph masters and four editable Pixelorama sheets
are included. Font derivatives retain OFL-1.1 rather than the repository's MIT licence.

The preview uses actual lines 100-018 and 100-020 to demonstrate a bold speaker
name, italic Standard and mixed emphasis. The installed engine selects one font
per text box; mixed inline styles still require engine measurement/wrapping/drawing
support. The handoff provides styled runs without inventing supported Yarn syntax.
Fonts are not registered in production. Compiled pixel/advance checks cover all
380 glyphs; native export verification is retained with the study.

## Wooden inventory and simpler icons — r27

The user rejected r25's ornate UI. [R27](../art/studies/interface-r27/index.html)
replaces the icon frames with a simple wooden case, purple velvet compartments and
original native-pixel object icons. It includes an empty inventory grid, a lens-only
proof matching items.yaml, empty/composite compact toolbar skins, and plain wood
text-frame tiles. The approved portrait surround remains unchanged. Editable projects
separate objects from cloth.

The purple ramp proposes a 68-colour budget, preserving all 64 original RGB values
and moving white to the final palette index as the compiler requires. Shared production
palette and registration are unchanged. Inventory-grid and toolbar-layout engine work
are required; measurements and palette remapping notes are documented in the study.
R26 remains the typography proposal. R27 awaits visual review.

## Painted symbolic UI — r28

The user found r27 too flat/crude. [R28](../art/studies/interface-r28/index.html)
adds painted walnut, restrained brass fittings and folded purple velvet, with clearer
symbols: an ivory pointer, printer's hand and Victorian calling-card speech bubble.
Preferred 32×32 icons and independent 24×24 alternatives are supplied. The case and
icons remain separate editable assets. This study awaits visual review.

The 32-pixel proposal requires coordinated engine sizing/hitbox/layout changes;
the current engine remains at 24. Both manifests are isolated, and the view 250
proposal only covers its inventory icon: retain the existing cursor loop during
integration. The r27 additive palette proposal, r26 typography and approved portrait
surround remain unchanged. Exact generation prompts and native export checks are retained.

## Native bitmap typography research — r29

The user rejected r26's uneven glyph quality. R26 is a rasterized Libertinus
adaptation, not an original typeface; compilation parity was insufficient visual QA.
[R29](../art/studies/typography-r29/index.html) compares upstream X.Org native bitmap
New Century Schoolbook and Times at 10px/12px in four styles, preserving all source
pixels, BBX bearings, DWIDTH spacing and baselines. Source licences/checksums and an
integer-scale baseline-guide proof are included. New Century Schoolbook 12px is the
approved family as of 2 October. `export-selected.ts` delivers four PNG atlases and
per-character metrics; 380 glyphs are checked against decoded PNG pixels. Faithful
integration must preserve source metrics rather than squeezing letters into 8px cells.
The current SCI font representation has only glyph width and cannot represent the
original independent advance/negative bearing. No runtime registration has occurred.
