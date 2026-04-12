# VISUAL AUDIT: Reference vs. Our Current Output

Conducted 2026-04-11 by comparing:
- Image 2 (wide reference photo of physical board)
- Image 5 (closer reference photo / digital mockup)
- Image 6 (our latest screenshot)

---

## 1. FRAME STYLE

### Reference (Images 2 & 5):
- The frames around each panel are **thick, multi-layered gold borders**. They are NOT simple single-stroke rectangles.
- Each frame has at minimum **three visible concentric layers**: an outer thin bright gold line, a slightly darker/shadowed middle band, and an inner bright gold line. This creates a **beveled, dimensional look** like a real carved wooden picture frame.
- The corners are **sharp right angles** (not rounded). There are no rounded corners anywhere on the reference frames.
- Along the straight edges of the frame, the border has a subtle **ribbed or reeded texture** -- it is not perfectly smooth. It appears to have fine parallel lines running along the length of the border, mimicking carved wood molding.
- The overall frame thickness is substantial -- roughly 12-18px equivalent at screen resolution, creating a heavy, authoritative border around each panel.
- The inner edge of each frame has a very thin **dark line** (almost black) that separates the gold frame from the panel interior, creating a "mat" or inset effect.

### Our Version (Image 6):
- Our frames are **single-line gold strokes** with slight glow effects. They look like CSS `border: 2px solid gold` with maybe a `box-shadow`.
- We have **rounded corners** (`border-radius`) which the reference does NOT have.
- There is NO multi-layered beveled effect. Our borders are completely flat.
- The frame thickness is much thinner than the reference -- maybe 2-3px vs the reference's 12-18px visual weight.
- We have diagonal gold decorative lines radiating from the center panel into the background -- these do NOT exist in the reference at all. The reference background is plain dark, not decorated with radiating lines.

### Gap Assessment: LARGE. Our frames look like simple CSS borders. The reference frames look like physical carved gold picture frames. We need nested borders with gradient shading to simulate depth/bevel.

---

## 2. CORNER ORNAMENTS

### Reference (Images 2 & 5):
- Each panel has **ornate corner decorations** at all four corners of the frame.
- The corner pieces are **relatively small** -- they extend roughly 15-25% of the way along each edge from the corner. They do NOT run along the full edge.
- The ornament shapes include: **tight scrollwork/volutes** (spiral curls), small **leaf/acanthus motifs**, and thin **flourish lines** that taper to points.
- The ornaments are the SAME gold color as the frame but appear slightly more detailed/bright, as if they are raised relief elements on the frame.
- They sit AT the corners, essentially decorating the junction point where the two frame edges meet. They appear to be ON TOP of the frame, not floating outside it.
- The center panel (Image 2, physical board) has MORE elaborate corner ornaments -- larger and more detailed than the side panels.
- NO decorative elements run along the middle portions of the frame edges. The edges between corners are plain molding.

### Our Version (Image 6):
- We have corner ornaments but they appear to be **very small, thin, single-line L-shaped marks** with tiny curls.
- They are much less substantial than the reference. The reference ornaments have visible mass and intricacy; ours are wispy thin lines.
- Our ornaments appear to be positioned correctly at corners but lack the visual weight and complexity of the reference.

### Gap Assessment: MEDIUM. We have ornaments but they need to be 2-3x larger, with more complex scrollwork shapes, and rendered with more visual weight/thickness.

---

## 3. BACKGROUND BETWEEN PANELS

### Reference (Image 2 - physical board):
- The background visible between panels is a **deep navy/dark blue**, almost black but with a clear blue undertone.
- There is a subtle **wood-grain or matte texture** visible in the physical board's background.
- The gaps between panels are **relatively narrow** -- the panels are packed tightly together with only small margins.
- The overall impression is of panels mounted on a dark blue velvet or felt-covered board.

### Reference (Image 5 - closer/digital):
- Background is **pure black** or very close to it.
- Between the panels there is minimal gap -- the gold frames sit close together.
- There appears to be a very subtle dark gradient or slight warmth in the black, but it reads as essentially black.

### Our Version (Image 6):
- Background is black, which is correct.
- BUT we have those **diagonal gold radiating lines** emanating from behind the center panel, creating a sunburst/starburst pattern. This is NOT in the reference and significantly changes the visual character. It makes the background look busy and "techy" rather than the quiet, dignified dark backdrop of the reference.
- The spacing between panels appears similar.

### Gap Assessment: MEDIUM. Remove the diagonal radiating lines entirely. The background should be clean, dark, and quiet. The gold should ONLY be in the frames, ornaments, and text -- not in background decorations.

---

## 4. CENTER PANEL

