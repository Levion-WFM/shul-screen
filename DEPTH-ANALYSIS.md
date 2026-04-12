# Depth Analysis — Reference vs Ours (Pixel-Level)

## What the original does that creates depth (that we DON'T do)

---

### 1. THE GOLD FRAMES ARE MULTI-LAYERED MOLDINGS (not single borders)

**Reference:** Each panel frame is ~8-12px wide and has VISIBLE 3D structure:
- Outermost: thin bright gold highlight line (1px, #e8d48a)
- Then: a darker gold channel/groove (~3px, #7a6520) — this is the KEY depth trick
- Then: a raised bright gold ridge (~2px, #c9a84c)
- Then: a thin dark inner edge (1px, #4a3e1a)
- Then: the panel background

This creates a "picture frame molding" cross-section. It's NOT one border — it's
4 concentric borders with alternating light/dark that simulate a carved molding.

**Ours:** Single 2.5px border with a gradient. Looks flat. No molding depth.

**Fix:** Use multiple box-shadows OR nested elements to create the multi-layer
molding effect. Key insight: alternating light-dark-light-dark is what makes it 3D.

---

### 2. CORNER ORNAMENTS ARE MASSIVE AND SOLID

**Reference:** Corner pieces are ~50-60px and FILLED with solid gold. They're
chunky, heavy scrollwork — like actual cast bronze corner brackets you'd see on
an antique Torah case. They have:
- A main SOLID body (not just outlines)
- Visible highlight on top-left of each curve (light catching the raised surface)
- Shadow on bottom-right of each curve
- They OVERLAP the frame border significantly
- They feel like they weigh something

**Ours:** 30-38px, partially filled. Look like thin decorative accents, not
structural corner brackets. They don't feel heavy or real.

**Fix:** Make them 50-60px minimum. Fill the scroll shapes completely with gold
gradients. Add internal shading (lighter top-left, darker bottom-right on each
curve) to simulate 3D metalwork.

---

### 3. PANEL INTERIORS HAVE DEPTH (not flat black)

**Reference:** Inside each panel, the background isn't flat — it has:
- A very subtle radial gradient: slightly lighter in the center, darker at edges
- This creates a "spotlight" or "recessed" feeling
- Like looking into a shadow box where the center is slightly illuminated
- The effect is VERY subtle (maybe 3-5% difference) but critical

**Ours:** Flat #0a0a10 everywhere. No interior depth.

**Fix:** Add `background: radial-gradient(ellipse at center, #0e0e16 0%, #080810 100%)`
to panels. The center should be BARELY lighter than the edges.

---

### 4. THE CENTER PANEL IS A DIFFERENT WORLD

**Reference:** The center "Daf HaShavua" panel is treated completely differently:
- It has a VISIBLE lighter background — almost like aged parchment or light blue
- The frame around it is thicker and more ornate than the side panels
- It has what appears to be actual imagery (a poster/print of sefarim)
- It feels like a FRAMED POSTER hanging on the wall, not a data panel
- The background inside might be a light gradient (#1a1a2a or even lighter)

**Ours:** Same dark background as every other panel. Same frame weight. Doesn't
feel special. The SVG sefarim look like a developer drew them.

**Fix:** Give the grand panel a distinctly lighter interior background. Make its
frame visibly heavier. The sefarim section should feel more like an embedded
image/poster than wireframe SVGs.

---

### 5. TEXT RENDERING AND WEIGHT

**Reference:** The gold text has more PRESENCE:
- Font weight appears heavier (bold/black)
- Text might be slightly larger overall
- Time values are big and bold — easy to read from across the room
- Labels are clearly lighter/smaller than values — strong hierarchy
- The text-shadow creates a very subtle warm glow that makes text "hover"
  above the dark background

**Ours:** Text feels thin and wispy. The hierarchy between labels and values
is not strong enough. From across a room on a TV, this would be hard to read.

**Fix:** Increase time value font size to 16-18px, increase weight. Make labels
smaller/dimmer to increase contrast with values. Add subtle text-shadow with
warm gold glow (0 0 8px rgba(232,212,138,0.15)).

---

### 6. THE MARBLE/GRANITE TEXTURE IS MORE VISIBLE

**Reference:** The dark background between panels clearly shows stone texture:
- You can see actual veining patterns
- The surface has visual "weight" — it feels like polished stone
- It's not just dark — it has character

**Ours:** The CSS gradient veins are too subtle at 3-4% opacity. They're
essentially invisible. The SVG noise is also too faint.

**Fix:** Double the vein opacity (to 6-8%). Make veins slightly wider (3-4px).
Increase the SVG noise opacity. The background should be visibly textured,
not just "dark."

---

### 7. THE OUTER FRAME HAS VISIBLE WIDTH

**Reference:** The gold outer frame is ~10-12px wide — visually heavy. It has:
- An outer highlight line
- A broad gold surface with visible gradient (light angle)
- An inner shadow line where it meets the granite
- It casts shadow inward onto the granite surface

**Ours:** 6px padding, which renders as ~6px of gold. Not enough visual weight.
Needs to be 10-12px to match.

**Fix:** Increase `.board-frame` padding to 10px. Add inner shadow along the
granite edge (where frame meets stone).

---

### 8. SHADOW QUALITY

**Reference:** The shadows feel natural — soft, directional, realistic:
- Panels cast shadow DOWN and slightly RIGHT (consistent light source)
- The shadow spread is soft (large blur radius, low opacity)
- There may be a very subtle gold reflection upward from the granite

**Ours:** Shadows exist but they're not creating enough perceived separation.
The panels still feel like they're ON the surface, not ABOVE it.

**Fix:** Increase shadow blur to 14-18px. Add a second softer shadow at
0 6px 20px rgba(0,0,0,0.3). Consider a 1px bright gold highlight on the
TOP edge of each panel (light catching the top of a raised object).

---

## IMPLEMENTATION PRIORITY ORDER

1. Multi-layer frame molding (biggest visual impact)
2. Corner ornament size + fill weight
3. Panel interior radial gradient
4. Outer frame width increase
5. Center panel differentiated treatment
6. Text size/weight hierarchy
7. Background texture visibility
8. Shadow refinement
9. Top panel highlight line

---

## CSS TECHNIQUE FOR MULTI-LAYER MOLDING

The key technique is using `box-shadow` for the inner layers:

```css
.panel {
  border: 1.5px solid #c9a84c;  /* outermost gold line */
  box-shadow:
    /* Layer 3: panel float shadow */
    0 4px 14px rgba(0,0,0,0.5),
    0 2px 4px rgba(0,0,0,0.4),
    /* Layer: outer highlight (bright edge) */
    inset 0 0 0 1px #a08530,
    /* Layer: dark groove (the depth channel) */
    inset 0 0 0 4px #1a1510,
    /* Layer: inner bright ridge */
    inset 0 0 0 5px #8b7225,
    /* Layer: innermost dark edge */
    inset 0 0 0 6px rgba(30,25,15,0.7),
    /* Layer: interior recess shadow */
    inset 0 0 20px rgba(0,0,0,0.4);
}
```

This stacks concentric rings of light-dark-light-dark using inset box-shadows,
creating the cross-section of a carved picture frame molding.
