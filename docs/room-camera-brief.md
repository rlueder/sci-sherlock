# Room camera brief: repaint 221B front-on

2 October 2026. From the game side, for the art session. Applies to 221B (picture 100)
first, and to Baker Street (101) when it's redone; the same rules suit any room people walk
around in.

## The problem

In the game, a figure's size comes from where its feet are on the screen. That only works
when depth on the floor goes straight up the screen: everything at the same height on the
screen is the same distance away.

The r13 sitting room doesn't do that. Its guide camera is turned 26° to the side
(`art/studies/baker-street-r13/guides/perspective.json`), so the floor recedes diagonally:
the window wall and Watson's chair on the left are much farther away than the door on the
right, at the same height on the screen. The painting doesn't keep to the guide camera
either: the door and the mantelpiece are painted bigger than it predicts.

The game now copes by measuring sizes across the floor (Holmes is 70% by the chair, 95% by
the door, at about the same height on the screen). That's correct for the painting, but
walking straight across the room makes Holmes visibly shrink or grow, which reads as wrong:
players see movement across the screen as movement across the room.

Adventure games avoid this by painting rooms for it: the camera faces the back wall, the
floor goes back up the screen, and walking left or right never changes anyone's size.

## The camera

Build the room in Blender first and paint over the render, as for r13, with these changes:

- **Facing the back wall square on:** no yaw, no roll. The back wall, the mantelpiece, the
  edge of the rug and other lines across the room are horizontal on the screen. Lines going
  into the room meet at one vanishing point on the horizon, near the middle (x about 160).
- **Level, with the view shifted down:** keep the camera's pitch at 0, so vertical lines
  stay vertical, and use the camera's vertical shift (Lens > Shift Y) to put the horizon at
  the top of the screen, **y 0**. Don't tilt the camera down to frame the floor: tilting
  makes verticals converge and breaks the size rule.
- **Height to suit:** with the horizon at y 0 and Holmes (1.85 m) drawn at full size, 106
  pixels, with his feet at y 176, the camera is about 3.1 m above the floor. It's a stage
  view, looking over the furniture into the room. Native pixel aspect stays 1.2, canvas
  320 × 200.

With that camera, a figure's height is in proportion to how far below y 0 its feet are. The
game uses one line for the whole room: `perspective: { horizon: 0, fullSize: 176 }`.

## The floor

- The floor people walk on is a band across the room, from about **y 145** at the back to
  **y 195** at the front. On that band Holmes is about **82%** at the back and **111%** at
  the front: a mild range that pixel art can take. Don't let the walkable floor go much
  higher up the screen than y 140 (he'd be under 80%).
- Keep foreground furniture (the desk) outside the band, or cut the band around it, so feet
  never land on a painted top.
- The fireplace on the back wall, Watson's armchair, the window, the bench, the door to the
  landing and the desk in the foreground stay; their arrangement can change to suit the new
  camera. The door needs a clear floor in front of it: Mrs Hudson and Toby walk in through
  it and stop on the floor, and Holmes leaves by it.

## Scale check

Put a Holmes stand-in in the Blender scene, at the four corners of the walkable band and in
the middle, and deliver a review image with the game sprite (view 200, 106 px at full size)
drawn at those places at the sizes the rule gives. Holmes should look right against the
mantelpiece, the armchair, the door and the desk at every one of them. Watson seated in his
chair (view 205) is fitted to the chair from the same camera.

## Deliverables

- The background, and foreground layers with their priorities, as for r13.
- The props redrawn for the new camera: the fire (222), the lens on the mantel (223), the
  door's swing (225), and seated Watson (205).
- `guides/perspective.json` with the horizon y, the full-size y (176), the camera height and
  the vanishing point, plus the Blender file.
- The scale-check image, and a suggested walkable polygon and the door's arrival point.

When it's registered, the game side sets the perspective line above, fits the floor and
hotspots, and checks Holmes walking across and into the room in rendered frames.