### Reference (Image 2 - physical board):
- The center panel is **distinctly different** from the side panels. It is a **feature panel** that stands out.
- It has a **lighter background** -- appears to be a cream/off-white or very light tan color, NOT the dark/black background of the side panels.
- The frame around the center panel is **more ornate and heavier** than the side panel frames. It appears to have an extra layer or two of border detail.
- Inside the frame, there appears to be a **visible inner mat/border** -- a secondary gold or tan border creating a double-frame effect (like a picture with a mat inside the frame).
- The center panel contains what appears to be an image of an **aron kodesh (Torah ark)** or similar synagogue element at the top.
- Below the image are text elements.
- The center panel is **taller** than the side panels (or at least more visually prominent).
- There is a **blue accent band or background element** visible within the center panel's upper portion, distinguishing it from the cream lower area.

### Reference (Image 5 - closer/digital):
- The center panel has a **dark background** (matching the other panels in this version).
- It contains a **small icon** (appears to be a Torah/book icon) at the top.
- Below that: Hebrew title text ("דאלי השבוע" / Daily of the Week or similar).
- Below that: subtitle text.
- Below that: a **bar chart/graph** with colored bars (purple, yellow/gold, green columns).
- Below the chart: caption/source text.
- The center panel frame matches the side panels but the content is distinct.

### Our Version (Image 6):
- Our center panel follows Image 5 fairly well -- dark background, icon, Hebrew text, bar chart.
- The chart appears present with colored bars.
- Frame style matches our other panels (same issue as noted above -- too thin, rounded corners).

### Gap Assessment: SMALL for content layout (matches Image 5 reasonably). If targeting Image 2's physical board look, we would need a cream/light background for the center panel and a more ornate frame -- but Image 5 suggests the digital version uses dark backgrounds consistently, so our approach may be correct for the digital version.

---

## 5. TEXT STYLING

### Reference (Image 5 - closest readable):
- **Time values** (left column numbers like 7:20, 6:58, etc.) are rendered in **bold, bright gold** with significant visual weight. They are clearly the dominant text element in each row.
- The time numbers appear to be roughly **18-22pt equivalent**, large and immediately readable.
- **Hebrew labels** (right column text like "שחרית", "מנחה", etc.) are in a **lighter gold or off-white/cream color** -- noticeably less bright than the time values.
- Hebrew labels appear to be roughly **12-14pt equivalent** -- smaller and lighter weight than the times.
- There is a **clear visual hierarchy**: times are BIG and BRIGHT, labels are smaller and more subdued. Your eye goes to the numbers first.
- The text has a **subtle warm glow or bloom** effect -- not a hard-edged glow, but a gentle warmth that makes the gold text feel luminous against the dark background.
- Row spacing is generous -- each row has clear breathing room.
- Some text appears to use a **serif or decorative font** for Hebrew labels, while numbers may use a cleaner face.

### Our Version (Image 6):
- Time values and Hebrew labels are visible but the image is small. From what is visible:
- The text hierarchy appears present but the contrast between times and labels may not be as stark as the reference.
- Text appears to be rendered in gold/yellow tones.
- The overall readability seems reasonable but may lack the luminous warmth of the reference.

### Gap Assessment: SMALL-MEDIUM. Ensure time values are significantly brighter/bolder than labels. Add a subtle warm text-shadow glow to gold text elements.

---

## 6. COLOR PALETTE

