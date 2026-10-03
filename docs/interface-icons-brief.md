# Interface icons brief: a monocle for Look, and a music icon

3 October 2026. From the game side, for the art session. It adds two icons in r28's painted
style (`art/studies/interface-r28`): the same materials, palette, sizes and layers.

## A monocle for Look

r28's Look icon is a magnifying glass, and so is the lens item: the inventory icon in view
250 is the same `object-look` drawing. When Holmes carries the lens, the toolbar's item place
shows it right beside Look, and the strip has two identical magnifiers. The lens should stay
a magnifier; Look becomes a monocle.

- **The object:** a gentleman's monocle, a round lens in a thin gold rim, with its cord or
  fine chain curving away from it. Seen slightly from the side, so the rim reads as an ellipse
  with a highlight on the glass. It has to read as "look" at a glance and not as the lens: no
  handle, smaller than the lens, and clearly worn rather than held.
- **Like the other r28 icons:** no frame of its own, the object on the toolbar's velvet,
  painted brass and glass rather than outlined, r27's 68 colours, binary transparency.
- **Two states:** normal and picked, like the others (`icons-32-0-1.png` and
  `icons-32-1-1.png` replace the lens in cel 1 of view 266's two loops).
- **Two sizes:** 32×32 for the game and the page (the page shows it at 64), and 24×24 to keep
  the 24-pixel set complete.
- **Lit the same way** as the walk pointer and the talk card beside it, so the strip reads as
  one set.
- **The look cursor (view 262)** is the r20 cursor, not the lens; leave it unless the monocle
  suggests a matching cursor, in which case propose one.

## A music icon for the page

The page under the game is getting a Music button beside Sound, to turn the music off and
leave the voices on. It needs an icon in the same family as r32's sound horn (`sound-on-32`,
`sound-off-32`), so the two read as a pair:

- **On:** a few bars of printed sheet music, or a music stand with a page on it. Something
  from the period, not a modern note symbol.
- **Off:** the same, struck through the way the horn's off state is, so the state doesn't
  depend on colour.
- **Sizes:** 32×32 (shown at 64 on the page), and 16 and 24 like the horn, if they're cheap.
- **The horn should still read as "all sound"**, so keep the music icon clearly about music
  and not sound in general.

## Deliverables

As r28 and r32: native PNG exports, the editable Pixelorama projects, the generation prompt
if one is used, and a small review sheet showing:
- the toolbar with the monocle at Look and the lens in the item place beside it;
- the page's Sound and Music buttons side by side, on and off.

Registration stays on the game side.
