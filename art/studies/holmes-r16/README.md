# Holmes r16 — connected walk construction, rendering unfinished

2 October 2026. **Not a completed walk or a runtime handoff.** The user requested
that the current work be committed and the walk finished. The prior studies and
status were committed as `f2882d6`. This follow-up establishes a usable construction
but did not produce acceptable final animation cels.

## What is usable

`build-guide.py` constructs a continuous pelvis/chest/neck relationship with
shoulder sockets and a torso that has depth in the game camera. Both legs have
0.425 m thigh/shin lengths. The feet use 60% stance and a low swing trajectory;
the root travels 0.64 m per full cycle. These are construction choices for review,
not measured anatomy or approved engine settings.

`check-construction.ts` verifies fixed segment lengths and stationary world-space
heels during stance. `guides/contact-report.json` records those checks. The preview
can step the same construction through the workshop. Those checks do not validate
any generated drawing. Foot roll and a polished coat performance remain work.

## Rendering failures

- The first eight-frame sheet repeated the same apparent leg arrangement instead
  of reliably alternating support. It also changed the relaxed arm's position.
- A four-key sheet and a correction improved the passing silhouette, but the stride
  was too wide and one converted contact touched the canvas edge.
- Asking for a shorter stride collapsed the opposite contacts/passes into nearly
  duplicate poses.
- Individual pose generation still did not reliably follow the guide. The contact
  attempt introduced an extra arm; the passing attempt retained an unwanted bent
  sleeve shape from the standing reference.

These are rejected trials. Their images and prompts are retained in `generated/`.
The four converted drawings live in `review/rejected-export/`, not a production
export directory. There is deliberately no view-200 manifest or engine timing
proposal here. No game resources were changed.

The conversion acts on the complete drawing and no longer pastes a fixed head or
collar across a separately changing torso. Removing that seam does not by itself
solve the remaining motion and identity errors.

## Reproduce the construction

From the repository root, after pnpm install:

```sh
blender --background --python art/studies/holmes-r16/build-guide.py
node --import tsx art/studies/holmes-r16/draw-guides.ts
node --import tsx art/studies/holmes-r16/key-guide.ts
node --import tsx art/studies/holmes-r16/check-construction.ts
```

The Blender 4.5 source is `source/walk-construction.blend`. Use a local static server
at the repository root to open this folder's index.html. The Blender source and
exported joints are construction references, not a bound rig of the rendered Holmes.

The built-in image-generation tool produced the raster trials. Exact prompts sit
beside them; generated originals were copied into the project. The rendering stage
needs a controlled drawing/animation pass that actually follows the established
support leg and connected volumes before any additional directions or inbetweens
can be accepted. Repeating independent image prompts has not met that requirement.

See the [r14 review](../holmes-r14/README.md) for tutorial references and the required
72×120 canvas, anchor [36,113], four-direction and standing-cel contracts.
