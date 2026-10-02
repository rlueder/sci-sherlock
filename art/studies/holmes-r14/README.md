# Holmes r14 — rejected walk study

Reviewed 1 October 2026. **Rejected; do not integrate view 200 from this folder.**
The user found that Holmes dances in place and that his shoulders and torso almost
separate. The fixed master remains the approved appearance reference. The new
front/back drawings are candidates, not approved production standing poses.

## What failed

- Eight separately generated body poses did not establish a reliable alternating
  support leg or a continuous stride. The east contact sheet has a conspicuously
  raised knee and large changes in coat opening and shoulder silhouette.
- `convert.ts` registers each figure using its cap centre and lowest opaque foot
  pixel. This is image alignment, not a ground-contact constraint. It cannot tell
  which foot carries weight or preserve the intended pelvis trajectory.
- The conversion replaces the top 32 rows with the standing head/collar and adds
  a separate one-pixel bob. The torso below comes from a different pose. This
  creates a structural seam: identical head pixels do not ensure that the neck,
  shoulders and ribcage remain connected. Do not repair this by extending the patch.
- The Blender overlay was a pre-drawing guide; the final poses were not fitted to
  its joints. Displaying it over a sprite did not validate that sprite's anatomy.
- The preview's 40/20 px/s travel was not derived from measured foot displacement.
  Its engine timing suggestion is withdrawn. Slowing the playback cannot fix these
  construction errors.
- Three unique directions were rendered before one direction worked in motion.

Palette, canvas, mirror and native-export checks passed. Those checks establish
file correctness only. They do not establish acceptable animation.

## Tutorials read before the next attempt

[Krita: Animation with Krita](https://docs.krita.org/en/user_manual/animation.html)
walks through rough keys, onion skins and inbetweens. Its moving-cycle exercise
marks ground contacts and adjusts placement frame by frame to keep the planted
foot at the same world position. We need that contact check in the moving preview.

[Animation Mentor: Animating a Basic Human Walk Cycle](https://www.animationmentor.com/blog/tutorial-animating-human-walk-cycle/)
(Jason Martinsen, published 7 July 2025) describes contact, down, passing and up
keys; hip movement with chest counter-rotation; foot-roll cleanup; and arm overlap
after body mechanics. Read the published written tutorial notes; the embedded
video has not been reviewed. The motion principles apply to our Blender/Krita/
Pixelorama workflow without adopting Maya.

## Next attempt: one rough direction first

The following is our application of those lessons, not a claim that a replacement
walk has already been produced.

1. Keep the approved height, torso width, long overcoat and three-quarter east
   orientation. Construct a single connected mannequin with fixed limb lengths,
   pelvis and ribcage volumes, spine, neck, clavicles and shoulder sockets. Arms
   attach to those sockets; the head follows the neck. Preserve volume through
   restrained rotation rather than shifting disconnected image sections.
2. Block opposite contacts and passing poses, then the down/up breakdowns. Label
   anatomical left/right feet and the support foot on every frame. Use modest
   swing-foot clearance and an unhurried stride suitable for this Holmes.
3. Review side and front construction views as well as the actual game camera.
   Match the pelvis, chest and legs to the same orientation. Do not use a profile
   leg cycle beneath a three-quarter chest.
4. Animate forward across a marked floor. Track the active heel, sole or toe
   contact as the foot rolls; the contact point must not slide. The ankle may move
   during heel/toe rotation. Derive the in-place cycle by subtracting root travel,
   preserving that relationship instead of independently re-centering each pose.
5. Record root displacement and cel duration. In the flat part of stance,
   root delta + local support-foot delta should be approximately zero, allowing
   native-pixel rounding. Derive the engine speed from these measurements; do not
   prescribe a frame rate independently of stride length.
6. Inspect the neck/shoulder/ribcage connection on every transition, including the
   loop seam. Use solid body volumes as well as a wire skeleton: a line overlay
   alone can hide shrinking shoulders or a thinning chest. No head-only bob or
   horizontal cut-and-paste boundary through the upper body.
7. Once the rough stride carries weight, draw the coat over the same body, with
   restrained delayed hem movement and consistent shoulder seams. Redraw coherent
   whole poses against the fixed model; do not graft new limbs onto an old torso.
8. Review the rough east cycle in place and travelling before final pixel cleanup
   and before producing west/front/back loops. Keep the 72×120 canvas, [36,113]
   anchor and standing cel 0. Walking starts at cel 1; standing is not a stride key.

## Files retained for learning

`generated/` preserves the original image outputs and exact prompts. `source/`
contains registered drawings, Pixelorama projects and the Blender construction.
`convert.ts` and `build.ts` reproduce this failed method, not the next workflow.
`review/` and `index.html` allow inspection of the rejection. `art.json` is a local
study manifest only. `timing.json` retains historical preview settings marked
withdrawn. Nothing from this study has been registered in the game's art/art.json.
