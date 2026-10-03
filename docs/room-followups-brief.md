# Room follow-ups brief: what the new rooms still need

3 October 2026. From the game side, for the art session. 221B r33, Baker Street r41, the
workshop r34 and the stair r40 are now in the game. Putting them in turned up a few things
the paintings don't have yet. The game works without them, but each one loses something
the story or the room used to have.

## 221B: the violin, the slipper and the correspondence

r33 doesn't paint three of Holmes's things that have lines in the game. Those lines are
parked in `rooms/parked/100.yarn` until the art has them:

- **The correspondence**: unanswered letters fixed to the mantelpiece with a jack-knife
  ("The Musgrave Ritual"). The mantel is now on the left, above the fire; the letters go on
  its front edge or the wall just above it.
- **The violin**: laid across a chair or the table, not in a case. The line says "laid
  across a chair". The armchair has Watson in it, so a second, smaller chair would work, or
  the line can change to wherever it goes.
- **The Persian slipper**: hung by the fireplace or on the mantel, where Holmes keeps his
  tobacco in its toe.

Each needs to be big enough to click: about 10 × 10 pixels at the least. They're part of the
background painting, so no new views are needed, only their rectangles in the handoff. If one
of them goes in front of where people walk, give it an occlusion layer like the chair's.

## Workshop: the clock that's still going

The story turns on the tall-case clock: every other clock is stopped at 3:17, and this one's
pendulum still swings although its hands don't move. Holmes says so ("Its pendulum swings,
yet its hands stand at seventeen past three"). r34's closed clock (view 221, cel 0) is a
still picture, so the pendulum doesn't swing in the game now.

- **Needed:** a pendulum loop for the r34 clock: the pendulum and the glass in front of it
  only, as a small patch placed over cel 0, like the stair lamp's flicker. The old r12
  pendulum (view 272) swung about a second each way; something similar.
- It stops when Holmes opens the case: the game switches to the reveal cels then.

## Workshop: the mouse and the weather at the window

r34's handoff says the old mouse route and window overlays need refitting, so they're out
of the game for now:

- **The mouse** (view 273) ran between pieces of furniture, hidden behind them by an
  occlusion layer in the old picture. It needs new hiding places in r34's room, an occlusion
  layer for them, and the route between them in room coordinates.
- **The rain and the clouding sky** (views 270 and 274) were full-screen overlays fitted to
  the old window. r34's window is at [12, 20, 67, 98]; new overlays would cover only that.

## The end card

The "To Be Continued" card (picture 105) is drawn over r19's stair, with the case clock on
the left. The stair is now r40's dark hall, with a plain door and no clock, so the card shows
a different place from the room before it. A darkened version of r40's stair would match.

## Not needed

The bookcase in 221B's back room has a hotspot in r33's handoff but no line yet; that's on
the game side. Nothing else in the four rooms is missing.
