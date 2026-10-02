# Sherlock Holmes in *The Case of the Clerkenwell Clocks* (a teaser)

A short, original adventure, about fifteen minutes long, built to test everything sci-ts can
do: talking portraits, topic menus, story flags, cutscenes, music and sound. Holmes and
Watson, Mrs Hudson and 221B are Arthur Conan Doyle's, now in the public domain; the story,
its people and everything in it are new. (Nothing from later adaptations: no films, no TV.)

## The story

London, a November evening in 1895. Fog to the windowsills.

Toby Vance, a clockmaker's apprentice, arrives at 221B in a state. His master, the
Clerkenwell clockmaker **Elias Thorne**, has vanished from his workshop. The door was bolted
from the inside, the window latched, a lantern still burning on the bench. Every clock in the
shop has stopped, all of them at **seventeen minutes past three**.

Holmes takes the case. At Thorne's workshop the clues add up to something nobody else
noticed: one of the clocks did not stop, it was *stopped*, and a tall-case clock that should
weigh a hundredweight swings at a touch. Behind it, stairs go down into the dark.

*To be continued.*

## Rooms

1. **221B, the sitting room.** Evening, firelight. Watson reads by the fire; Mrs Hudson shows
   Toby in. Things to look at (the violin, the chemistry bench, the Persian slipper with the
   tobacco, the jack-knifed correspondence on the mantel). Holmes's lens is on the mantel.
2. **Baker Street.** Fog, a gas lamp, a hansom waiting. Holmes and Watson leave for
   Clerkenwell.
3. **Thorne's workshop.** Clocks on every wall, all at 3:17; the lantern; the bench, sawdust,
   brass filings; the bolted door; the tall-case clock.
4. **The hidden stair.** One screen, a single line, the end card.

## How it plays

- **Talking to Toby** (a topic menu): his master, the locked door, the clocks, the lantern.
  Asking about each sets a flag; when Holmes has heard enough, a new topic appears: *"We
  shall go at once."*
- **The lens:** take it from the mantel (a flag). Without it, the brass filings are just
  dust; with it, Holmes sees they lead to the tall-case clock.
- **Deductions, with Watson** (a topic menu that grows): each clue Holmes has seen adds a topic
  (*"The clocks were stopped by hand"*, *"The filings lead to the case clock"*). With both, the
  last one appears: *"The case clock is a door."*
- **The cutscene:** Holmes opens the clock; it swings out; the camera holds on the dark; Watson
  says the last line; the end card.

What it exercises: features and exits, a character walking in, three characters with
portraits (Watson, Mrs Hudson, Toby), two topic menus with conditional topics, flags set and
tested across rooms, a cutscene with walking, facing, waiting and sound, room music (a quiet
theme for Baker Street, a ticking one for the workshop).

## Art direction: lamplight and evidence

Production direction, refined with the user on 1 October 2026: a detailed, moderately
cartooned Victorian adventure. The latest user references are **LucasArts Indiana Jones**
and **Monkey Island**. For this pass, interpret these as *Indiana Jones and the Fate of
Atlantis* and the early *Monkey Island* games: expressive silhouettes, gently exaggerated
anatomy, appealing room shapes and selective painted detail. Those specific installments
are the art director's interpretation of the user's series references.

**The Lost Files of Sherlock Holmes** and **Return of the Phantom** remain references for
period interiors and mystery atmosphere. They must not pull the character proportions
or rendering back toward photographic realism. The original engine prototype was too
crudely cartooned; generated versions 2 and 3 had overly realistic proportions. The user
wants surface detail between those versions, with more stylization in the shapes themselves.
The user liked the actual 320×200, 64-colour version 4 conversion, then revised the
anatomy preference toward more realistic body proportions. This latest refinement
supersedes the six-head character study: preserve the illustrated pixel treatment and
approved palette, with a smaller relative head/hands and natural torso/leg balance.
The [version 6 workshop study](../art/studies/workshop-v6/README.md) adds
the user-requested deerstalker and pipe to version 5, preserving its natural body proportions
and the same 320×200/64-colour treatment. It is the current visual handoff, not a replacement
for the playable assets. Carry both accessories into the eventual character sprites.

