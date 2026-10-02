# Fixed portrait references and individual mouths — r23

[Open the review](index.html). The preview starts with neutral mouths. Enable **Talking**, or use the **Mouth** selector to hold each pose. Expand the reference and construction sections to compare the static masters, lip/chin guides and three mouth keys for every character.

This corrects r21/r22's generic, incorrectly placed mouth overlays. The approved r22 ornate frame is retained. Holmes joins Watson, Hudson and Toby with his own fixed portrait.

## Save the neutral reference first

`source/masters/` contains four 56×64 right-facing neutral PNGs. `models.json` records each source and SHA-256. Watson, Hudson and Toby are copied from r22's neutral busts, not re-rendered. Holmes is the only new painting: built-in ImageGen used our fixed Holmes sprite for identity and Watson's portrait for style. The exact prompt and original transparent source are in `generated/`. His greying temples, older angular face, deerstalker, navy coat and oxblood waistcoat follow our established model. He holds his pipe below the jaw so it does not overlap the talking mouth.

`prepare-masters.ts` is a deliberate reference-establishment step. **Do not run it as part of ordinary animation builds.** Changing a master means a reviewed new reference revision. `build.ts` reads and verifies the saved hashes; it does not regenerate, resize or rewrite the masters. Each Pixelorama project has the master linked and locked across all cels.

The review is still awaiting the user's visual assessment; a passing hash check does not establish that the anatomy is artistically correct.

## Anatomical landmarks, not a shared mouth stamp

`landmarks.json` contains separate lip corners, lip-line midpoint, chin position, animation region, pixel edits and timing for every character. Coordinate grids in `guides/` expose the native pixels used to position them. Mouth cels copy their region from the static master before applying individual edits. Cel 0 is that exact unmodified crop.

| Character | Mouth construction |
|---|---|
| Watson | Opening at y40 directly beneath the central moustache edge, two pixels above the rejected r23 opening. Preserve the lower-lip shadow at y42. No white tooth bar. |
| Hudson | Small pursed opening following the sloping lip line, with muted reddish-brown edges and a retained lower lip. |
| Toby | Thin lips and a tapered opening above the narrow chin; smaller far side in the three-quarter view. |
| Holmes | Restrained opening along thin angled lips, preserving the long upper lip, cheek crease and chin. Pipe remains below the jaw. |

The movement is intentionally small at 56×64: roughly 7–11 changed pixels per mouth key. There is no large jaw squash or cheek deformation. Each character has its own cadence, with closed holds. These are speaking loops, not phoneme-synchronized lip sync.

Build assertions verify that neutral overlays reconstruct the bust and that every altered mouth pixel lies within its character's own region. No change can leak into the nose, hair, hat, coat, frame or the rest of the face. Left variants reflect the master and its own mouth/eye cels together; the ornate frame is never reflected. Clipping to the frame's opening is a display operation, not a modification of the saved reference.

## Resources and authoring surfaces

- Watson 210, Hudson 211, Toby 212; **Holmes 213** is proposed in this isolated study.
- Every view: loops 0/1/2 right bust/mouth/eyes; 3/4/5 left bust/mouth/eyes. Mouths closed/parted/open; eyes open/half/closed.
- Facial exports stay 56×64, anchor [0,0].
- r22's unchanged separate surround is 72×88, offset [-8,-18] from the portrait origin. Draw surround, bust, mouth, eyes, then optional frame protection.
- Eight editable 72×88 Pixelorama projects contain the full framed composition; the larger authoring canvas does not change facial resource dimensions.

The production manifest and game code are unchanged. The engineer must register the shared surround, add Holmes's portrait association if desired, and implement the previously documented facing/placement policy. See `guides/facing-contract.json`. The old spec's “Holmes needs none” is superseded by the user's request for a Holmes portrait.

## Reproduce animation from the fixed references

```sh
node --import tsx art/studies/portraits-r23/guides.ts
node --import tsx art/studies/portraits-r23/build.ts
pnpm art check art/studies/portraits-r23/art.json
PIXELORAMA_BIN=/path/to/Pixelorama node --import tsx art/source/verify-study-native.ts art/studies/portraits-r23
node --import tsx art/source/compress-study-gifs.ts art/studies/portraits-r23/review
```

The 56 native Pixelorama composite exports are compared pixel-for-pixel with the delivered review cels. Static references, per-character landmarks and reproducible build scripts make subsequent corrections local and inspectable.

## Review correction: mouth seam and eyelid fit

Watson’s earlier r23 mouth started at y42, inside the lower-lip shadow. Its opening now starts at y40, directly beneath the central moustache edge. The shadow itself remains unchanged. The static portrait is unchanged.

`eye-landmarks.json` records the actual eye apertures and explicit half/closed-lid edits for Holmes, Watson and Hudson. Near and far eyes have different widths and, for Hudson, different heights. Each lid closes inside its own aperture; eyebrows and lower orbital shading stay fixed. Toby’s accepted blink is retained. `guides/*-eye-grid.png` and `*-eye-fit.png` make the fit inspectable; `review/*-blink-keys.png` compares open, half and closed. The preview has an Eyes selector for holding these cels.

Half-blink follow-up: Watson retains a continuous dark upper-lid contour above a muted sliver of sclera. Hudson’s detached bright pixels below that contour are replaced by the local lid/skin ramp. Only Watson and Hudson half-blink cels change, in both facings; open/closed eyes, all mouths, static masters, Holmes and Toby stay pixel-identical.

Hudson master revision 2: the remaining open-eye artifacts were present in the neutral reference itself. Three native pixels below her near eye are corrected in `source/masters/hudson-right-v2.png`; the old reference is retained as revision 1. `master-corrections.json` records the exact edit and `models.json` locks the new hash. The bust and neutral eye overlay now use that same corrected source, so returning from a blink cannot restore the artifact. Other masters are unchanged.

Watson mouth-width refinement: the parted and open speaking keys extend one native pixel farther at each corner, with softer corner shading and a matching wider lower edge. The seam stays at y40; his neutral reference and closed mouth are unchanged. Both facings use the same correction.

Watson alignment follow-up: both speaking shapes shift one native pixel left in the right-facing master, toward the centre of the face. Width, seam height and neutral mouth stay fixed; the left-facing variant mirrors the correction.
