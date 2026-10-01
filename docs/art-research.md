# Pixel art references and tool decisions

Research date: 1 October 2026. This is a focused production shortlist for
[The Stopped Clocks](teaser.md), not a survey of every pixel art game.
Tool claims below come from developers or official documentation. The proposed visual
lessons are art direction judgments; they do not imply access to a studio's production files.

## Animation and perspective follow-up

The current recommendation is Krita for pose planning and perspective assistants,
Pixelorama for final native-pixel drawing/export, and optional fSpy → Blender for camera
matching and dimensional clock guides. The [animation workflow](animation-workflow.md)
records official sources, the diagnosed cutout/clock defects and the authorized local
desk correction. This supersedes treating the r3 motion study as finished animation.

## Current character refinement

The user liked version 4 after its actual 320×200/64-colour conversion, then changed the
body-proportion preference toward realism. Version 5 retains the same palette and illustrated
room treatment while revising Holmes toward natural head, hand and torso/leg proportions.
This supersedes the six-head cartoon anatomy in the earlier LucasArts interpretation below.
[Version 5 image, prompt and conversion](../art/studies/workshop-v5/README.md).

## Latest refinement: LucasArts shape and rendering direction

The user subsequently selected LucasArts **Indiana Jones** and **Monkey Island** as the
balance of detailed and cartooned art, and explicitly rejected the realistic proportions
of generated versions 2 and 3. For the next study, the art director interprets these series
as *Fate of Atlantis* and early *Monkey Island*. This takes precedence over the earlier
naturalistic anatomy brief below. Retain the Sherlock/Phantom references for Victorian
setting and atmosphere. Target surface detail between generated versions 2 and 3, with
slightly larger heads/hands, expressive drawn profiles, gently exaggerated furniture and
coherent stylized perspective. See [version 4](../art/studies/workshop-v4/README.md).

## Primary visual references — user-confirmed revision

On 1 October 2026, the user identified the prototype as too cartoonish, with perspective
exaggeration reminiscent of *Day of the Tentacle*. The approved direction is naturalistic
Victorian adventure art. The following titles replace the modern shortlist as the visual
north star. The user confirmed these exact titles after clarification; the *Lost Files*
games were published by Electronic Arts, and *Return of the Phantom* by MicroProse.

