# Full-body cast idles — r46

The discarded portrait habits supply three body gestures: Watson smooths his
moustache, Mrs Hudson smooths her apron, and Toby twists the cap in his hands.
Portrait animation remains facial only. Holmes's masters, walk and idles are unchanged.

Review `index.html` for the animated room, both facings, frame stepping, neutral
comparison and joint overlays. This is an art study pending visual review, not a
production registration. The room proof places everyone at the same foot depth.

## Fixed references

- Watson: r42's approved 97px standing model, not the older broader r13 sprite.
- Hudson and Toby: r13's original standing models.
- All: 72×120, anchor `[36,113]`, shared 64-colour palette, displayed pixel aspect 1.2.
- `registration.json` pins the input references and every saved key by SHA-256.
- Heads, feet and lower garments outside each explicit variation mask remain exact.
  Watson's mask allows the hand to overlap the lower face at the moustache.

## Authoring and reproduction

1. Built-in OpenAI ImageGen redrew complete figures with anatomically connected
   sleeves and hands. `generated/` retains the original transparent sheets;
   `prompts.json` and `generated/watson-inbetweens-prompt.txt` retain the prompts.
   Watson has an extra sheet for the approach to his face.
2. `prepare.ts` is the **explicit authoring step**. It quantises to the shared
   palette and uses one scale per character across the sheet. The unchanged feet
   determine registration. It retains each full registered drawing and combines
   the coherent moving region with the locked reference outside the mask.
   Watson's final stroke uses the saved registered first-sheet arm with a 2px
   upward and 2px left alignment to reach the fixed moustache; the contact key
   also moves 2px left. No limb rotations, synthetic
   arm segments, per-frame stature fitting or cross-fades are used.
3. `source/*-key-*.png` are saved static references. `build.ts` checks their hashes
   and only sequences those drawings. It does not redraw a character on rebuild.
4. `guides/` and `animation.json` retain shoulder–elbow–wrist estimates over the
   saved poses. Inspect contact points, silhouette and shoulder attachment first;
   these annotations are visual checks, not a solved anatomical rig.
5. Editable Pixelorama projects have a linked, locked fixed layer and a complete
   moving-region layer. The real Pixelorama exporter is compared pixel-for-pixel
   against the right-facing PNG sequence. Left-facing output is its exact mirror.

Run from the repository root:

```sh
# Only when deliberately replacing the authored keys:
node --import tsx art/studies/cast-idles-r46/prepare.ts
# Normal reproducible export:
node --import tsx art/studies/cast-idles-r46/build.ts
pnpm typecheck
pnpm art check art/studies/cast-idles-r46/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/cast-idles-r46
```

## Implementation handoff

Candidate views **207 Watson**, **208 Hudson**, **209 Toby** were unassigned in
this checkout. Confirm they are still free against current main before registering.
`art.json` is a standalone candidate manifest; it does not change `art/art.json`.

Each view has loop 0 facing right and loop 1 mirrored left. Each cel is a complete
72×120 sprite at `[36,113]`. Play once at **10 fps**, including repeated cels as
holds; `animation.json` supplies every filename and exact duration. Cel 0 and the
last cel match the character's neutral pose exactly. Restore the original actor
view/loop afterward, preserving position, scale, priority and facing. Use Watson's
r42 view 201 neutral so the switch does not change his stature.

Proposed scheduling: choose an 18–35 second quiet interval independently per
character, only while standing and unoccupied. Stop or defer on walking, scripted
actions and dialogue; no simultaneous idle over a walk. Use the gesture only for
the supplied right/left three-quarter stance. Do not reuse these drawings for
front/back, seated Watson, or a different prop state. Toby's gesture requires his
cap already in hand. The review page deliberately loops faster than this schedule.

Technical checks cover palette, anchors, fixed pixels, neutral return and editable
source round trips. They do not replace visual approval of the movement.
