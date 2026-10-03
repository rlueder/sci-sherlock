# Portrait expressions brief: faces that act

3 October 2026. From the game side, for the art session. It follows r23 (the fixed portrait
masters, their mouths and blinks) and r22's gilt surround, and keeps everything in them: the
56×64 faces, the masters' identity, the palette, the Pixelorama projects and the checks. What
it adds is acting.

## Why

Today each character has one face. While they speak, three mouth shapes cycle (about 7–11
pixels change) and they blink. Whether Toby is close to tears or Holmes has just seen the
answer, the face is the same, and between lines nothing moves. The portraits read as labels
for the voice, not as people.

The model is the bottom strip of Westwood's *Lands of Lore* (1993): the party's faces are
always there and always alive. They blink, glance about and react to what happens, so the
strip carries mood even when nobody speaks. Use it for that idea only; draw nothing from it.

At this size most of the acting is in the brows and eyes, then the mouth's shape at rest, then
small changes to the head and shoulders. Big jaw movement or squash reads as noise at 56×64.

## What each character needs

### Expressions

Each expression is a whole face drawn from the character's fixed master: the same person,
the same lighting, palette and costume, with the brows, eyes, mouth, and where it helps, the
tilt of the head changed. Neutral is the existing master, unchanged.

The lists come from what each character actually says in the teaser. A line names its
expression in the script; the voice gets the same direction.

| Character | Expressions | Where they're used |
|---|---|---|
| **Holmes** | neutral; intent (narrowed eyes, brows drawn, fixed gaze); keen (one brow up, eyes bright: he's seen something); dry (the corner of the mouth up, lids half down); grave; impatient (brows down, a tight mouth) | thinking aloud over the filings; "Seventeen past three"; "In the middle of the night… No."; "Come, Watson." |
| **Watson** | neutral; warm (a smile under the moustache, eyes creased); puzzled (brows up and in, a slight frown); concerned; surprised (brows high, eyes wide); resolute (jaw set) | "A repair, perhaps?"; "I have my revolver"; "Holmes. Listen."; "He walked through it." |
| **Mrs Hudson** | neutral; flustered (brows up, eyes wide, lips pressed); kind; startled | "A young man to see you… He's in a dreadful state." |
| **Toby** | neutral, which for him is anxious; frightened (eyes wide, brows up and together); tearful (wet, reddened eyes, a trembling mouth); spooked (eyes sliding sideways, shoulders up); earnest (leaning in, brows up); relieved | "It's the guv'nor. He's gone."; "Every clock… stopped."; "Thank you, sir." |

That's six each for Holmes, Watson and Toby, and four for Mrs Hudson: 22 faces in all,
including the four neutrals that already exist.

### Talking, for every expression

Each expression needs its own mouths, because the mouth sits differently in a smile than in a
frown:

- **Four mouth cels**: closed, slightly open, open, and wide (or rounded). Cel 0 is the
  expression's own closed mouth, an exact crop of its face. The game will drive the mouth from
  the loudness of the recording, closed at the pauses, so the four should step evenly from
  closed to wide. r23 has three; the fourth is new.
- **Keep the mouth inside its region**, as r23 does: record each expression's lip corners,
  lip line and chin in `landmarks.json`, and check that only those pixels change.

### Eyes, for every expression

- **Blink**: open, half and closed, as r23, fitted to each expression's own eye shape (a
  narrowed eye closes from a different place than a wide one).
- **Glances**: three more cels, with the eyes turned toward the other speaker, away, and down.
  The game plays these between lines and while a character listens. Only the irises and the
  lids move; the brows stay.

### One habit each

A small loop for idle moments, a few seconds long, of something only that character does:

- **Holmes**: the pipe lifted to the lips and a puff of smoke, or two fingers tapping the
  pipe's bowl.
- **Watson**: a hand smoothing his moustache.
- **Mrs Hudson**: her hands smoothing her apron.
- **Toby**: twisting his cap in both hands.

Draw it as an overlay on the neutral face, like the mouths and eyes: only the pixels that
move. The hands and props may come up into the frame from below; the face stays still.

## How the game will use them

So the drawings can be judged in place:

- **The speaker** shows the line's expression, its mouth following the voice, blinking now and
  then and glancing at whoever they're talking to.
- **The listener** shows their own portrait on the other side, smaller or dimmed, reacting:
  Holmes turns keen when Toby says "Seventeen past three". No extra art is needed for this:
  listeners use the same expressions.
- **Between lines**, a character on screen blinks, glances and now and then plays their habit.

## Size

Keep 56×64 and the r22 surround. The text box, both portraits and the room all have to fit
on 320×200, and the portraits sit at the bottom corners now. If an expression can't be read at
this size, say which one and why. One trial at a larger size (64×72, Toby's frightened face,
say) would be useful to compare, but deliver the set at 56×64.

## Deliverables

Per character, in the r23 layout (anchor [0, 0], the left facing a mirror of the right made
with its own cels, never by flipping the surround):

| Loops | Content |
|---|---|
| 0–5 | Neutral, as now: right bust, mouth, eyes; then left bust, mouth, eyes. The mouth loop gains a fourth cel, the eyes loop three glance cels. |
| 6–11 | The second expression, the same six loops. |
| 12 on | Each further expression, six loops each, in the order of the table above. |
| Last two | The habit, right then left: the overlay cels in order, with their timing in the manifest. |

With them:

- A manifest (`expressions.json`) naming each expression and its first loop, the habit's
  timing, and the mouth and eye regions for each expression.
- The reviewed masters for each expression, hashed as r23's are, and a Pixelorama project per
  character with the master locked and one layer each for mouths, eyes and habit.
- A review page that plays each character through their expressions, talking, blinking and
  glancing, inside the surround at the bottom of a room, as in the game.
- The same palette (r27's 68 colours); no new colours.
- The same checks as r23: neutral overlays rebuild the bust exactly, and every changed pixel
  lies inside its region.

## Order

1. **Toby and Holmes first**, all their expressions. Toby's fear carries the opening scene, and
   Holmes speaks most.
2. Watson, then Mrs Hudson.
3. The habits last.

Leave registration to the game side, as with the rooms: deliver the study, and the game takes
it from there.
