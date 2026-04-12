# Shul Display Board — Senior Designer's Exhaustive Visual Brief

## The Reference Standard
We are recreating a Dee Zee Systems synagogue display board — the kind you see in
high-end Orthodox shuls. These are NOT cheap digital signs. They are designed to feel
like a **physical artifact** — a gilded plaque mounted on polished black granite,
with gold-leafed frames holding illuminated panels. Think of the parochet
(Torah ark curtain) aesthetic: rich, layered, reverent.

---

## DEPTH MODEL — 7 Layers (back to front)

The entire visual impact comes from DEPTH. Each layer must be visually distinct:

### Layer 0: The Wall (outermost)
- Pure black. The TV bezel disappears into this.

### Layer 1: Gold Outer Frame
- A thick metallic gold border wraps the entire display
- It must feel PHYSICAL — like gilded wood
- Multi-stop gradient simulating light hitting a 3D gold molding
- Has its own inner shadow (the frame has thickness/depth)
- Think: museum picture frame, not a CSS border

### Layer 2: Black Granite Surface
- The background BETWEEN and BEHIND all panels
- NOT flat black — it's polished black granite/marble
- Subtle grey-white veining streaks at diagonal angles
- A very faint noise/grain texture for organic feel
- This surface should be VISIBLE — panels don't cover every inch
- The gaps between panels (12-16px) reveal this stone surface
- This is what gives the board its "mounted on stone" feel

### Layer 3: Panel Shadows
- Each panel casts a subtle drop shadow DOWN onto the granite
- Shadow: 0 2px 8px rgba(0,0,0,0.6) — soft, directional (top-lit)
- This makes panels FLOAT above the stone surface
- The shadow is what creates the "installed" look

### Layer 4: Panel Frames (the gold borders around each section)
- 2-3px solid gold border with gradient (light gold top, dark gold bottom)
- Creates the "gilded frame" around each content area
- Inner border (1px, subtle) creates a beveled/inset appearance
- The frame has a slight inner glow (very subtle gold light bleeding inward)
- Background inside the frame is SLIGHTLY different from the granite
  — darker, more uniform, like a dark velvet or dark slate behind glass

### Layer 5: Panel Content
- Text, times, data — sits inside the frame
- Generous padding from frame edge (16-20px)
- Gold/cream text with very subtle text-shadow for readability
- Row dividers are BARELY visible (5-8% opacity gold lines)
- The content feels "engraved" or "printed on" the dark panel surface

### Layer 6: Frame Decorations (corner ornaments, ribbons)
- Corner scrollwork ornaments sit ON TOP of the frame junction
- They overlap the frame border — they're "attached" to the frame
- Gold with highlight gradients (light catching the curves)
- Ribbon titles span the top edge of frames
- They feel like brass nameplates screwed onto the frame

### Layer 7: Ambient Light Effects
- Very subtle gold glow around the outer frame (0.1 opacity)
- Slight vignette darkening at screen edges
- The center panel may have a slightly brighter ambient feel

---

## SPACING RULES

### Between panels (the gaps)
- **12-16px gaps** between adjacent panels
- The granite background SHOWS THROUGH these gaps
- This is critical — it proves the panels are separate objects mounted on stone
- Current design has 4px gaps — WAY too tight

### Inside panels (content padding)
- **16-20px padding** from the gold frame to the first content
- Ribbon title has 10-12px space below it before content starts
- Time rows have 6-8px vertical padding each
- The content should never feel cramped against the frame

### Between the outer gold frame and the panels
- **10-12px margin** — granite shows between the outer frame and first panel
- Panels don't touch the outer frame

---

## COLOR PALETTE (refined)

### Gold spectrum (for frames, borders, accents)
- Highlight gold: #e8d48a (where light hits)
- Primary gold: #c9a84c (standard gold)
- Mid gold: #a08530 (shadows on gold)
- Deep gold: #7a6520 (recessed gold)
- Shadow gold: #4a3e1a (darkest gold, inner shadows)

### Background surfaces
- Panel interior: #0a0a10 (near-black with very slight blue)
- Granite surface: #080808 (true near-black)
- Marble vein color: rgba(160,160,170,0.04) (barely visible grey)

### Text
- Primary text (times, titles): #e8d48a (warm gold)
- Secondary text (labels): #c9a84c
- Tertiary text (subtitles): #7a6a3a
- Inactive/dim text: #4a4030

---

## PANEL-SPECIFIC NOTES

### Zmanim panels (left column)
- Clean, tabular layout
- Time values LEFT-aligned, labels RIGHT-aligned (RTL)
- Each row has ample breathing room
- The gold frame should feel like a "brass nameplate holder"

### Center panel (Weekly Daf)
- This is the HERO element — largest, most ornate
- Has a DIFFERENT feel from side panels
- More elaborate frame (thicker, with architectural columns or extra ornaments)
- The interior may have a slightly lighter background or a gradient
- Contains imagery (sefarim) that should look rich, not like SVG wireframes
- In the reference, this panel almost looks like a FRAMED POSTER

### Davening Schedule (top-right)
- Compact but not cramped
- Section dividers (dashed gold lines) with breathing room

### Shiurim (bottom-right)
- Two sections (Chol / Shabbat Kodesh)
- Each entry has icon + time + description
- Generous spacing between entries

### Bottom ticker
- Thin gold border on top
- Sits flush at the bottom
- Scrolling text with comfortable font size

---

## WHAT MAKES IT FEEL EXPENSIVE vs. CHEAP

### Expensive (what we want):
- Visible depth/layers — you can almost FEEL the stone surface
- Gold that looks metallic (gradient shifts, not flat color)
- Shadows that create floating effect
- Generous internal spacing (content breathes)
- Visible background texture between panels
- Corner ornaments that feel solid and crafted
- Consistent visual weight across all elements

### Cheap (what we must avoid):
- Flat backgrounds with no texture
- Single-color gold (no gradient)
- Panels jammed edge-to-edge
- No shadows (everything on same plane)
- Rounded corners on panels (too modern/app-like)
- Thin wispy decorations
- Inconsistent spacing
- Bright/neon gold (#FFD700 — never use this)
- Any glow effects that look "digital"
