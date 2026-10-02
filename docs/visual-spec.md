# Visual elements: what the teaser needs

Every image *The Stopped Clocks* needs, with the numbers, sizes and states the engine
expects. The art direction (style, palette, references, room briefs) is in
[teaser.md](teaser.md); this is the list of deliverables and the contract each one has to
meet. The export rules for every PNG are in [art-workflow.md](art-workflow.md).

**Visual lock, 1 October 2026:** the user selected the exact
[workshop v6 composition](../art/approved/workshop-v6/README.md). Its character scale,
background elements, proportions and pixel treatment take precedence over conflicting
size guidance below. The r2 adaptation is rejected visually despite passing technical
checks. Extract and animate the approved artwork; reconstruct only occluded regions.

The user's later perspective review also authorizes localized geometry corrections
to the foreground desk and the clock's opening. Preserve v6 as the style/scale reference
and use [perspective construction guides](animation-workflow.md) to make those corrections
in a new version; do not reinterpret the whole room.

**Who does what.** The art director makes every image and registers it in `art/art.json`.
Engine integration is done separately (in the rooms' YAML and Yarn, and in sci-ts where
the engine needs to grow): where actors can walk, what blocks them, foreground depths,
hotspots, approach points, scaling, dialogue and menu layout, cursors, the inventory, and
choreography. The art doesn't need to encode any of that; it does need to make it
possible, which is what the notes on each item are for.

The current delivery queue and review/handoff distinctions are tracked in
[Art delivery status](art-delivery-status.md).

## Numbers

| Range | Resource | Use |
|---|---|---|
| 100–103 | picture | the four rooms |
| 104–105 | picture | title screen, end card |
| 200–209 | view | people walking and standing |
| 210–219 | view | portraits |
| 220–239 | view | props and animations in rooms |
| 240–249 | view | close-ups (inspection views) |
| 250–259 | view | inventory items |
| 260–269 | view | cursors and interface pieces |
| 270–279 | view | additional workshop atmosphere |
| 1–5 | font | 1 regular dialogue; 2 reserved for titles; 3 bold; 4 italic; 5 bold italic (proposed registration) |

Pictures and views are separate number spaces. 990–999 belong to sci-ts's library (its
default cursors) and stay free. Register a number only when its PNGs exist.

## Rules every image follows

- One shared palette of at most 64 opaque colours (`art/palette.json`), black first and
  white last. Transparency is alpha 0; nothing in between.
- Rooms are 320×200; every layer of a room is full size.
- Every cel of one loop has the same canvas size (export with trimming off).
- **Anchors** (`[x, y]` in the manifest) are the pixel the engine places at an object's
  position. For anything standing on the floor (people, the tall-case clock, the
  lantern) it's the point between the feet, or where the base meets the floor: that pixel
  is what's sorted by depth and what walks along the floor's edge.
- People are drawn to the room's scale where they stand nearest the camera. The engine
  scales them down further back, so leave no detail that only works at full size.

## Rooms

Each room is a background (priority -1000) plus foreground layers. A foreground layer
covers actors whose feet are above (smaller y than) its priority. Draw each foreground as
its own layer whenever an actor can walk both in front of it and behind it. One layer has
one depth, so split furniture that sits at two depths. For each room, the engine side
draws the floor polygon and obstacles to the picture, and needs from the art:

- a **floor** that reads as a walkable band, with its edges where furniture meets the floor;
- **no interactive object** painted only in the background if it changes state (opens,
  disappears, lights up): those are props;
- **clue regions** large and clear enough to click (8×8 pixels at the least), readable in
  greyscale.

### Picture 100: 221B Baker Street, the sitting room

| Element | How | Notes |
|---|---|---|
| Background | picture 100, layer -1000 | Fireplace and mantel, the door (closed), chemistry bench, violin, Persian slipper, correspondence on the mantel, Watson's armchair (empty: he is a prop) |
| Foreground | picture 100, one layer per depth | Near chair or table edge the hero passes behind; give each its floor y |
| Fire | view 222, 4 cels, loop | Only the flames and their light on the hearth move |
| Lens on the mantel | view 223, 1 cel | Taken: the engine hides it, so the background under it is the bare mantel |
| Door | view 225, loop 0: 4–6 cels opening; cel 0 closed | Toby and Mrs Hudson come in through it; the background shows the frame, not the door |
| Watson, seated | view 205, loop 0: 1 standing cel, loop 1: 3–4 cels (turning a page) | Sits in the armchair; drawn to fit it exactly |

Interactive, from the art alone: violin, chemistry bench, slipper, correspondence,
fire, window, door, lens, Watson.

