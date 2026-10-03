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

## The stair: a secret passage, not a hallway

The stair is the passage hidden behind Thorne's tall-case clock. r40's layout is right: the
way in on the left, the stairwell straight ahead going down out of sight, the lamp on the
back wall, the walls closing in. Keep all of that, and the walking strip and scale with it.
What's wrong is the furnishing: a hall table, an umbrella stand, coat pegs with a scarf and
a runner make it a front hall people pass through every day. Nobody furnishes a hidden
passage. Suggested changes, all within the same layout:

1. **The left: the back of the clock, not a door.** The rough, unpainted planks of the case's
   back, with iron strap hinges and a pull ring or an iron latch to open it from this side.
   A slot or knot-hole with the pendulum bob swinging past would tie in with the ticking the
   scene talks about (a small loop, like the lamp's).
2. **The right: the mechanism and signs of Thorne, instead of the hall furniture.**
   - The works that open the clock from inside: a counterweight on a chain over a pulley,
     and a lever.
   - A low shelf or a crate with a candle stub, a tinderbox, a few clockmaker's tools,
     perhaps a coil of brass wire.
   - A single iron hook with a leather work apron, in place of the pegs and scarf: Thorne
     came this way.
3. **The walls: older than the shop.** The stair's text already says so ("Older than the shop
   around them"). Bare brick or crumbling lime plaster, damp streaks, perhaps a bricked-up
   arch: an older building the shop was built over.
4. **The floor: bare, worn boards, no runner.** Scrape marks in an arc where the clock swings
   open, and the brass filings carrying on from the workshop to the top step, so the trail
   the player followed leads all the way here.
5. **The lamp: one for a passage, not a hall.** A tin lantern on a hook or a candle in a plain
   wall sconce, recently lit, like the warm lantern in the workshop: someone was here not
   long ago. Keep r40's flicker and its pool of light.
6. **The stairwell: rough, not turned.** A plain square post or a rope handrail in place of the
   turned newel, or nothing at all.
7. **Cobwebs everywhere but the way through**, from the clock to the top step: a route that's
   used, through a space that isn't.

On the game side, the stair's hotspots stay as they are; `entranceDoor` becomes the back of
the clock, and its line will change to describe it once it's painted that way. If the
hook, shelf or mechanism should be clickable, give their rectangles in the handoff.

## The end card

The "To Be Continued" card (picture 105) is drawn over r19's stair, with the case clock on
the left. It should show the same passage as the stair room before it: a darkened version of
the revised stair (above) would match.

## Not needed

The bookcase in 221B's back room has a hotspot in r33's handoff but no line yet; that's on
the game side. Nothing else in the four rooms is missing.
