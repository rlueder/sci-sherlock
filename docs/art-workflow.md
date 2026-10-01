# Graphics workflow for standalone SCI games

Use layered pixel art masters, ordinary PNG exports and a small JSON resource manifest.
Room placement and logic stay in YAML; dialogue and scene actions stay in Yarn. The
[research and tool decision](art-research.md) selects Pixelorama as the default editor.

## What works now

```sh
pnpm art check art/art.json
pnpm art build art/art.json
```

`check` reads every listed image, validates it and compiles the resources in memory.
`build` writes an **art-only** archive and an importable `palette.gpl` to `out/art/sherlock/`.
Sherlock currently delivers 36 PNGs: workshop layers, three Holmes directions (west is
mirrored), lantern, moving clock and a dial inspection. Five native Pixelorama masters
are committed alongside them. These are original style-proof assets, not final art.

Run `pnpm dev` and open <http://127.0.0.1:5173/> for the playable workshop.
Run `pnpm preview` for a complete headless clue/reveal playthrough and review frames
under `out/art/sherlock-preview/`. See [the game README](../README.md).

Each game explicitly imports its art through the existing `resources.ts` hook:

```ts
import { fileURLToPath } from "node:url";
import { buildArt } from "sci-ts/art";
export default () => buildArt(fileURLToPath(new URL("./art/art.json", import.meta.url))).resources;
```

The returned pictures, views and palette join scripts, messages and other resources.
Duplicate IDs within a type are errors; the game's palette replaces default palette 999.
An `art/art.json` file alone does not opt a game into the importer.

CI checks Sherlock's exports and runs its input-driven workshop test. Importer tests verify
SCI round trips, transparency, registration, invalid exports and build integration. CI
needs no paint application. Native export validation is an optional local artist check.

## Files an artist owns

Current layout:

```text
sci-sherlock/
  art/
    art.json                 resource IDs, PNG paths, priorities, loops and anchors
    palette.json             exact RGB values (32-colour style-proof palette)
    source/workshop.pxo      layered editable master
    source/holmes.pxo        animation master, fixed canvas and frame tags
    export/workshop.png      opaque room base
    export/workshop-front.png
    export/holmes-east-00.png
    credits.csv              asset, creator, source, license, tool version, notes
  rooms/102.room.yaml        placement, walk areas, obstacles, interactions
  rooms/102.yarn             speech, flags and scene actions
```

Commit native masters, approved PNG exports, palette, manifest and credits together.
Generated SCI archives belong under ignored `out/`. Keep original project art under the
repository's MIT terms unless explicitly documented otherwise. References and tool
licenses are distinct from the license of contributed art.

One artist owns a binary master at a time. Review exported images beside the manifest diff.
Do not attempt to merge `.pxo` files as text. If source storage grows substantially, adopt
Git LFS as a separate repository decision. No LFS/server dependency is needed to start.

## Sherlock art limits

Sherlock uses exactly **320×200** room layers and a **shared palette capped at 64 opaque
colours** (`maxColours: 64` in `art/art.json`). The cap includes black/white, excludes the
transparent index, and applies to the complete declared palette, including unused entries.
The current 32-colour palette remains valid. Preserve its olive/walnut/burgundy/cool-blue/
amber direction while adding only deliberate intermediate shades. Per-room adaptive
palettes and frame-by-frame quantization are outside this workflow.

Review at native scale and 4:3 nearest-neighbour enlargement. Draw details at source
resolution; no antialiasing, partial alpha, automatic dithering or photographic noise.
High-resolution generated studies are not validated production assets. Pixelorama masters
and exported PNGs must meet the actual dimensions and exact palette membership.

## Export contract

| Property | Required |
| --- | --- |
| Room canvas | **320×200**, every layer full size, origin `(0,0)` |
| Display review | Native pixels and the player's **4:3** aspect-corrected view; current player stretches 200 rows vertically |
| PNG | 8-bit, non-interlaced RGB/RGBA or indexed PNG; use RGBA if the editor optimizes indexed files to 1/2/4-bit |
| Alpha | Exactly 0 or 255; base background completely opaque |
| Colours | Exact members of `palette.json`; no automatic quantization or dithering |
| Sprite canvas | Up to 320×200; same dimensions within each animation loop; trimming off |
| Anchor | Explicit integer pixel `[x,y]` inside the canvas; feet for actors, top-left for portrait layers |
| Resizing | Export at 1×; no smoothing, antialiasing, scaling or colour-profile conversion |
| Animation | Each cel is an explicit PNG entry in playback order; no atlas packing or frame-time import |
| Foregrounds | First layer priority `-1000`; subsequent priorities `0..199`, one layer per priority |

The 320×190 convention in the **mod** tools is not this standalone contract. The game
uses the whole 320×200 canvas. Do not add a 10-pixel offset to YAML hitboxes.

For actors sorted by their feet, a foreground with priority 170 covers actors whose y
priority is lower. Test both sides of each occluder in the engine. A picture layer has one
depth: split scenery with different crossing depths into separate layers.

A manifest may set `maxColours` to an integer from 2 to 254; omission retains the general
254-colour limit. This is a project art budget, not an engine restriction.