### Picture 101: Baker Street

| Element | How | Notes |
|---|---|---|
| Background | picture 101, -1000 | Fog bands, 221's warm doorway, the street, the hansom and horse in profile (static) |
| Foreground | picture 101, layer at the railing/lamp's floor y | The near railing and lamp post, if actors pass behind them |
| Gas lamp | view 226, 3–4 cels, optional | A slow flicker; can be a single cel |

Holmes and Watson walk side-on to the cab and leave east: the floor should allow a
straight path from the door to the cab.

### Picture 102: Thorne's workshop (delivered as a style proof)

The [first illustrated revision](../art/production/workshop-r2/README.md) delivers the
background and near-table foreground (provisional depth 181), revised Holmes, lantern
(220, 4 cels), tall-case door (221, 8 cels), filings (227), scratches (228), and the 3:17
close-up (240, temporarily also registered as 224 for existing room compatibility).
Native exports and the existing headless playthrough pass; the new composition still
needs engine-side floor, hotspot, depth and scaling integration plus visual sign-off.

| Element | How | Notes |
|---|---|---|
| Background | picture 102, -1000 | Wall clocks at 3:17, window (latched), bolted door, bench, the dark gap behind the tall-case clock left for the door prop to cover |
| Foreground | picture 102, the bench (and any near shelf) | Each at its own floor y |
| Lantern | view 220, 4 cels | Housing fixed, flame and light move |
| Tall-case door | view 221, 6–8 cels | Cel 0 shut, last cel fully open; the hinge stays put; the opening behind is in the background, dark |
| Filings | view 227, cel 0: a patch; cel 1: the trail toward the case clock | The engine shows cel 1 once Holmes has used the lens |
| Scratch marks | view 228, 1 cel, optional | Beside the case clock's base, revealed with the trail |
| Watson, standing | view 201 | He is in this room for the deductions |

### Picture 103: The hidden stair

| Element | How | Notes |
|---|---|---|
| Background | picture 103, -1000 | Near-black framing, steps going down, a thin warm edge from above |
| Holmes's pause | view 204, loop 2 or a single cel | Holmes from behind at the top of the stair; can reuse a north-facing cel of view 200 if it reads |

### Pictures 104 and 105: title and end card

| Element | How | Notes |
|---|---|---|
| Title screen | picture 104 | The title painted in, or space left for it drawn in font 2 |
| End card | picture 105 | "To be continued", painted or set in font 2 |

## People

Walking views have four loops in this order, which is how the engine turns them:
**0 east, 1 west, 2 south (toward the camera), 3 north (away)**. West may be east mirrored
(`{ "link": 0, "mirror": true }`) if the costume and light allow. In each loop, cel 0 is
standing still and cels 1 onward are the walk cycle. Every cel in a view has the same
anchor, between the feet.

| View | Who | Loops | Notes |
|---|---|---|---|
| 200 | Holmes (character redraw under review) | 4: standing + 6 walking each | Age 58–62; grey temples and nape; deerstalker and black clay pipe. Approximately 106 px tall in the approved workshop composition |
| 201 | Watson | 4: standing + 4–6 walking each | Broader, warmer waistcoat; at least east/west walking, the rest may start as standing cels |
| 202 | Mrs Hudson | 4: standing + 4–6 walking each (east/west first) | Walks in through the door of 221B |
| 203 | Toby Vance | 4: standing + 4–6 walking each (east/west first) | Hunched, oversized work coat |
| 204 | Holmes, gestures | loop 0: reaching to open the clock (4–6 cels); loop 1: kneeling with the lens (2–4 cels) | Same anchor and scale as view 200, so the engine can swap views without a jump |
| 205 | Watson, seated | see 221B | |
| 206 | Holmes, idles | loop 0: pipe puff; 1: hand to chin; 2: cap adjustment; 3: pocket watch | Play sparingly while standing, once, then return to view 200; interrupt for movement |

The r2 60-pixel figure and 14-colour reduction were rejected. Match Holmes's actual
scale and rendering in the locked v6 composition; reconcile placement on the engine
side instead of shrinking the figure. The age request
(58–62) remains, confined to face and hair. Do not reinterpret the approved room or
apply further global colour/detail reduction.

**Subsequent walk review:** the approved torso is three-quarter toward the player,
so the legs and shoes must use that same orientation, with separate near/far depth.
Holmes wears a long overcoat: its skirts overlap the thighs and respond to the stride.
Do not put full-profile legs under the three-quarter torso or hold the coat as a short
rigid jacket. The r5 character animation was rejected for anatomy: attaching new
limbs to the original torso is not an acceptable production method. Re-render the
entire figure in each coherent pose, then animate. The [r6 study](../art/studies/holmes-r6/README.md)
contains replacement key poses, not completed loops. Its 72×120 transparent canvas
preserves the intended figure height and anchor. Eight-cel walking cadence and view
206 remain proposed integration changes, not silent runtime edits.

