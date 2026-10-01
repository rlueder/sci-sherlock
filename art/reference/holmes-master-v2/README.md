# Holmes master v2: permanent waistcoat chain

This is the current neutral character reference. It adds nine existing-palette gold
pixels to the approved v1 master, forming a short waistcoat watch chain. Every other
pixel, silhouette, anchor and dimension is unchanged. Historical v1 assets stay intact.

The chain is present in `master.png`, the layered `source/master.pxo`, every approved
puff frame and all current r10 idle poses. The current r9 room preview uses these
assets. Older studies document earlier decisions and are not silently overwritten.

`source/chain.png` is the separate native correction. `source/fixed-puff.pxo` links
the exact v2 body beneath the already-approved smoke layer. The builder asserts that
all opaque character pixels remain identical throughout the puff.

```sh
pnpm exec tsx art/reference/holmes-master-v2/build.ts
PIXELORAMA_BIN=/path/to/Pixelorama pnpm exec tsx art/reference/holmes-master-v2/verify-native.ts
```

The editable files rebuild from saved v1 inputs without generation. Preserve manual
native edits before rebuilding. See [v1](../holmes-master-v1/README.md) for material
ramps and drift diagnostics, and [r10](../../studies/holmes-r10/README.md) for the new
chin, cap and downward-glance variants. Walking is still pending.
