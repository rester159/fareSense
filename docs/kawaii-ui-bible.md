# Kawaii UI Aesthetic Bible
## The definitive visual design system for kawaii interfaces

*Companion file: `kawaii-interaction-system.md` handles all motion, physics, and gesture behavior. This file handles how things look. Both files must be satisfied simultaneously for every component.*

---

## FOUNDATIONAL PHILOSOPHY

The kawaii design philosophy is **reduction to emotional essence**. Every element is simplified to its most approachable, non-threatening form. The best kawaii characters have minimal or absent facial features — the design effect is that the viewer projects their own emotions onto the character. This principle extends to UI: **never show more than necessary, never make anything sharp or aggressive, always leave room for the user to feel rather than think.**

The three pillars:
1. **Roundness = safety.** Every shape communicates "I won't hurt you"
2. **Simplicity = clarity.** Reduce until there's nothing left to remove, then add one cute detail back
3. **Warmth = connection.** Colors, spacing, and motion all communicate "you are welcome here"

---

## 1. COLOR SYSTEM

### Primary Palette

```css
--kw-red: #E4002B;           /* Signature red. Warm, not cool. Cherry, not crimson */
--kw-pink-hot: #FF6B98;      /* Signature pink — warmer than you think, almost salmon-leaning */
--kw-pink-medium: #F9A8C9;   /* Cheek blush pink — the "kawaii pink" most people imagine */
--kw-pink-soft: #FDD5E5;     /* Background pink — like looking through rose-tinted glass */
--kw-pink-whisper: #FFF0F5;  /* Lightest pink — barely there, for large background areas */
--kw-white: #FFFFFF;          /* Pure white. Mascot characters are WHITE with colored accents */
--kw-yellow: #FFD644;         /* Accent yellow. Warm gold-yellow, not lemon. Think honey */
--kw-black: #2D2D2D;          /* Outlines. Not pure black (#000) — slightly warm charcoal */
```

### Extended Palette

```css
--kw-lavender: #D8B4FE;      /* Dreamy purple */
--kw-mint: #A7F3D0;          /* Fresh green */
--kw-baby-blue: #BAE6FD;     /* Sky blue */
--kw-peach: #FDDCB5;         /* Warm neutral — great for card backgrounds */
--kw-cream: #FFF8E7;         /* Warm white — softer than pure white for large areas */
--kw-lilac: #E8D5F5;         /* Soft purple — secondary accent */

/* === FUNCTIONAL === */
--kw-success: #5EE0A0;       /* Mint green — never harsh emerald */
--kw-warning: #FFD644;       /* Accent yellow doubles as warning */
--kw-error: #FF6B98;         /* Pink, not angry red. Errors should feel gentle */
--kw-info: #BAE6FD;          /* Baby blue */
```

### Color Rules

**CRITICAL:** The kawaii aesthetic is NOT all-pink. Mascot characters are typically WHITE with colored accents. The pink comes from the *world around them*. Primary interactive elements (buttons, icons, key actions) use **red and hot pink**. Backgrounds and containers use **soft pinks and cream.**