The r6 costume poses are now user-approved. The subsequent [r7 animation study](../art/studies/holmes-r7/README.md)
maps major joints first, then uses complete-figure frames for the requested idles and
a six-cel east walk. Its eight-pose construction guide is separate from the final
six selected cels. The walk's contact/stride and watch retrieval transition still
require work before runtime integration.

**Costume:** follow the [1895 clothing and canonical pipe brief](holmes-costume.md).
Keep the deerstalker as the requested signature; use a black clay pipe for the
workshop, period wool tailoring, high-waisted trousers and a waistcoat pocket-watch
chain. Apply these consistently to all full-figure redraws and animation frames.

**Identity consistency:** the [fixed character master](../art/reference/holmes-master-v2/README.md)
pins the approved r6 neutral sprite and its exact colours. The r7 walk is too narrow
in its first half, and separate generated poses vary in head shape and colour placement.
Use the pinned master, named head-angle variants and material ramps for whole-pose
redraws. Exact linked cels preserve genuinely unchanged content; they do not justify
grafting limbs onto an incompatible torso. The stronger layered pipe puff is the first
proof: 26 timeline frames with zero changed opaque character pixels. Walk and gesture
cleanup remain pending. Smoke must remain legible against the actual workshop background.

The [r10 idle revision](../art/studies/holmes-r10/README.md) now supplies thinking, cap
adjustment and watch retrieval for review, returning to the exact neutral sprite.
Unchanged regions are locked and linked in Pixelorama; the affected chest and arm
are coherent pose redraws. Master v2 includes the watch chain in neutral and puff assets. R10 adds actual chin
contact, a cap lift without torso thinning and a downward glance at the watch.
The puff is user-approved. Review the remaining idles
before resuming walking, as requested; runtime integration remains separate.

The [r11 investigation study](../art/studies/holmes-r11/README.md) adds four keys each
for reaching to the clock and kneeling with the lens (view 204). Full-body drawings,
major-joint overlays, native sources and timed review previews are included; visual
review and case-travel choreography remain pending. The [r12 clock finish](../art/studies/clock-r12/README.md)
adds native side/back joinery, a descending threshold and explicit 3:17 handset angles
to the fixed-hinge construction. These are review sources, not production approval.

## Room camera and cast continuity

The [221B r13 study](../art/studies/baker-street-r13/README.md) begins room 100 and the
Watson, Hudson and Toby references. Cameras may vary by room: 221B uses an oblique
entrance composition while the workshop keeps its frontal view. Preserve palette,
native resolution, pixel aspect and character proportions across those changes.
Keep a separate camera/vanishing-point guide for each room and fit animated rigid
props to the final painting. The r13 blockout is intended geometry, not a solved
projection of every generated edge; departures remain visible for review.

R13 includes room layers, fire/lens/door states, three neutral cast models and seated
Watson, with model hashes, head crops and joint overlays. Required page-turn,
portrait and directional animation contracts remain outstanding. No production
manifest or room YAML is replaced by this study.

## Additional workshop atmosphere review

The subsequent user request adds a perspective repair to the **cabinet under the
window**, light exterior weather, lamp flicker, an occasional mouse from several
starting points, and swinging grandfather-clock pendulum motion. The [r9 study](../art/studies/workshop-r9/README.md)
delivers separate layers and editable sources for those additions. Its rain is
clipped to the true glass panes at 16 native pixels/second; a 64-second sky-colour
cycle moves through overcast and clear conditions. The mouse has direction-specific
cels, three furniture-occluded routes and a route/mask inspection control.
The foreground desk remains unchanged from r5. The requested pendulum motion is
switchable in the review. Its isolated manifest now uses views 270–277, leaving
260–269 free for interface assets. Resolve its active story state against the original
stopped-clock clue before runtime integration. Clock hands remain fixed.

## Portraits

Characters who speak get a portrait beside their lines: Watson (view 210), Mrs Hudson
(211), Toby (212), and Holmes (213, added by the user on 2 October). The r23 study saves
a neutral master for each character before building its individual mouth cels. Each
portrait view has six loops: right-facing parts in 0–2 and their left-facing counterparts
in 3–5. All facial cels use the same 56×64 canvas, registered at `[0, 0]`
(the top-left corner):

