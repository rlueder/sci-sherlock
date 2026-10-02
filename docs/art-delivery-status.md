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
| 9 | Interface | r20 font sheet, frame/colours, five cursors, icon bar and lens | Review legibility and register approved resources separately |
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
| Dialogue font | PNG sheet of 8×12 cells for character codes 32–126; register under fonts |
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