| Reference | Study focus for our revised art | Reference source |
| --- | --- | --- |
| **The Lost Files of Sherlock Holmes: The Case of the Serrated Scalpel** | Believable Victorian interiors; natural character scale; room contents that suggest daily use and investigation. | [Game and gallery](https://www.gog.com/dreamlist/game/the-lost-files-of-sherlock-holmes-the-case-of-the-serrated-scalpel), [interior screenshots](https://www.adventurecorner.de/gallery/600/lost-files-of-sherlock-holmes-screenshots-englisch) |
| **The Lost Files of Sherlock Holmes: The Case of the Rose Tattoo** | Naturalistic character presentation; period materials, furnishings and restrained colour transitions. Treat its finer detail as a direction to translate, not a promise at our current resolution. | [Gallery](https://www.mobygames.com/game/4407/the-lost-files-of-sherlock-holmes-case-of-the-rose-tattoo/screenshots/dos/), [original manual](https://www.mocagh.org/ea/rosetattoo-manual.pdf) |
| **Return of the Phantom** | Architectural depth, convincing human figures, theatrical lighting and richly shaded interiors. | [Game and screenshots](https://www.gog.com/en/game/return_of_the_phantom), [original manual](https://www.mocagh.org/miscgame/returnphantom-manual.pdf) |

These study goals are our art direction judgments, not claims about the original studios'
production tools. New artwork must use coherent perspective, observed object scale,
natural anatomy and controlled material shading. Reassess the provisional 32-colour
palette rather than forcing broad flat colour blocks. Preserve original asset authorship;
reference sprites and backgrounds are not game inputs.

The delivered workshop remains a technical prototype. Redo one composition with a standing
Holmes and review it at native and aspect-corrected sizes before expanding the art set.
The revised [teaser plan](teaser.md) records the acceptance criteria.

## Secondary modern studies and workflow references

| Reference | Evidence and what to look at | Decision for Sherlock |
| --- | --- | --- |
| **The Crimson Diamond** (2024) | [Creator's site and gallery](https://www.thecrimsondiamond.com/). Julia Minamata's [2020 production interview](https://usesthis.com/interviews/julia.minamata/) names Photoshop CS2, Aseprite and Adventure Game Studio. That is a historical account, not a claim about her current versions. | Secondary reference for readable interiors and objects that invite investigation; it no longer sets the rendering style. Use clustered shading and distinct object silhouettes; our palette need not reproduce EGA. |
| **The Drifter** (2025) | [Developer's press kit](https://www.powerhoof.com/press/sheet.php?p=The+Drifter) provides trailers, credits and release details. Its [PowerQuest documentation](https://powerquest.powerhoof.com/) describes its Unity adventure workflow and animation tooling. The press kit separates direction, backgrounds and animation credits; it does not establish which paint application every artist used. | Study dramatic staging and spending animation on a story beat. Reserve our largest animation for the clock reveal; restrained idle motion elsewhere. Keep SCI as our engine. |
| **Kathy Rain 2: Soothsayer** (2025) | [Publisher's overview](https://rawfury.com/games/kathy-rain-2-soothsayer/) describes higher-resolution pixel art, dynamic lighting and reflections. [Artist Hervé Barbaresi's portfolio](https://www.hervebarbaresi.com/kathyrain2) shows character, background and animation selections. | Study character readability and motivated pools of light. Paint light into backgrounds and props for this teaser; do not make shader lighting or reflections a prerequisite. |
| **Animal Well** (2024; process article from 2022) | Billy Basso's [first-person technical article](https://blog.playstation.com/2022/07/20/how-animal-well-taps-into-ps5-hardware-to-elevate-2d-pixel-art-platforming/) describes a modified Aseprite exporter and immediate engine reload. | The production lesson is a short edit/export/play loop with custom-engine integration. Our equivalent starts with portable PNG exports and one game build. Automatic art reload is a later milestone, not something this change implements. |
| **Shadows of the Afterland** (2026) | [Studio press kit and trailer](https://arumastudios.com/shadows-of-the-afterland/press-kit). Useful contemporary adventure comparison; no paint-tool attribution established here. | Study expressive cast staging and dialogue coverage. Our naturalistic proportions and quiet mystery tone should remain distinct. |

The documented examples support editable art, animation timelines and tailored import
pipelines. They do **not** establish generative AI as the standard way these games make
their graphics. Good automation removes export chores; art direction still determines
shape, staging, palette and motion.

Use these linked galleries as the reference board. Reference images remain with their
owners; don't put their sprites or backgrounds into game resources or test fixtures.

## Open-source tool stack

| Tool | Status and evidence | Role |
| --- | --- | --- |
| **Pixelorama** | MIT; [official repository](https://github.com/Orama-Interactive/Pixelorama). Layers, onion skinning, frame tags, palettes and export tools. [Desktop CLI](https://pixelorama.org/user_manual/cli/) supports headless export, frame ranges, layer splitting and project JSON. | Default for final pixel drawing and animation. Keep `.pxo` masters and lossless PNG exports. The Sherlock exporter is now pinned and verified against 1.2.3. |
| **Krita** | GPLv3; [license](https://krita.org/en/about/license/) and [PNG animation export](https://docs.krita.org/en/reference_manual/render_animation.html). | Optional thumbnails, lighting studies and paintovers. Final pixel cleanup goes through Pixelorama and the same validator. |
| **LibreSprite** | GPLv2; [official repository](https://github.com/LibreSprite/LibreSprite). Independent fork with layers, frames and onion skinning. | Alternative for artists who prefer its workflow. Deliver the same PNG contract; do not assume modern Aseprite scripting or format extensions are compatible. |
| **Blender** | GPL; [official source and license](https://github.com/blender/blender). | Optional perspective blockouts for the workshop, clock hinge and hansom. Render guides and redraw at target resolution. Four rooms do not justify a mandatory 3D pipeline. |
| **Our TypeScript tools** | Repository MIT license; [workflow](art-workflow.md). | Exact-colour validation, SCI resource compilation and CI. No external editor or model needed to build committed exports. |
| **Aseprite** | [License FAQ](https://www.aseprite.org/faq/) and [CLI](https://www.aseprite.org/docs/cli/). Source availability does not make its current restricted license an open-source license; the [LibreSprite history](https://github.com/LibreSprite/LibreSprite#history) records the change. | Useful industry reference. Optional personal tool, not a required dependency for this open-source workflow. |

Pixelorama is the recommendation on capabilities and licensing, not a claim that the
reference games used it. The workflow now pins Pixelorama 1.2.3; all 36 prototype PNGs
were compared successfully with its native exports. See [export instructions](art-workflow.md).

## Generating art and automating work

Use three complementary production methods:

1. **Draw and animate:** Pixelorama masters for characters, portraits and final backgrounds.
   This is the production default because individual pixels, registration and revisions
   stay controllable.
2. **Generate repeatable components:** repository scripts with explicit seeds for wallpaper
   patterns, clock-face guides, palette swatches and draft fog masks. Export those as layers
   and finish them by hand. Preserve both the generator and the edited master; rebuilding
   a guide must not overwrite a finished painting. Avoid random texture over clue regions.
3. **Optional concept exploration:** [ComfyUI](https://github.com/Comfy-Org/ComfyUI) offers
   local graph-based generation and saved JSON workflows. An open-source runner does not
   establish the license of a checkpoint, LoRA or reference image. No model is selected
   or required for this project. If tried, record exact model and node versions, hashes,
   license/source links, seed, workflow and reference provenance. Evaluate consistency
   across a front/side character sheet and two rooms before adopting it. Budget pixel
   cleanup and redraw; a downscaled generated image is not automatically usable pixel art.

Do not put inference in CI or require cloud generation to rebuild a game. Reviewed,
committed exports are the build inputs. There is no evidence here that the listed games
used ComfyUI; this is an optional experiment proposed for us.

## Next art experiment

The initial workshop exercised native masters, export validation, SCI build, walking,
clues and reveal successfully. The user's visual review requires a new art pass.
Revise one workshop composition and one standing Holmes using the primary references.
Review geometry, anatomy, materials, clue readability and 4:3 proportions before animating
the replacement. Keep the tested import and gameplay path throughout the revision.
