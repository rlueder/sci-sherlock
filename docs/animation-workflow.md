# Animation workflow: preserve v6, redraw the motion

**Walk review, 1 October:** [r14 is rejected](../art/studies/holmes-r14/README.md):
Holmes dances in place and the shoulders appear to separate from the torso.
The next pass must establish one connected rough body and measured foot contacts
before rendering the coat or additional directions. The linked review records the
tutorials read, the failure in the head/collar replacement method, and the revised
sequence. Its timing suggestion is withdrawn; do not integrate its view 200.

**Current idle review:** [r10](../art/studies/holmes-r10/README.md) implements thinking,
cap adjustment and pocket-watch retrieval against the fixed model. Complete pose
drawings supply the active arm, while named chin-contact, cap-lift and downward-head
variants address the reviewed gestures. A shared torso plate preserves body width.
Master v2 adds the permanent watch chain, including in the approved puff.
Current priority: Holmes walking is next, ahead of further cast and room art. The ordered queue in docs/art-delivery-status.md supersedes the earlier walking-last instruction.

**Current character workflow:** use the [fixed Holmes master](../art/reference/holmes-master-v2/README.md).
The later r7 review found head, colour and body-width drift between independently
generated poses. Pin the approved r6 neutral model; reuse exact linked cels for
unchanged content and draw coherent pose variations with the master beside them.
The new layered puff preserves every character pixel and makes the smoke brighter
against the room. Walking and gesture identity cleanup remain pending. Earlier
generation methods below are recorded experiments, not the current production rule.

For setup, vocabulary, exercises and reproducible examples, start with the
[art learning guide](art-learning-guide.md). This page records the specific methods
and review decisions for the workshop.

Decision after the 1 October 2026 motion review. The v6 composition remains locked.
The r3 extraction establishes likeness and scale; its walk and clock motion are
rough studies, not approved animation. Passing the palette and reconstruction checks
does not establish believable motion.

The subsequent perspective review permits localized geometric corrections, especially
the foreground desk's left side. V6 remains the style, scale and composition reference;
the original stays intact for comparison. See the perspective construction stage below.

## Open-source tools

