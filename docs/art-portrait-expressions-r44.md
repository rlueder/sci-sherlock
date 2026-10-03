# Portrait expression handoff — r44

3 October 2026. Candidate art lives in `art/studies/portraits-r44/`; the interactive proof is
its `index.html`. This implements the facial portion of `portrait-expressions-brief.md`.

**User correction after the brief:** remove the portrait habits. There is no space for hand
and prop gestures in these busts. Do not register final habit loops or make the head bigger
relative to shoulders to fit them. Expressions, talking, blinking and glances remain.

## Resource contract

| View | Character | Expression count | Loop count | PNG cels |
|---:|---|---:|---:|---:|
| 210 | Watson | 6 | 36 | 132 |
| 211 | Mrs Hudson | 4 | 24 | 88 |
| 212 | Toby | 6 | 36 | 132 |
| 213 | Holmes | 6 | 36 | 132 |

`expressions.json` gives exact names, order and first loop. For expression index E, base=6E:
base+0 right bust, +1 right mouth, +2 right eyes, +3 left bust, +4 left mouth, +5 left eyes.
Mouth cel 0 is closed, 1 slightly open, 2 open, 3 wide. Eyes 0 open, 1 half, 2 closed,
3 toward, 4 away, 5 down. Neutral remains expression 0, so its existing loop offsets survive.

All cels: 56×64, anchor [0,0], binary alpha, shared r27 68-colour palette. Surround and frame:
72×88 at [-8,-18]; never mirror either. Draw surround → bust → mouth → eyes → frame.
Clear/redraw the bust before overlays; transparent regions do not erase a preceding cel.
Recordings should select mouth cels by loudness and return to 0 during silence. Use the
line's expression for both the bust and its mouth/eyes—mixing expressions produces mismatches.

Every expression's mouth and eye rectangles are in right and left coordinates in the manifest;
`landmarks.json` also records the lip line, corners, chin and pupils. The PNGs are full canvas
replacement overlays, not tightly packed crops. The original four neutral files are preserved
byte-for-byte; new saved masters are hash-locked and still awaiting visual approval.

## Listener and timing

The review puts one portrait in each bottom corner of a 320×200 room, with the listener at
70% opacity. Use the same-size faces when dimming, as demonstrated; do not change head/body
proportions. Listener reaction expressions use the same named resource set.

A useful initial blink is half 60ms → closed 110ms → half 90ms → open, separated by varied
3–6 second holds. Hold a glance for roughly 400–750ms and return to open. These are integration
starting points, not an animation that cycles all six eye cels. The HTML mouth test is silent
and synthetic; it does not implement runtime audio analysis or claim voice synchronisation.

## Validation and remaining work

- 22 saved expression masters; 4 neutral files byte-identical to r23.
- 484 candidate PNG cels; exact palette and dimensions checked.
- Every closed mouth/open eye pair reconstructs its bust exactly in both facings.
- Changed mouth/eye pixels remain inside their own regions; brow and facial silhouette remain fixed during those overlays.
- Four native Pixelorama projects; 396 actual native-export composites compared pixel-for-pixel.
- Browser proof supports expressions, reactions, side swapping, paused cels and both facings.

Art review remains separate from these checks. Inspect closely related expressions at game
size before registration. No production manifest, YAML, Yarn or runtime files are changed by
this handoff. The engineer owns registration, line-expression tags and audio-driven timing.
