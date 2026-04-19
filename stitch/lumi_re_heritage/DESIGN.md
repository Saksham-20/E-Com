# Design System: High-End Editorial Jewelry Experience

## 1. Overview & Creative North Star: "The Digital Atelier"
The Creative North Star for this design system is **"The Digital Atelier."** We are not building a generic storefront; we are creating a curated, editorial experience that mirrors the hushed, prestigious atmosphere of a private showroom on Place Vendôme.

To break the "template" look, this system rejects rigid, boxed-in grids. Instead, it utilizes **intentional asymmetry**, **overlapping imagery**, and **extreme typographic contrast**. We treat the screen as a canvas where high-end photography is the protagonist, and the UI is the invisible, sophisticated curator. Whitespace is not "empty"—it is a luxury material used to give products room to breathe.

---

## 2. Colors & Tonal Depth
Our palette is rooted in a heritage of luxury. We use high-contrast neutrals to establish authority, with gold and teal used only as surgical accents.

### Color Tokens
*   **Primary (Charcoal):** `#1A1A1B` (The color of precision and evening elegance)
*   **Secondary (Gold):** `#D4AF37` (Used for "Moments of Value"—CTAs, price points, and iconography)
*   **Tertiary (Teal):** `#0ABAB5` (Used sparingly for "Heritage Accents"—packaging indicators or limited editions)
*   **Surface (Ivory):** `#FAF9F7` (Our primary canvas; warmer and more expensive-feeling than pure white)

### The "No-Line" Rule
To maintain an editorial feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries between content blocks must be defined solely through background color shifts. Use `surface-container-low` for a section following a `surface` section to create a soft transition.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine stationery.
*   **Background (`#FAF9F7`):** The base desk.
*   **Surface-Container-Low:** Use for secondary information blocks.
*   **Surface-Container-Lowest (`#FFFFFF`):** Use for "Floating Cards" to create a subtle lift.
*   **Glassmorphism:** For navigation bars or modal overlays, use `surface-variant` at 80% opacity with a `20px` backdrop blur. This ensures the jewelry photography remains visible even when obscured, maintaining a sense of depth.

---

## 3. Typography
The typographic soul of this system lies in the tension between the classic Serif and the modern Sans-serif.

### The Scale
*   **Display (Noto Serif):** Set with high tracking (-2% for large sizes) and generous line height. Use this for brand statements and collection titles. 
*   **Headline (Noto Serif):** Italicize specific words within headlines to create an editorial "pulse."
*   **Body (Inter):** Use `body-lg` (1rem) for product descriptions. Increase letter spacing (0.02em) to ensure a premium, airy feel.
*   **Labels (Inter):** Always uppercase with 10% letter spacing. Use for navigation and metadata to convey a "catalog" aesthetic.

**Identity Note:** Headlines should feel like a masthead. Don't be afraid to overlap a Headline-LG over a high-quality product image (using an 80% opacity on-primary color) to create a layered, magazine-style layout.

---

## 4. Elevation & Depth
In luxury, "loud" shadows are cheap. We use **Tonal Layering** and **Ambient Light**.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card sitting on a `surface-container-low` background creates a natural hierarchy without a single drop shadow.
*   **Ambient Shadows:** If a "floating" effect is required (e.g., a "Quick Buy" modal), use a shadow color derived from our Charcoal (`#1A1A1B` at 4% opacity) with a blur radius of `40px` and a `Y-offset` of `20px`. It should feel like a soft glow, not a dark edge.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token at **15% opacity**. A 100% opaque border is a failure of the design system.

---

## 5. Components

### Buttons
*   **Primary:** Solid Charcoal (`#1A1A1B`). Sharp 0px corners. Text is `label-md` in Ivory, centered. 
*   **Secondary (The "Gold Link"):** No background. Gold (`#D4AF37`) text with a 1px Gold underline that expands on hover.
*   **Hover State:** On hover, the Primary button shifts to a 90% opacity with a subtle `2px` upward slide (transform: translateY(-2px)).

### Inputs & Text Fields
*   **Style:** Minimalist underline only (using `outline-variant` at 20%). On focus, the underline transitions to Gold (`#D4AF37`).
*   **Labels:** Always float above the field in `label-sm` Charcoal.

### Cards (Product & Editorial)
*   **Rule:** Forbid divider lines.
*   **Layout:** Use a "Caption" style. The image occupies 100% of the card width, with the product name and price centered underneath, separated by `16px` of whitespace (`spacing-md`).
*   **Interaction:** On hover, the image should subtly scale (1.05x) within its frame, creating a "zoom-in" effect that invites the user to inspect the craftsmanship.

### Signature Component: The "Atelier Carousel"
Instead of a standard horizontal scroll, use an asymmetrical layout where the main image is large (60% width) and the supporting product details and CTA are offset to the side, bleeding into the next slide's whitespace.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. Place a product image off-center to create visual interest.
*   **Do** use "Optical Sizing." If a Serif font is used at a small size, ensure the weight is slightly heavier to maintain legibility.
*   **Do** prioritize "The Breath." If you think you need more content, you probably need more whitespace instead.

### Don’t:
*   **Don’t** use rounded corners (`0px` radius is mandatory). Sharp edges convey precision, luxury, and architectural stability.
*   **Don’t** use standard "Sale" red. For errors or alerts, use the `error` token (`#BA1A1A`) but keep it contained within a small, sophisticated icon or thin-line element.
*   **Don’t** use heavy dividers. If a visual break is needed, use a `24px` or `48px` vertical gap from the spacing scale.
*   **Don’t** use generic icons. Use thin-stroke (1px) custom iconography that matches the weight of the Inter typeface.