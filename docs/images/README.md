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
