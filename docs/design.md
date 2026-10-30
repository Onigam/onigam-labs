# Design notes

The direction in a few lines, so a later change keeps the spirit.

**Idea.** The site is the front door of labs whose signature is the _exploded view_. So the one memorable thing is the hero: a
Pelton runner drawn as a technical diagram that turns and comes apart as you scroll (step 1 explore, step 2 take apart, step 3
run it). Everything else is quiet and disciplined: a drafting sheet, hairlines, one accent.

**Link with the labs, without copying them.** Same paper grid and same copper accent, same JetBrains Mono for figures. The paper is
a cooler mineral off-white (`#eef1ec`) instead of the labs' warm cream, ink is a blue-black, and the type is the labs' own pair, Space Grotesk and
JetBrains Mono, so the site speaks with the same voice (a first version used a condensed face with tight tracking: it read as
cramped and was dropped).

| Token               | Light                                                                     | Dark                  | Use                                       |
| ------------------- | ------------------------------------------------------------------------- | --------------------- | ----------------------------------------- |
| `--bg`              | `#eef1ec`                                                                 | `#0d1a24`             | page (the grid is drawn on a fixed layer) |
| `--surface`         | `#f8f9f6`                                                                 | `#14293a`             | cards                                     |
| `--ink` / `--ink-2` | `#12202b` / `#425160`                                                     | `#e9eef1` / `#aebcc6` | text, secondary text (≥ 7:1)              |
| `--accent`          | `#b05e27`                                                                 | `#e48a4a`             | primary button, level pips, scroll bars   |
| domains             | water `#2a7fb8`, electricity `#c99700`, heat `#d1432f`, storage `#6b4fd8` | lighter variants      | dots next to a text label, never alone    |

**Type.** Space Grotesk variable for everything, as in the labs; titles at weight 600 with only a hair of negative tracking
(−0.012em) and a 1.06 line height, body at 400 with 1.6. JetBrains Mono only for figures that are really measures: time, languages, the diameter on the drawing.

**Structure carries information.** A card ends with a _title block_ like a drawing sheet (level, time, languages, spoken guide).
"Inside every lab" is a nomenclature (a list of designations). Numbers appear only where there is a sequence (the three steps).

**Motion.** Three places, each answering a purpose: the hero (draws in, then follows the scroll), the card hover (a small lift and
a slow zoom of the thumbnail), the language and theme switches (instant). `prefers-reduced-motion`: no pin, no idle spin, no
draw-in; the three steps become buttons that set the runner's state by hand.

**Accessibility.** Skip link, landmarks, one `h1`, visible focus ring, 44 px targets, contrast checked in both themes, filters as a
button group with a live result count, thumbnails decorative (the card carries the text), every colour paired with a word.