- **Never use pure black (#000000).** Always warm charcoal (#2D2D2D) or softer (#4A4A4A)
- **Never use pure gray.** Grays must have a pink or warm undertone: #F5E6EC, #E8DFE3
- **Never use saturated blue, green, or orange as primaries.** Pastel form only
- **Gradients are always soft.** Max 2 stops, same color family
- **Background gradient:** `linear-gradient(135deg, #FFF0F5 0%, #FDD5E5 50%, #FFF8E7 100%)`
- **Text on pink:** #2D2D2D, never pure black
- **Text on white:** #4A4A4A or warm charcoal

---

## 2. TYPOGRAPHY

### Font Stack

```css
/* PRIMARY: Display/Headlines */
font-family: 'Quicksand', 'Nunito', 'Varela Round', sans-serif;

/* SECONDARY: Body text */
font-family: 'Nunito', 'Quicksand', 'Poppins', sans-serif;

/* ACCENT: Rewards, celebrations, scores */
font-family: 'Bubblegum Sans', 'Luckiest Guy', 'Bungee', cursive;
```

### Scale & Weight

```css
--text-xs: 12px;  --text-sm: 14px;  --text-base: 16px;
--text-lg: 20px;  --text-xl: 28px;  --text-2xl: 36px;  --text-3xl: 48px;

--font-medium: 500;      /* Minimum for body */
--font-semibold: 600;    /* Headers, buttons */
--font-bold: 700;        /* Emphasis, scores */
--font-extra-bold: 800;  /* Giant display only */

letter-spacing: 0.02em;  /* Body */
letter-spacing: 0.05em;  /* Headlines */
letter-spacing: 0.08em;  /* Buttons, labels */

line-height: 1.6;  /* Body */
line-height: 1.3;  /* Headlines */
line-height: 1.0;  /* Display numbers */
```

### Don'ts
- No serif fonts (pointed terminals)
- No condensed fonts (feel anxious)
- No all-caps beyond 2-3 words (shouting)
- No font weights below 400 (cold)
- No sharp geometric sans-serifs like Futura (pointed vertices)

---

## 3. SHAPES & BORDER RADIUS

```css
/* NOTHING IS EVER SHARP */
/* Small (badges, tags): */        border-radius: 9999px;
/* Medium (cards, modals): */      border-radius: 24px;
/* Large (sections, hero): */      border-radius: 32px;
/* Buttons: */                     border-radius: 9999px;
/* Inputs: */                      border-radius: 16px;
/* Avatars/images: */              border-radius: 50%;
```

**When in doubt, rounder. `8px` is NOT kawaii. `24px` minimum for containers.**

### Shape Language
- Circles and ovals as primary shapes
- Squircles for cards and containers
- Cloud shapes for speech bubbles and tooltips
- Stars and hearts as decorative accents only
- Scalloped/wavy edges for section dividers
- NO straight-line dividers — use dots, dashes, or decorative elements
- NO sharp triangles — use rounded chevrons for arrows

---

## 4. BORDERS & OUTLINES

```css
/* Standard (interactive elements): */ border: 2.5px solid #2D2D2D;
/* Soft (passive containers): */       border: 2px solid #F9A8C9;
/* Decorative (featured): */           border: 3px solid #E4002B;
/* Double border technique: */
box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #2D2D2D;
/* Dashed decorative: */               border: 2px dashed #F9A8C9;
```

- All interactive elements have visible outlines
- Outlines are ALWAYS rounded (`stroke-linecap: round`)
- Hover thickens outline (2px → 3px) — see interaction system Section 2

---

## 5. SHADOWS

```css
/* Resting: */     0 4px 12px rgba(244, 114, 182, 0.15);
/* Hover: */       0 8px 24px rgba(244, 114, 182, 0.25);
/* Pressed: */     0 2px 4px rgba(244, 114, 182, 0.2);
/* Elevated: */    0 12px 40px rgba(244, 114, 182, 0.2), 0 4px 12px rgba(0,0,0,0.05);
/* Glow: */        0 0 20px rgba(255, 107, 152, 0.4), 0 4px 12px rgba(244, 114, 182, 0.3);
/* Inner glow: */  inset 0 0 12px rgba(255, 107, 152, 0.15);
```

- Never dark gray or black shadows — always pink-tinted
- High blur, low offset = soft glow, not hard drop
- Cards float on clouds, not cast sharp shadows

---

## 6. SPACING

```css
--space-xs: 4px;  --space-sm: 8px;  --space-md: 16px;
--space-lg: 24px; --space-xl: 32px; --space-2xl: 48px; --space-3xl: 64px;

--card-padding: 24px;      --button-padding-x: 32px;
--button-padding-y: 14px;  --section-gap: 48px;
--element-gap: 16px;       --input-padding: 16px;
```

- If it looks right, add 25% more padding
- Center-aligned by default
- Max content width: 480px mobile
- Cards never touch (16px min gap)
- Touch targets: 48px min, 56px preferred

---

## 7. DECORATIVE ELEMENTS

```
├── Bow (featured elements, achievements, premium indicators)
├── Hearts ♡ (bullet points, like indicators, decorative scatter)
├── Stars ☆ (ratings, rewards, sparkle effects)
├── Sparkles ✦ (floating particles, highlights)
├── Flowers (section decorators, background patterns)
├── Paw prints (navigation indicators, loading states)
├── Clouds (speech bubbles, tooltips, section backgrounds)
├── Ribbons (achievement banners, special labels)
└── Polka dots (background patterns at 5-8% opacity)
```

Place in: card corners, section dividers (instead of lines), empty states, loading states, background patterns, beside primary button text.

---

## 8. COMPONENT SPECS

### Buttons
Primary: `gradient(135deg, #FF6B98, #E4002B)`, white text, 9999px radius, 14px 32px padding. → Interaction system Section 2 for animation.
Secondary: white bg, #FF6B98 text, 2.5px solid #FF6B98 border, 9999px radius.
Ghost: transparent, #FF6B98 text, 2px dashed #F9A8C9, 9999px radius.

### Cards
Standard: white, 2px solid #FDD5E5, 24px radius, 24px padding, pink shadow. → Interaction system Sections 3, 9.
Featured: pink gradient bg, 2.5px solid #FF6B98, 28px radius, glow shadow, bow in corner.

### Inputs
White, 2px solid #F9A8C9, 16px radius, 14px 18px padding. Focus: #FF6B98 border + 3px pink glow ring. Errors in #FF6B98 with gentle copy.

### Bottom Tab Bar
White bg, 1px solid #FDD5E5 top border. Active: #E4002B at 1.1x scale. Inactive: #C9A0B0. Heart/circle indicator below active. → Interaction system Section 7.

---

## 9. BACKGROUND PATTERNS

Polka dots (default): `radial-gradient(circle, #F9A8C9 1.5px, transparent 1.5px)` at 24px, 8% opacity.
Hearts: SVG repeat at 4-6% opacity.
Diagonal stripes: `repeating-linear-gradient(45deg, ...)` at 15% opacity.
Gingham: crosshatch pattern at 20% opacity.

One pattern per screen. Background areas only. Polka dots default.

---

## 10. EMOTIONAL DESIGN

**Empty states:** Kawaii illustration + gentle message ("No messages yet! 🎀 Your inbox is waiting~"). Never "No data found."
**Errors:** Pink bg, cute sad character, gentle copy. Never warning triangles or harsh red.
**Loading:** Animated paw prints, bouncing character, pink shimmer skeletons. Never plain spinners. → Interaction system Section 10.
**Celebrations:** Maximalist particles, hearts, stars, screen flash, chime sounds. → Interaction system Section 11.
**Microcopy:** Tildes ("Welcome back~"), kaomoji ((◕ᴗ◕✿)), warm exclamations ("Yay!"), first-person-plural ("Let's go!").

---

## 11. RESPONSIVE

**Mobile (primary):** Single-column, 48-56px touch targets, bottom sheets over modals, sticky bottom CTA, actions in lower 2/3.
**Desktop:** Max 600px content centered, decorative side margins, 2-3 col card grid max, larger decorative elements.

---

## CHECKLIST

- [ ] Corner radius 16px+ (containers) or 9999px (buttons)
- [ ] No pure black or gray — all warm-tinted
- [ ] Pink-tinted shadows
- [ ] Font weight 500+, rounded font family
- [ ] Pill-shaped buttons
- [ ] At least one decorative element per screen
- [ ] Warm background (cream/pink, not pure white)
- [ ] Bounce/spring easing on all transitions (see interaction system)
- [ ] Gentle error states
- [ ] 48px+ touch targets
- [ ] Generous spacing
- [ ] Decorative dividers, not solid lines
- [ ] Vibe: "I want to hug this app"
