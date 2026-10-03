# Victorian menu, hourglass and Sound — r32

[Open the interactive review](index.html). The user requested a more detailed wait
icon, a matching Sound button for the web app, and Victorian menu styling with
hover states and small icons or bullets. This study delivers those assets and a
working interaction proof. It does not edit the game runtime or web audio wiring.

## Visual system

The panel reuses r28's painted walnut rim, brass corners/hinges and purple lining.
The centre stays quiet for legibility. Each menu row has a small brass lozenge.
Menu items stay in **regular** New Century Schoolbook 12px in every state.
Hover and keyboard focus use lighter shades of purple and cream; letter weight,
spacing and width do not change. Sound labels follow the same rule. Pressed rows have inset shading; disabled rows
use subdued ink. Text always preserves r29's bearings, advances and baseline.
The existing wording is retained: Save, Restore, Start again, Text speed, Speech,
and Carry on. The optional title is “The casebook”.

Two new original painted objects match r28's lens and journal: a brass/walnut
hourglass with glass highlights and sand stream, and a brass sound horn. Sound off
removes the sound arcs and adds a clear mute stroke; the accompanying text also
says “Sound off”. Neither state depends on colour alone.

## Delivery contracts

| Asset | Size / files | Intended use |
|---|---|---|
| Wait cursor 265 | 16×16, anchor [8,8], `wait-cursor.png` | Existing cursor contract; static cel in this pass |
| Larger hourglass | 24×24 and 32×32 | Web/UI symbols where more detail fits; not a silent cursor-size change |
| Sound objects | 16/24/32 on and off | Transparent symbols for dynamic button layouts |
| Sound buttons | 112×36, 8 PNGs | On/off × normal/hover/pressed/disabled; web component artwork |
| Menu panel | 244×178, at [38,11] on 320×200 | `menu-empty.png`; title included, rows independent |
| Row backgrounds | 224×22, four states | Normal/hover/pressed/disabled; no baked text |
| Bullets | 12×12, four states | Small brass lozenges at row offset [5,5] |
| Row text | New Century Schoolbook 12px | Start [25,4]; preserve original metrics |

Rows start at menu [10,29], spaced 22 pixels. Text speed and speech mode must remain
live values. `menu-item-*.png` and `menu-normal/hover/pressed.png` are visual proofs,
not the source of dynamic runtime labels. Use the empty panel, row backgrounds,
bullets and r29 font atlases in the engine. `guides/handoff.json` contains all
measurements and interaction rules.

The isolated `art.json` only proposes view 265. Menu and Sound files are web/UI
skins; no unused engine resource numbers are invented. This study uses r28's
68-colour palette proposal. Registration must preserve that palette mapping and
remain separate from these study files.

## Interaction proof and engine work

The preview uses real HTML buttons with accessible names. Hover and keyboard
focus share a highlight; arrow keys skip unavailable Restore, Enter/Space activate,
and Escape/Carry on close the preview menu. The checkbox simulates a save being
available. Text-speed and speech rows cycle their displayed values. These changes
are confined to the review page and do not modify saves or game settings.

The Sound preview toggles its visible state only. The engineer should connect the
same button to the existing web app audio toggle and reflect the actual state,
including startup audio availability. Use `aria-pressed=true` for enabled sound,
an accessible name “Sound”, and visible on/off text. Do not implement a second
independent audio controller. Keep the existing restart confirmation and save/restore
behaviour when applying menu skins. Menu layout must be independent of dialogue-frame
margins. Preserve keyboard focus when values change.

## Rebuild and learning sources

```sh
node --import tsx art/studies/interface-r32/build.ts
pnpm art check art/studies/interface-r32/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/interface-r32
node --import tsx art/source/compress-study-gifs.ts art/studies/interface-r32/review
```

`generated/objects.png` and its exact prompt retain the two original ImageGen
masters. Generation is proprietary; subsequent builds use only stored masters,
TypeScript, Pixelorama and ffmpeg. Each native size samples the original master
independently; it is not an enlargement of the 16px cursor. Nine Pixelorama projects
cover the objects, panel, bullets, rows, proofs and Sound states. Font sources and
licence remain in [r29](../typography-r29/source/upstream/COPYING); no font glyphs are
claimed as original art. The interface artwork and code follow the repository licence.