The palette file is an array of 2–254 unique `#RRGGBB` strings, black first and white last.
Black maps to index 0, middle colours to 1–252, white to 255; transparency uses 254 and
253 is reserved. The same palette accompanies all imported pictures and views. This
deliberately avoids the mod quantizer's different shared/room-colour partition and shadow
alpha rules. Scripts generating indexed art must use this palette's indices, not assume
the default `cube()` indices still have their original colours.

## Manifest example

Example of the manifest structure (the committed Sherlock manifest contains all delivered assets):

```json
{
  "version": 1,
  "palette": "palette.json",
  "pictures": [{
    "number": 102,
    "layers": [
      { "png": "export/workshop.png", "priority": -1000 },
      { "png": "export/workshop-front.png", "priority": 170 }
    ]
  }],
  "views": [{
    "number": 220,
    "loops": [{ "cels": [
      { "png": "export/lantern-00.png", "anchor": [8, 23] },
      { "png": "export/lantern-01.png", "anchor": [8, 23] }
    ] }]
  }]
}
```

Paths resolve relative to the manifest. A loop can instead be `{ "link": 0, "mirror": true }`,
referring to an earlier loop with its own cels. At most 128 loops and 255 stored cels per
view. Unknown keys fail validation. This is a standalone `art.json` format, not the mod
builder's `*.view.json` format.

The corresponding room data uses existing resource IDs:

```yaml
room: 102
picture: 102
props:
  lantern: { view: 220, at: [188, 116], cycle: forward }
features:
  filings: { rect: [170, 134, 205, 149] }
```

These coordinates are illustrative until the composition is approved. Yarn uses
`filings.look`, `lantern.look`, and the existing `<<animate>>`, `<<cel>>`, `<<show>>` and
`<<hide>>` commands. Art files do not duplicate hotspots, flags, dialogue or walk polygons.

For walking actors, preserve the engine convention: loops 0 east, 1 west, 2 south, 3 north;
cel 0 stands. A mirrored west loop is appropriate only when costume and lighting allow.
Portraits use loop 0 bust, loop 1 mouth (closed first), loop 2 eyes (open first), all with
matching canvas and `[0,0]` anchors. Cross-loop portrait registration is an art review
requirement; the general importer only checks canvas consistency within each loop.

SCI views do not carry arbitrary editor frame durations. Set `cycleSpeed` in gameplay
properties, duplicate held cels or use Yarn cutscene timing. Review actual playback before
signing off a walk or mouth cycle.

## Artist iteration

1. Run the art build to obtain `palette.gpl`; import it in Pixelorama. Save a master with
   named layers such as `base`, `foreground-170`, `guides` and tagged animation loops.
2. Draw at native resolution. Export only intended art layers as PNGs, one cel per file,
   with full canvas retained. Hide guides. Leave the room under moving props complete so
   a hidden prop does not leave a painted duplicate.
3. Add or update `art.json` explicitly. Run `pnpm art check ...`; fix the file and pixel
   location reported by errors. Don't solve an accidental colour by silently growing the
   palette.
4. Build the game and use its player/editor to check foot placement, depth, interactions,
   dialogue overlap and room transitions. Reload the player after rebuilding art for now.
5. Commit master, exports and metadata with review screenshots at native and 4:3 sizes.
   Review the important clue before and after its story flag changes.

## Native master export

The five masters were loaded and exported with **Pixelorama 1.2.3** on macOS. Every
exported RGBA pixel matched the initial committed PNGs. The native editor and its
[CLI](https://pixelorama.org/user_manual/cli/) are open source; the game and CI do not
require an installation. Set `PIXELORAMA_BIN` to your executable, or put `pixelorama` on PATH.
For a macOS installation, the executable is normally inside
`Pixelorama.app/Contents/MacOS/Pixelorama`.

```sh
# Read-only: export masters to a temporary directory and compare decoded pixels.
pnpm export-art --check
# After editing a master: validate the complete export set, then update committed PNGs.
pnpm export-art
pnpm preview
pnpm dev
```

`export-art.ts` pins the tested release and maps its exact native export
filenames to the manifest. It runs projects sequentially in isolated temporary folders,
checks frame counts/names, preserves full canvases, and validates the complete art set
before replacing PNGs. Workshop layers are named `base` and `foreground-181`; Holmes has
21 frames in east/south/north order, seven per direction (standing first). Preserve these
names/order unless updating the mapping and manifest together. Additional guide layers
must be hidden for export. The script detects unexpected exported files.

Pixelorama 1.2.3 retains the project basename in exported filenames even with `--output`.
Use `--quit-after 120` before `--`, rather than immediate `--quit`, which can exit before
export. The macOS headless renderer prints shader warnings even when these flat pixel
exports succeed; the script verifies exit status, output files and image validation. The
exporter mapping must be reverified before changing the version pin. Manual PNG export
remains supported with the same contract.

`art/source/workshop.ts` is the deterministic TypeScript drawing source used to seed the
first original masters. It writes **only** to ignored `out/art/sherlock-draft/`; it never
overwrites an artist's edited masters or committed exports. Normal iteration starts with
the `.pxo` files. Use the draft generator only for deliberate composition experiments.

The native `--check` command detects stale exports, but is not required on CI. Automatic
art reload, contact sheets with anchor overlays and broader editor-version support remain
future work. Rebuild and reload the preview after editing. Clue readability still requires
visual review in native pixels and the aspect-corrected player.