Warm amber, tobacco brown and worn paper inside; slate, muted teal and cold fog outside.
Use readable painted materials, modestly exaggerated furniture silhouettes, natural
body proportions and strong drawn profiles. Permit gently stylized perspective
while keeping a coherent inhabitable room. Avoid both rubbery extreme distortion and
photographic texture. The clock opening introduces a dark recess within that space.

Translate the reference qualities to the current 320×200 scene rather than promising
another game's detail level. *The Crimson Diamond*, *The Drifter* and *Kathy Rain 2* remain
secondary studies for readability, staging and lighting. *Animal Well* remains a workflow
reference. See [the research and reference hierarchy](art-research.md).

Use **Pixelorama** for final layered art and animation, with optional Krita thumbnails and
Blender perspective guides. Retain scripts for repeatable patterns and draft geometry.
This replaces the earlier requirement that every finished image be painted by code.
The entire required workflow remains open source and builds from committed PNG exports.
Generation experiments are optional and described in the research; no model or cloud
service is a build dependency.

### Image rules

- **Gently stylized perspective.** Establish a coherent room and readable walking plane,
  then use modest exaggeration in trim, furniture legs and silhouette rhythm. Keep
  depth cues consistent; avoid fisheye, rubbery architecture and extreme convergence.
- **Natural character proportions.** Latest user preference: roughly seven to seven-and-a-half
  heads tall, proportionate hands, natural shoulders and torso/leg balance. Keep an angular
  coat and purposeful posture. Realistic anatomy should still use economical drawn pixels;
  do not reintroduce photographic skin texture or extra shades.
  Furniture may be a little chunky and characterful while remaining usable at this scale.
- **Painterly pixel shading.** Model form with controlled tonal ramps and selective
  texture for wood, plaster, cloth, brass and skin. Use broad restful colour areas
  alongside selective detail; avoid both crude flat geometry and photographic microtexture.
  Faces and materials must read as drawn. Detail should serve material, depth and evidence.
- **320×200 room canvas**, presented by the current player at 4:3. Check faces and round
  clock dials in both native and aspect-corrected previews before locking proportions.
- **At most 64 opaque colours, shared across the game.** Preserve the current olive,
  walnut, burgundy, slate-blue and amber direction. Black and white count toward the
  limit; transparency does not. The existing 32-colour palette remains valid, and can
  gain deliberate intermediate shades up to this cap. The manifest's `maxColours: 64`
  enforces the budget during validation, game build and native export. Choose colours
  globally; do not generate a separate adaptive palette for each room or animation cel.
- **Author on the actual pixel grid.** Rooms and their foreground layers are exactly
  320×200; preview at native size and nearest-neighbour 4:3 enlargement (e.g. 960×720).
  No high-resolution detail masquerading as pixels. Keep Holmes at the approved roughly 106-pixel
  standing height on a 72×120 canvas, anchor [36,113]; express faces, hands and cloth with economical clusters.
  No smoothing, partial alpha, automatic dithering, photographic grain or painted bloom.
  Local hand-placed dithering is allowed where it helps model a material. Generated
  high-resolution studies are composition references and do not satisfy these constraints.
- Clear value groups: quiet background, readable actors, selective bright clue accents.
  Dither only where deliberately drawn; avoid automatic dithering, soft edges and
  single-pixel noise across large surfaces. Fog is made of controlled colour bands and
  sparse shapes, not transparent blur.
- Stylized, expressive and economical figures. Holmes is a long, angular silhouette with a narrow
  dark coat; Watson is broader with a warmer waistcoat. Mrs Hudson has an upright silhouette
  and pale apron; Toby's hunched shoulders and oversized work coat communicate distress.
  Build original faces and clothes from the story's period, without actor likenesses.
- Fixed cameras. Keep walking largely across shallow floor bands to reduce scaling shimmer.
  Use the locked workshop character scale and natural proportions; the earlier
  48–64-pixel starting estimates are superseded. Leave space above figures for the
  room’s architecture and reconcile walkable placement without shrinking Holmes.
- Distinguish interactive objects by shape, placement and value as well as colour.
  Clue information must survive a grayscale review. A one-pixel sparkle is decoration,
  never the only way to find something important.

### Room briefs

