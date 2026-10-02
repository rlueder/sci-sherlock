# Art delivery status — 1 October 2026

The approved workshop v6 controls style and scale. This is an art review queue;
passing a file check does not imply visual approval or game integration.

Synced with main through `4e307cc`: all four rooms, cast interactions, music and sound
are implemented. Rooms 100, 101 and 103 and character views 201, 202, 203 and 205
currently come from [stand-ins](../placeholders.ts). The art tasks below replace those
existing resources; they do not require recreating the rooms or dialogue.

| Order | Deliverable | Current source | Remaining work |
|---|---|---|---|
| 1 | Holmes investigation gestures | [r11](../art/studies/holmes-r11/README.md): four whole-body keys each for reach and kneel, full-body joint overlays, timed review loops | Visual review of weight/coat/lens; synchronize reach with the moving case |
| 2 | Clock reveal finish | [r12](../art/studies/clock-r12/README.md): eight perspective cels with native walnut surfaces, reverse joinery, dark threshold and 3:17 handsets | Visual review; clean background and matching r9 pendulum handsets now supplied in the r12 handoff |
| 3 | Settle idles, then walk | [r10](../art/studies/holmes-r10/README.md), [fixed master v2](../art/reference/holmes-master-v2/README.md) | Puff approved; other idles await review. Rebuild walking last, preserving coat volume and camera orientation |
| 4 | Production handoff | Sources and contract map below | One consistent room/clock/actor set; approved exports, credits, native sources and integration notes |
| 5 | 221B and Watson | [r13](../art/studies/baker-street-r13/README.md): room/foreground, four fire keys, removable lens, six door keys, seated Watson, camera and joint guides | Room perspective and cast review; page-turn keys; integration |
| 6 | Mrs Hudson and Toby | [r13](../art/studies/baker-street-r13/README.md): fixed neutral figures, head crops, palette indices, scale and joint guides | Model review; directional drawings and arrival walks; portraits including Watson |
| 7 | Baker Street and concealed stair | [Room 101](../rooms/101.room.yaml), [room 103](../rooms/103.room.yaml), [room briefs](teaser.md#room-briefs) | Room layers, gaslight/fog as specified, stair transition |
| 8 | Title, end card and interface | [Visual spec](visual-spec.md) | Screens, dialogue font, cursor assets and optional frames |

## Current contract map

| Resource | Review source | Contract |
|---|---|---|
| Holmes 200 | master v2; walk deferred | 72×120, anchor [36,113], 106px standing height; four directional loops |
| Gestures 204 | r11 | Reach loop 0 and kneel loop 1; four unique keys each; timing separate |
| Idles 206 | r10 plus master v2 puff | Puff 0, think 1, cap 2, watch 3; same canvas/anchor |
| Clock 221 | r12 | 88×168, anchor [60,150], eight angles; fixed world hinge [292,150] |
| Workshop 102 | r9 corrected handsets; r12 background-clean.png for reveal | 320×200, separate foreground/occlusion and mechanism |
| Atmosphere 270–277 | r9 | Rain 270, lamp 271, pendulum 272, mouse-right 273, sky 274, away-right 275, left 276, away-left 277 |
| UI 260–269 | Future | Reserved for frame and cursors; no atmosphere IDs |
| Portraits 210–212 | Future | Shared 56×64 canvas, anchor [0,0]; bust/mouth/eyes separate loops |

The r9 atmosphere manifest has been renumbered into 270–277 to remove its collision
with UI resources. Existing runtime files are not changed by this art-study remap.

Do not concatenate individual study manifests into a production bundle: r9 has a
full closed-case pendulum while r12 supplies a differently sized opening case, and
r11's preview timing is separate from its four unique cels. The handoff must define
which case is visible in each state and use one corrected handset texture for both.
The story still determines when a pendulum may move. Those integration decisions
belong in the separate engine session, after the art is reviewed.

The engineer's two dial blockers are resolved in the
[r12 clean-room handoff](../art/studies/clock-r12/README.md#clean-room-handoff-correction):
r9's character-free background carries the three wall handset repairs; all 24
pendulum cels match the r12 tall-case dial. The new r12 background-clean.png adds
the descending threshold without Holmes or other actor overlays. Runtime resource
replacement remains with the implementing session.