### Reference:
- **Gold**: Warm, rich, antique gold. NOT bright yellow, NOT cool/silvery. Think #D4A843 to #C5963A range -- a gold with amber/honey warmth. Has slight variation between brighter highlights and darker shadow areas.
- **Background**: Deep, near-black. In Image 2 it has a definite **navy/dark blue** cast. In Image 5 it reads as nearly pure black (#0a0a0f or similar) but with warmth.
- **Panel interiors**: Very dark -- black or very dark navy (#0d0d1a range). NOT pure #000000 -- there is warmth/depth.
- **Text**: Gold for values, slightly lighter/cream gold for labels. Some text may be white or near-white.
- **Ribbon/title backgrounds**: A rich **navy blue** (#1a237e to #0d1b4a range) -- clearly blue, not black, providing contrast against the dark background.
- **Blue accents**: The ribbon title bars and some accent elements use a **saturated dark blue** that reads clearly as blue, not just dark.
- **Red/maroon accents**: In Image 5, the bottom-right panel ("שיעורים") has what appears to be **dark red/maroon colored rows** for certain items, distinguishing them from the gold text. This provides important visual variety.

### Our Version (Image 6):
- Gold appears similar but possibly slightly more yellow/bright rather than the warmer antique gold of the reference.
- Background is black, appears correct.
- The blue in ribbon titles appears present.
- The radiating diagonal lines add unwanted gold to the background.

### Gap Assessment: SMALL. Fine-tune gold toward warmer/more amber tones. Ensure ribbon blues are rich and saturated. Remove background gold decorations.

---

## 7. RIBBON TITLES

### Reference (Images 2 & 5):
- Each panel has a **ribbon/banner title** at the top.
- The ribbon shape is a **horizontal rectangle with pointed/arrow-shaped ends** -- the classic "ribbon banner" shape where the left and right ends come to inward-pointing V-notches (like a bookmark or flag shape).
- The ribbon has a **solid dark navy blue background** with **gold text** centered on it.
- The ribbon **overlaps the top edge of the frame** -- it sits partially ON the frame border and partially above/inside it. It bridges the frame edge, which creates a layered, dimensional look.
- The ribbon appears to have a subtle **gold border or outline** around it.
- The ribbon extends nearly the full width of the panel, with the pointed ends stopping just inside or at the frame edges.
- The ribbon has a **slight 3D effect** -- there may be a thin shadow or darker band along the bottom edge suggesting depth.

### Our Version (Image 6):
- We have ribbon titles that appear to use a similar shape concept.
- From the screenshot, the ribbons appear present with blue backgrounds and gold text.
- The overlap with the frame edge is visible.
- The pointed end shape appears to be implemented.

### Gap Assessment: SMALL. Ribbons appear reasonably close. May need minor refinement to the V-notch depth and ensuring proper overlap with frame edge. Verify the navy blue is rich enough.

---

## 8. WHAT SPECIFIC ELEMENTS CREATE THE "PREMIUM" FEEL WE LACK

### Critical Missing Elements (in priority order):

1. **MULTI-LAYER BEVELED FRAMES**: This is the #1 gap. The reference frames look like real carved gold picture frames with depth, shadow, highlight bands, and texture. Our frames look like CSS borders. We need:
   - Outer bright gold line (1-2px)
   - Dark shadow band (2-3px)
   - Middle gold band (4-6px) with subtle gradient (lighter on top/left, darker on bottom/right to simulate light direction)
   - Inner dark line (1px)
   - Inner bright gold line (1-2px)
   - Total visible frame thickness: ~12-18px
   - ALL CORNERS SHARP (border-radius: 0)

2. **REMOVE DIAGONAL BACKGROUND LINES**: The radiating gold lines behind the center panel are the #2 issue. They make our version look like a "tech dashboard" rather than a "synagogue display board." The reference has a clean, quiet, dark background. All visual richness comes from the frames and text, not background decorations. Remove them entirely.

3. **CORNER ORNAMENT SIZE AND COMPLEXITY**: Our ornaments need to be 2-3x larger and more intricate. Consider using SVG corner pieces with actual scrollwork paths rather than simple CSS-drawn shapes. The reference ornaments have visible spirals, leaf shapes, and flowing curves.

4. **WARM GOLD TONE**: Shift our gold slightly toward amber. Less #FFD700 (bright yellow gold), more #D4A843 or #C9A84C (antique warm gold). The reference gold has a honey/amber warmth that reads as "old world luxury" rather than "digital highlight."

5. **TEXT LUMINOSITY**: The reference text has a subtle warm glow -- not a harsh neon glow, but a gentle bloom that makes gold text feel like it is lit from within. This could be achieved with a subtle `text-shadow: 0 0 8px rgba(212, 168, 67, 0.3)`.

6. **SHARP CORNERS EVERYWHERE**: Our rounded corners (border-radius) make every element feel "modern web." The reference is all sharp right angles, which reads as "traditional/formal."

7. **QUIET NEGATIVE SPACE**: The reference's dark background between panels is simply dark and quiet. This restraint makes the gold frames and text POP. Our busy background competes with the content.

8. **FRAME-TO-CONTENT RATIO**: The reference frames are visually substantial relative to the content area. They take up real estate and command attention. Our thin borders disappear and make the panels look like floating cards rather than framed displays.

### Summary of Priority Fixes:
| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| P0 | Multi-layer beveled gold frames with sharp corners | High | Transformative |
| P0 | Remove diagonal background decoration lines | Low | Major |
| P1 | Enlarge and add detail to corner ornaments | Medium | Significant |
| P1 | Warm up gold tones toward amber | Low | Moderate |
| P2 | Add subtle warm text glow | Low | Moderate |
| P2 | Ensure strong text hierarchy (bold times vs lighter labels) | Low | Moderate |

### The Core Insight:
The reference board achieves its premium feel through **material simulation** -- it looks like physical gold frames on a dark surface. Every element suggests carved wood, polished metal, and rich fabric. Our version currently looks like a well-styled web dashboard. The gap is not about layout or content -- it is about **surface treatment and materiality**. The fix is almost entirely in the frame rendering and background simplification.
