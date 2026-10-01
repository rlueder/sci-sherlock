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
| 1–2 | font | dialogue, titles |

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
| 200 | Holmes (first illustrated revision delivered) | 4: standing + 6 walking each | Age 58–62; grey temples and nape; deerstalker and pipe. 48–64 px tall at the front of a room |
| 201 | Watson | 4: standing + 4–6 walking each | Broader, warmer waistcoat; at least east/west walking, the rest may start as standing cels |
| 202 | Mrs Hudson | 4: standing + 4–6 walking each (east/west first) | Walks in through the door of 221B |
| 203 | Toby Vance | 4: standing + 4–6 walking each (east/west first) | Hunched, oversized work coat |
| 204 | Holmes, gestures | loop 0: reaching to open the clock (4–6 cels); loop 1: kneeling with the lens (2–4 cels) | Same anchor and scale as view 200, so the engine can swap views without a jump |
| 205 | Watson, seated | see 221B | |

The r2 60-pixel figure and 14-colour reduction were rejected. Match Holmes's actual
scale and rendering in the locked v6 composition; the older 48–64 px guidance above
must be reconciled on the engine side instead of shrinking the figure. The age request
(58–62) remains, confined to face and hair. Do not reinterpret the approved room or
apply further global colour/detail reduction.

## Portraits

Characters who speak get a portrait beside their lines: Watson (view 210), Mrs Hudson
(211) and Toby (212). Holmes needs none. Each portrait view has three loops, all cels the
same canvas size (about 56×64; one size for all three portraits), registered at `[0, 0]`
(the top-left corner):

| Loop | Content | Cels |
|---|---|---|
| 0 | the bust, framed if the frame is part of the design | 1 |
| 1 | the mouth only (everything else transparent) | cel 0 closed, then 2 open shapes |
| 2 | the eyes only | cel 0 open, then 1–2 blink cels |

While a line is up, the engine cycles the mouth and blinks the eyes over the bust; when it
ends, the mouth closes. The dialogue box goes to the portrait's right, so keep the subject
facing right or forward.

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
| Dialogue font | font 1: a PNG sheet of characters 32–126 | One row of glyphs per line of the sheet, a fixed grid cell (e.g. 8×12), each glyph's width marked by its rightmost ink. Period serif or a clear small font; must read at native size |
| Title font | font 2, optional | Same format, larger, for the title and the end card |
| Box colours | three palette colours: paper, ink, border | Chosen from the shared palette; named in a note to the engine side |
| Box frame | view 260, optional: 8 cels (4 corners, 4 edges) | Corners and edges of a frame for text boxes and the topic menu, tiled by the engine |
| Cursors | views 261–264: walk, look, use, talk; 265: wait | 16×16 or smaller, one cel each; mark the hotspot as the anchor. Without these, the library's default cursors are used |

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
