# README gallery images

These are documentation contact sheets assembled from existing native cels, not new
artwork or screenshots of the playable prototype. They retain the shared palette,
use nearest sampling at 3× horizontal scale and honor the 1:1.2 display pixel aspect.

Rebuild from the repository root:

```sh
pnpm exec tsx art/source/readme-gallery.ts
```

| Image | Inputs |
|---|---|
| `holmes-poses.png` | `art/reference/holmes-master-v2/master.png`; `art/studies/holmes-r10/source/{thinking,cap,watch}-key-3.png` |
| `interactive-props.png` | `art/studies/workshop-r9/export/{pendulum-00,lamp-00}.png`; `art/studies/workshop-r5/export/{lens-icon,filings-01,dial-inspection}.png` |

The main README also embeds existing room, mouse, cabinet, clock-turn and palette
review images directly from their study folders. Those folders retain the editable
sources and historical review status. No runtime assets are changed by this script.

## Animated previews

`pnpm exec tsx art/source/readme-gallery.ts --gifs` also uses FFmpeg to compress the
existing study GIFs. `gif-palette.png` supplies the exact project palette; no new
colours, dithering, scaling or motion are introduced. Every decoded RGB frame is
compared with the source. FFmpeg is optional for rebuilding the static galleries.

| GIF | Original study |
|---|---|
| `holmes-idles.gif` | `art/studies/holmes-r10/review/idles.gif` |
| `pipe-puff.gif` | `art/reference/holmes-master-v2/review/puff.gif` |
| `workshop-ambience.gif` | `art/studies/workshop-r9/review/ambience.gif` |
