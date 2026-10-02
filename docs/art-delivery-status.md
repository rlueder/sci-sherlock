# Art delivery status — 1 October 2026

The workshop is in the game as of `975b29c`. The approved workshop v6 remains the
style and scale reference. Technical validation, visual approval and integration
are separate statuses.

## In the game

`art/art.json` registers r9's room 102 and foreground layers, master v2 Holmes
(200), r11 investigation gestures (204), r10/master v2 idles (206), r12 opening
clock (221), and r9 atmosphere (270–277). The teaser already implements the four
rooms, dialogue, cast interactions, music and sound. Rooms 100, 101 and 103 and
cast views 201–203/205 still use stand-ins.

The engineer will switch the room base to r12's
[background-clean.png](../art/studies/clock-r12/export/background-clean.png) and
pick up the corrected pendulum hands next. Both clean backgrounds and all 24
corrected pendulum cels are delivered in `0d5284a`; see the
[handoff notes](../art/studies/clock-r12/README.md#clean-room-handoff-correction).
The registered r9 pendulum paths already refer to those corrected source files.
Do not use r12's background-study.png: that review composite includes Holmes.

## Ordered art queue

This order supersedes the earlier instruction to leave walking until last.

| Order | Deliverable | Available | Next work |
|---|---|---|---|
| 1 | Status and setup | Workshop registration recorded here; AGENTS.md read; dependencies installed in the isolated art worktree | Keep this document current and use Conventional Commits |
| 2 | Holmes walk, 200 | Fixed master v2; game loops repeat the side standing cel; [r14 rejected](../art/studies/holmes-r14/README.md) for dancing motion and disconnected shoulders/torso | [r16 construction](../art/studies/holmes-r16/README.md) verifies connected guides and ground contacts, but raster trials still fail; finish consistent east drawings before other directions; retain 72×120 and [36,113] |
| 3 | Reach/case timing | r11 has four reach cels; r12 has eight opening cels; game currently plays these sequentially | Review contact in the combined room and deliver concrete frame timing or extra contact cels |
| 4 | 221B, 100 | r13 room/foreground, fire 222, lens 223, door 225 with shut cel 0, camera-fitted seated Watson 205 | Review layer/prop placement, finish Watson page-turn loop; engine moves floor and hotspots to fit |
| 5 | Cast 201–203 | r13 fixed neutral models and guides | Watson standing/walking for rooms 101–103; Hudson and Toby west arrival walk first, then remaining directions; Holmes's scale |
| 6 | Portraits 210–212 | Contracts agreed | Watson, Hudson, Toby; 56×64, anchor [0,0]; bust loop 0, mouth loop 1 (closed cel 0), eyes loop 2 (open cel 0) |
| 7 | Street 101 and stair 103 | Existing room briefs and playable stand-ins | Layered pictures; near railing/lamp-post foreground on street, gas lamp 226, hansom in picture |
| 8 | Title 104 and end card 105 | Required screens identified | Original finished artwork |
| 9 | Interface | Engine supports every listed format | Font, frame/colours, cursors, icon bar and inventory lens; contracts below |
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
| Portraits 210–212 | 56×64, [0,0]; bust/mouth/eyes loops 0/1/2 |

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