| Picture / room | Composition and emotion | Separate elements and gameplay checks |
| --- | --- | --- |
| **100 — 221B** | Eye-level view into a lived-in room. Fire and Watson form one warm group; door and Toby's arrival form a second. Mantel and lens are readable between them. Quiet clutter in the chemistry and violin areas rewards looking without competing with faces. | Base plus foreground chair/table edge. Separate fire, lens, seated Watson, Mrs Hudson and Toby. Keep a continuous entry path; the lens must disappear after taking it. Check portrait overlays against the mantel and entry. |
| **101 — Baker Street** | Cold transition: large fog shapes, one gas lamp, 221B's warm door behind us and a hansom in profile ahead. The street should read in a few seconds. | Base plus near lamp/rail layer; optional small lamp animation. Horse and cab can remain static in this teaser. Stage a short side-on departure, then cut to Clerkenwell; no scrolling ride required. |
| **102 — Thorne's workshop** | Hero composition and first production test. Bench/lantern to one side, tall-case clock in the opposite third, wall clocks tying them together. A dark route between them permits walking and draws the eye toward the eventual opening. | Base, foreground bench, lantern, tall-case door and exposed stair opening. The shut door covers the opening; do not paint a second door into the base. Make bolted door, latched window, dial and filings separate readable clue regions. |
| **103 — Hidden stair** | Fourth background: near-black framing, receding steps and a narrow warm edge from above. The opening and Holmes's pause carry the image. | One held composition, then text/end card. Reuse the workshop opening's design, but budget this as a separate finished screen. No fifth room or unseen underground set. |

All clock hands remain at **3:17**, including during idle loops. At this resolution the
minute hand points a little past III toward IV; the hour hand lies slightly past III.
Include one enlarged dial inspection view so the precise time and evidence of deliberate
stopping are readable. This inspection is implemented in the prototype through Yarn
show/hide commands and must be preserved when its artwork is revised.

Filings are readable as a patch before the lens, and identified as a trail after inspection.
The lens changes what Holmes can infer, not whether the player can find the hotspot. The
wrongly light clock, scratch marks and trail should support the final deduction together.
Never solve the mystery solely through dialogue about an invisible detail.

### Cast and animation budget

The complete list of visual elements, with numbers, sizes, loops and states, is
[visual-spec.md](visual-spec.md); the table below is the initial budget it grew from.

These are initial production caps, to revise after the first in-engine test:

| View ID | Asset | Initial delivery |
| --- | --- | --- |
| **200** | Holmes | Four directional loops, each with standing cel 0 plus 6 walking cels; west may mirror east after costume/light review. Add a separate short reach/open gesture only for the reveal. |
| **201** | Watson in rooms | Seated idle for 221B; standing and short side-on travel coverage for the street/workshop. Other directions can start with standing cels; stage routes to fit delivered coverage. |
| **202–203** | Mrs Hudson, Toby | Standing silhouettes and 4–6-cel arrival walk coverage on a rehearsed path. Limit idle movement to an occasional gesture. |
| **210–212** | Watson, Mrs Hudson, Toby portraits | Shared 56×64 canvases (aligned with the visual spec): one bust, 3 mouth cels including closed, 3 eye cels including open, all registered at `[0,0]`. Test against the current dialogue layout before painting details. No Holmes portrait required for this teaser. |
| **220** | Lantern | 4 cels; keep the metal housing fixed, alter flame/light clusters. |
| **221** | Tall-case door | 6–8 cels, consistent hinge and ground contact; final frame holds open. Separate from the background. |
| **222** | Fire | 4 cels localized to the hearth. |
| **223** | Lens on mantel | One removable cel. Its taken state follows the story flag on room re-entry. |
| **224** | Dial inspection | One readable close-up; precise clue details agreed with writing before polish. |

Picture and view IDs occupy separate resource namespaces. Reserve these IDs in the art
manifest as assets are delivered; do not register filenames for assets that do not exist.
Keep interface/library IDs such as views 990–999 out of the game art range.

Walk loops use the existing east/west/south/north order. Tune `cycleSpeed` against movement
speed in the engine; editor frame durations do not automatically survive export. Never
animate the stopped clocks. Spend motion on people, fire, lantern and the reveal.

### Graphics and story workflow