| Tool | Use in this project | Official documentation |
|---|---|---|
| Pixelorama, MIT | Final native-pixel animation: previous/next-frame onion skins, separate body/clothing layers, loop tags, frame timing, existing .pxo → PNG workflow. Keep the verified 1.2.3 export pin. | [Timeline](https://pixelorama.org/user_manual/user_interface/timeline/), [source/license](https://github.com/Orama-Interactive/Pixelorama) |
| Krita, GPLv3 | Optional rough pose planning and foot-contact study, then PNG guides for Pixelorama. Its manual includes a walk-cycle exercise and moving the figure while keeping the planted foot at the same ground position. | [Animation and walk-cycle guide](https://docs.krita.org/en/user_manual/animation.html), [license](https://krita.org/en/about/license/) |
| Krita drawing assistants | Preferred 2D room-construction tool: vanishing points, two-point perspective, grids and brush snapping; save room guides as .paintingassistant files. | [Painting with assistants](https://docs.krita.org/en/user_manual/painting_with_assistants.html), [saving assistants](https://docs.krita.org/en/reference_manual/tools/assistant.html) |
| fSpy | Optional camera matching from selected image edge directions, with an official Blender importer. Use for a consistent room/prop blockout, not automatic correction of distorted drawings. | [Official site and Blender integration](https://fspy.io/) |
| Blender, GPL | Simple dimensional guide for the clock, with a fixed hinge and a camera fitted to the approved room. Optional posed mannequin for character reference. Guides are painted over at native resolution; they do not set the finished rendering style. | [Projection](https://docs.blender.org/manual/id/3.0/editors/3dview/navigate/projections.html), [bone constraints](https://docs.blender.org/manual/en/latest/animation/armatures/posing/bone_constraints/introduction.html), [license](https://www.blender.org/about/license/) |

OpenToonz's [Plastic tool](https://opentoonz.readthedocs.io/en/latest/create_animations_using_plastic_tool.html)
can deform a drawing with a mesh and skeleton. It is an optional rough-motion tool,
not the recommended final pixel renderer here: interpolating a textured cutout still
needs silhouette and pixel-cluster cleanup. None of these tools automatically solves
the pose design.

## Room perspective: construct before repainting

Krita's Vanishing Point and 2 Point Perspective assistants directly provide the digital
equivalent of drawing construction lines toward distant points on paper. Use them on
an overlay above the reference, with separate guide colours for the two directions.
Perspective grids help compare tabletop planes. Save the assistants with the room art.

The foreground desk's left side needs local review: build one coherent box for the
tabletop, then derive its thickness, apron and legs from that construction. Do not fix
each visible edge independently or stretch the whole extracted desk to hide the issue.
Fit the intended geometry before redrawing its original materials and detail.

1. Work from the 4:3 display image for the perspective study. Its coordinates map back
   to native 320×200 by x/3 and y/3.6 for the existing 960×720 reference. Do not confuse
   square-pixel 320×200 display distortion with a drawing error.
2. Establish a candidate eye-level horizon from several reliable room edge families.
   Treat this as a drawing study, not an already measured camera calibration.
3. Extend edges belonging to the same parallel direction to a common vanishing point.
   For horizontal directions, the vanishing points share the horizon. Furniture rotated
   relative to the room may need its own pair of points on that horizon.
4. Place points well outside the image where appropriate for restrained convergence.
   Check the desk plane, thickness and leg attachment points together. Keep the familiar
   framing, scale, palette and lighting.
5. If the painted edges cannot support a consistent guide, choose and document the
   intended construction. fSpy can help fit a camera from consistent edge selections;
   it cannot make contradictory painted lines simultaneously correct.
6. For the clock, transfer the chosen construction into a Blender blockout, fit its
   closed pose, and animate its real hinge and thickness. Paint over guide frames.
7. Redraw only the agreed local regions at native pixel resolution in Pixelorama.
   Preserve the original v6 file and record a correction mask for before/after review.

The desk correction is authorized by the user's perspective feedback; it is not a
request to regenerate the entire room. Room artwork and collision/hotspot changes
remain separate responsibilities.

## Holmes: replace the cutout leg swing with drawn poses

The historical r3 implementation rotates leg fragments, keeps most of the torso frozen,
and adds a one-pixel rise. It preserves the reference appearance but lacks a convincing
transfer of weight, foot roll and coordinated clothing movement. Do not keep tuning
the same fragment rotations as the final animation method.

1. Keep v6 beside the animation as the model sheet: same character height, head/body
   proportions, palette and signature. Follow the [costume brief](holmes-costume.md).
   Redraw the whole standing figure coherently when needed; do not freeze the old
   torso and graft limbs onto it.
2. Rough the two contact poses, then down, passing and up poses for each half of the
   stride. Start with an eight-pose working study; this is a planning choice, not a
   fixed engine requirement; the current contract is standing cel 0 followed by walking cels.
3. Establish the feet and pelvis first. Show heel contact, the planted support foot,
   toe-off and swing-foot clearance. Match horizontal travel to stride length and timing.
4. Draw the torso's restrained weight shift, shoulder response and coat hem movement.
   Holmes can retain a hand at his lapel, but the body cannot remain a rigid cutout.
5. Use onion skins to check arcs, consistent limb lengths, overlaps and the last-to-first
   transition. Draw clean pixel clusters on the final palette; do not smooth the result.
6. Review both in place and translating across a ground guide. A planted foot should
   stay fixed in world space during contact; an in-place loop alone cannot establish that.
7. Resolve final cel count and measured travel timing with engine integration, then export matching
   full-canvas cels and anchors. Finish one direction before propagating it to the others.

## Clock: construct the turn in space

`art/source/reference-r3.ts` currently maps each source column to a width multiplied
by `cos(angle)`. All rows retain their original y. This is a flat card narrowing in an
orthographic front view, without a side face, thickness, rear face or depth-dependent
projection. It is not a perspective-correct opening of the illustrated cabinet.

Preserve the approved closed cel and opening position. Block out the intended concealed
hinged clock unit as a rigid object with depth, then fit the guide camera to that closed
view. Keep the hinge line stationary. Show the appropriate side/back surfaces as the
front turns; all edges must follow the same projection. A turning front surface can
foreshorten, but the case's physical dimensions must not shrink.

Use closed, quarter-open, half-open and fully-open guide poses to establish geometry,
then draw the required 6–8 native cels with consistent side shading and opening
occlusion. No broad repaint of the approved background. Do not animate the dial and
pendulum as loose components. Inspect the motion in the room and in isolation, including
the last frame held over the revealed passage.

## Delivery and checks

Keep editable pose/blockout sources, Pixelorama masters, PNGs, manifest and provenance
together. The game build consumes only checked PNGs; Krita and Blender are authoring
tools, not runtime dependencies. Keep the existing shared 64-colour palette and binary
alpha. Verify the untouched approved areas and closed reference before reviewing motion.

The [clock perspective study](../art/studies/clock-perspective-r4/README.md) now
demonstrates the Blender construction: packed editable scene, eight rigid hinge poses,
an indexed-pixel export, Pixelorama master and interactive construction overlay. It is
a separate study; final side drawing, visual approval and integration remain pending.
The [r5 workshop study](../art/studies/workshop-r5/README.md) retains a rejected
character experiment. Even with a projected leg guide, attaching limbs to an old
torso produced bad anatomy. The [r6 replacement](../art/studies/holmes-r6/README.md)
starts with complete re-rendered figures. Review whole-pose anatomy and costume,
then draw transitions; numerical guide accuracy cannot substitute for that review.

The r6 costume poses were subsequently approved. The [r7 motion study](../art/studies/holmes-r7/README.md)
maps major joints on those figures before rendering complete animation frames. It
includes editable 2D skeleton/volume guides, four idle loops, a six-cel walk study,
per-frame joint annotations and native Pixelorama export verification. The walk's
foot contact and the watch's pocket transitions remain production work; do not treat
file validation as motion approval.
