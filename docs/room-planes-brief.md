# Room planes brief: 221B as rooms seen through rooms

2 October 2026. From the game side, for the art session. It follows the
[camera brief](room-camera-brief.md) and keeps everything in it (the front-on, level
camera, the horizon at y 0 by shifting the view, Holmes at full size with his feet at y 176,
the scale check and the deliverables), and adds one idea: **depth from planes**.

## The idea

A reference from a television interior: the camera faces the set square on and stays level,
and the depth comes from rooms seen through openings, not from a floor that runs away from
the camera.

- In front, the room the actor is in: a table and chairs, him standing near the camera.
- In the middle, a wide arch with fretwork and the door frames: a band across the picture
  you look through.
- Beyond, a sitting room through the arch and another room through a doorway at the side,
  each with its own light and windows.

The actor stays in the front room, so his size hardly changes as he moves; the depth is in
the set. That's what the game needs: people walk on a shallow floor and keep a steady size,
and the room still looks deep.

## 221B in three planes

London houses of the time often had a front and back room joined by wide folding doors.
221B can be painted that way, front-on:

1. **The front room, where everyone is.** The sitting room people walk in: Watson's
   armchair, the desk in the foreground, the door to the landing, the fireplace with the
   lens on its mantel. With a front-on camera the side walls run into the room, so the
   fireplace and the landing door go on them, or on the back wall either side of the
   opening.
2. **The opening.** The folding doors folded back, or an arch, across the back of the front
   room: a frame you look through, painted as **its own layer**, so that anyone passing
   behind it is hidden by it and the room beyond reads as farther away.
3. **The back room.** Seen through the opening and never walked in: Holmes's chemistry
   bench, bookshelves, a window onto the back of the house with the fog in it. Its own
   light (a lamp, the window's blue) and a little less contrast than the front room, so it
   sits back.

Where things are now in the r13 room (the bench, the window, the shelves) can move between
the front and back rooms as suits the composition. What the game needs in the front room is
listed below.

## The front room's floor

- People walk only in the front room, on a band across it from about **y 160** at the back to
  **y 195** at the front. With the camera brief's numbers, Holmes is about **91%** at the back
  of that band and **111%** at the front: a steady size, which is the point.
- Nobody walks into the back room in the teaser. Its floor still follows the same camera, so
  a figure painted or placed there (if one is ever added) would be the size the rule gives
  for its depth: about 65% to 77% for a back-room floor between y 115 and y 135.
- The desk in the foreground stays outside the band, or the band is cut around it.
- Mrs Hudson and Toby come in by the landing door and stop on the band; Holmes leaves by it.
  It needs clear floor in front of it, inside the band.
- Watson's chair is in the front room, and seated Watson is fitted to it from the camera as
  before.

## Life in the back

A little movement in the back room helps the depth: the window's fog drifting, a lamp's
flame, steam from the chemistry bench. Each is a small animated view, as the fire and the
workshop's lantern are, placed in the back room with its own priority.

## Layers

- The background: the back room and everything that's never in front of anyone.
- The opening (doors or arch): its own layer, with a priority just in front of the back
  room's floor, so anyone behind the frame is hidden by it.
- The front room's foreground: the desk, a chair back, anything people pass behind, as
  layers with their priorities, as in r13.
- The props as in the camera brief (fire, lens on the mantel, door, seated Watson), plus any
  back-room animations.

## Scale check

As in the camera brief, with Holmes at the four corners of the front room's band and in the
middle, and one more figure: a person standing in the back room, drawn at the size the rule
gives for where its feet are, to check the back room is painted at the right scale even
though no one walks there.

## Baker Street

The same idea suits the street when it's redone: the pavement in front, where people walk;
the railings, steps and lamp as a band in the middle; the road and the cab beyond; the far
houses in the fog. People walk on the pavement and the cab waits in the road beyond it, and
the scale stays steady along the pavement.

## On the game side

Nothing in the engine changes for this: pictures already have layers with priorities, and
the camera brief's single perspective line (`perspective: { horizon: 0, fullSize: 176 }`)
sizes people in the front room. If a later scene has someone walk into a back room, the
engine can gain size zones (a walkable area with a size of its own) for it.