[The graphics workflow](art-workflow.md) specifies the directory layout, manifest format,
palette mapping, export settings and runnable commands. Keep one source of truth for
each kind of data:

| Data | Owned by |
| --- | --- |
| Shapes, colours, animation drawing, layer separation | Pixelorama `.pxo` masters and reviewed PNG exports |
| Resource numbers, cels, anchors, foreground priorities | `art/art.json` |
| Room placement, hitboxes, walk polygons, obstacles | `rooms/*.room.yaml` |
| Dialogue, deductions, flags, reveal choreography | `rooms/*.yarn` |
| Clue legibility, composition and animation approval | Art direction review in the running game |

`pnpm art check art/art.json` validates the current palette and delivered
exports. `pnpm art build art/art.json` produces an art-only archive plus a
Pixelorama-importable GPL palette file. Sherlock's `resources.ts` imports the manifest
through the existing game resource hook. `pnpm dev` builds and serves the workshop
at <http://127.0.0.1:5173/>; [controls and commands](../README.md).

The workshop style proof now includes 36 PNGs and five editable Pixelorama 1.2.3 masters:
layered room, standing/walking Holmes, lantern flicker, eight-frame clock reveal and the
3:17 close-up. Both clues gate the reveal and revisiting preserves the open clock. The
lens is already held in this isolated scene, and Watson is offscreen. This exercises the
art pipeline and YAML/Yarn integration; the complete four-room route is still planned.

## Sound direction

Keep music and effects authored separately from graphics, with MIDI generation available
through scripts as originally planned. Begin with a quiet Baker Street motif and a sparse
workshop cue. A rhythmic score may suggest clockwork, but stopped clocks must not appear
to be audibly ticking. Let the workshop's lack of ticking be a clue. The door's creak and
the silence after it should carry the reveal. Agree any chime with the story before using it.

## Production gates

1. **Workflow foundation — implemented in this change.** Research, draft palette, exact
   PNG-to-SCI importer, manifest validation, game-build integration and CI check.
2. **Style proof — revision required after user review.** The implemented workshop has
   working walking, lantern, occlusion, clues and reveal; all 36 PNGs round-trip through
   Pixelorama 1.2.3. Its cartoon-like geometry and figure are not the approved direction.
   First revise a workshop still with a standing Holmes: coherent gently stylized
   perspective, expressive proportions and selective painted material shading. Review at native resolution and
   4:3 beside the three primary references. Then revise walk frames and the clock hinge
   motion to match. Do not propagate the old style into the other rooms.
3. **Playable investigation.** Block out all four rooms; connect YAML/Yarn, lens state,
   Toby topics and Watson deductions. Test current library support for portrait composition,
   animation cues and the inspection close-up before commissioning polished coverage.
   The engine's library target is being developed alongside this plan; acceptance is a
   working scene, not merely the presence of a compiler field.
4. **Art production.** Finish 221B, street and stair after the workshop sets the standard;
   complete cast portraits, required walk coverage, clue details and interface treatment.
   Recheck each room with an actor and a dialogue box. Defer extra weather, parallax,
   dynamic lighting and nonessential gestures until the whole teaser plays.
5. **Reveal and polish.** Verify the hinge across every frame, actor/door depth, sound cue,
   held opening and final line. Rehearse the complete fifteen-minute route with a new player.
   Native export automation is available; preserve its pixel-equivalence check as art evolves.

## Verification and definition of done

The final target is a headless playthrough from 221B to the end card, checking flags and
lines, in CI with no external game files. Add gameplay checks for the lens before/after
taking it, persistence when revisiting 221B, both deduction prerequisites, and reveal
completion without leaving input locked. This full Sherlock test is **planned**. The current
workshop test already covers walking, lantern frames, inspection visibility, zero/one/two
clue gating, reveal completion, return of input and persistence on revisiting.

Art acceptance also requires visual review: exact 3:17 dials; readable lens and filings;
no accidental colour changes across rooms; stable feet; no halo pixels or palette drift;
foreground overlap on both sides of the bench; aligned portrait eyes/mouth; no duplicate
door behind its animated prop; and legible ending text. Review native and 4:3 frames,
with dialogue visible and in grayscale. Export validation catches technical mistakes;
it does not prove composition, movement or clue readability.