| Loop | Content | Cels |
|---|---|---|
| 0 | the bust, framed if the frame is part of the design | 1 |
| 1 | the mouth only (everything else transparent) | cel 0 closed, then 2 open shapes |
| 2 | the eyes only | cel 0 open, then 1–2 blink cels |
| 3–5 | left-facing counterparts of loops 0–2 | matching cel counts |

While a line is up, the engine cycles the mouth and blinks the eyes over the bust; when it
ends, the mouth closes. The approved ornate r22 surround is a separate 72×88 image
drawn at [-8,-18] from the facial origin. Select the inward-facing portrait and dialogue
side from the speaker’s screen position at line start, then hold it for that line. This
placement and surround policy still need engine integration.

The r23 masters are stored in `art/studies/portraits-r23/source/masters/`, with source
hashes in `models.json` and individual lip/chin coordinates in `landmarks.json`. Mouth
cels must derive from these masters and change only the named character’s mouth
region. Never reuse one character’s mouth stamp on another face.

## Close-ups

| View | What | Notes |
|---|---|---|
| 240 | The 3:17 dial (224 compatibility alias pending engine migration) | 120×112, shown centred over the workshop; it must make the deliberate stopping readable |
| 241 | The filings under the lens, optional | If the lens moment needs its own image |

Close-ups are anchored `[0, 0]`; the engine places and dims around them.

## Inventory

| View | What | Notes |
|---|---|---|
| 250 | The lens | Loop 0: the icon (24×24) for the inventory; loop 1: the cursor while using it (16×16 or smaller, anchor at the glass's centre) |

The inventory window itself is drawn by the engine in palette colours unless a frame is
supplied (below).

## Interface

The engine draws text boxes and menus itself, from the palette (a background colour, a
text colour and a one-pixel border) and a font. To make them belong to the game rather
than to the engine:

| Element | How | Notes |
|---|---|---|
| Dialogue font | Approved: New Century Schoolbook 12px, r29; ASCII 32–126, four styles | Original BDF pixels, BBX bearings and DWIDTH advances; ascent 11, descent 3, line height 14. PNG atlases plus JSON metrics. The old 8×12/rightmost-ink contract is superseded; engine support is required before registration |
| Title font | font 2, optional | Same format, larger, for the title and the end card |
| Box colours | three palette colours: paper, ink, border | Chosen from the shared palette; named in a note to the engine side |
| Box frame | view 260, optional: 8 cels (4 corners, 4 edges) | Corners and edges of a frame for text boxes and the topic menu, tiled by the engine |
| Cursors | views 261–264: walk, look, use, talk; 265: wait | 16×16 or smaller, one cel each; mark the hotspot as the anchor. Without these, the library's default cursors are used |

### Approved typography — 2 October 2026

The [implementation handoff](art-interface-implementation.md) defines the data and
engine changes needed to deliver this selection without altering its pixels.

Use [r29's selected family](../art/studies/typography-r29/README.md#approved-delivery)
for new dialogue and interface work. Regular is body text, bold is the speaker or
short heading, italic is a publication title or emphasis, and bold italic is available
when both apply. These are four original bitmap faces, not synthetic transformations.
Preserve the font's pixels and spacing; do not compress glyphs into an eight-pixel cell.
The 12px design needs a 14px line box to accommodate its ascent and descent.

The authoritative masters are the unmodified upstream BDF files, with their retained
Adobe/DEC licence; the PNGs are reproducible exports, not hand-painted replacements.
This font delivery uses BDF masters instead of Pixelorama. Export JSON is an art handoff
format, not an already-supported engine manifest. See r29's handoff for bearing-aware
drawing, width measurement and inline style requirements. Reserve font 2 for the
existing title role; r26's proposed numbering is retired.

## What to hand over, and how it's checked

For each element: the PNG exports, the `.pxo` master, its entry in `art/art.json` (number,
loops, cels, anchors, foreground priorities), and its line in `art/credits.csv`. Then:

1. `pnpm art check art/art.json` passes: palette, alpha, sizes, anchors.
2. On the engine side the element is placed: floor and obstacles traced, depths tuned,
   hotspots set, lines and choreography written. `pnpm preview` plays the scene headless
   and writes review frames.
3. Review in the running game (`pnpm dev`), at native size and 4:3: feet on the floor at
   every point of the walkable area, both sides of every foreground, portraits beside a
   long line, clues in greyscale.

Delivering in this order lets each step be tested in the engine as it arrives: Holmes and
the workshop (revised), then the 221B room with Watson and the lens, Toby and Mrs Hudson
with their portraits, Baker Street, the stair and the end card, then the interface.
