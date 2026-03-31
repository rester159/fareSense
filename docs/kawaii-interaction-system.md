# Kawaii Interaction System
## The definitive motion, physics, and gesture specification

*Companion file: `kawaii-ui-bible.md` handles all visual styling — colors, typography, shapes, shadows. This file handles how things move and feel. Both files must be satisfied simultaneously for every component.*

---

## GLOBAL ANIMATION CONSTANTS

These values are referenced throughout the document. Define them once, use everywhere.

```css
/* === EASING CURVES === */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);     /* Standard kawaii bounce */
--ease-soft: cubic-bezier(0.25, 0.46, 0.45, 0.94);     /* Gentle settle */
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Springy overshoot */
--ease-squish: cubic-bezier(0.68, -0.55, 0.265, 1.55);  /* Extreme bounce for celebrations */

/* === DURATION SCALE === */
--duration-instant: 100ms;   /* Micro-feedback (color flash) */
--duration-fast: 200ms;      /* Hover states, toggles */
--duration-normal: 350ms;    /* Entrances, card flips */
--duration-slow: 500ms;      /* Page transitions, modals */
--duration-dramatic: 800ms;  /* Celebrations, reward reveals */
```

**UNIVERSAL RULES** — apply to every animation in the app:
- NEVER use `linear` easing. Everything has soft start/stop
- NEVER use sharp snapping. Everything overshoots slightly and settles
- NEVER have elements blink on/off. Always fade with scale
- During active touch/drag, elements track the finger with ZERO easing (1:1 direct manipulation). Easing is for AFTER release only
- All motion should feel like a plush toy being squeezed and released — soft, bouncy, slightly exaggerated

---

## 1. SCROLL

### Specification

The scroll system uses momentum-based physics with rubber-banding at boundaries.

**During scroll:**
- Content tracks finger position 1:1 with zero latency
- No easing during active touch — pure direct manipulation

**After finger lift:**
- Velocity from the finger gesture transfers to the content
- Deceleration uses physics-based friction decay: fast initially, gradually slower
- A fast flick scrolls far with gradual deceleration. A slow drag stops quickly

**At boundaries (top/bottom of list):**
- Content stretches past the boundary with exponentially increasing resistance — like pulling a rubber band
- The further you pull past the edge, the harder it resists
- On release, content springs back to the boundary using `--ease-spring` over 350ms
- This rubber-band effect communicates "you've reached the end" through feel, not a visual indicator

**Snap points (for paged/card content):**
- Each page/card has a defined snap position
- After release, content animates to nearest snap point using `--ease-spring` over 400ms
- Velocity-aware: a fast flick skips to the next snap, a slow drag settles on the nearest

---

## 2. BUTTON PRESS

### Specification

Buttons are 3D extruded objects. They have a visible bottom edge (a darker shade creating a raised look), and pressing physically depresses them.

**Rest state:**
- 4px bottom border in a darker shade of the button color (creates 3D raised look)
- Shadow as defined in aesthetic bible Section 5 (resting shadow)
- Scale: 1.0

**Press (on touch/click down):**
- `transform: scale(0.92) translateY(4px)` — button moves down into the surface
- Bottom border shrinks to 0px (button is now flush)
- Shadow compresses to pressed value from aesthetic bible
- Slight brightness increase: `filter: brightness(1.05)`
- Duration: `--duration-instant` (100ms)
- Easing: `--ease-soft`

**Release (on touch/click up):**
- `transform: scale(1.0) translateY(0)` — springs back up
- Overshoots to `scale(1.05)` then settles to `scale(1.0)`
- Bottom border returns to 4px
- Shadow returns to resting
- Duration: `--duration-fast` (200ms)
- Easing: `--ease-bounce`
- **Primary action buttons only:** tiny sparkle particle burst (3-5 particles, ✦ shape, radiating outward 20-30px, fading over 400ms) on release. Colors from aesthetic bible accent palette.

**Hover (desktop only):**
- `transform: scale(1.03) translateY(-2px)`
- Shadow deepens to hover value from aesthetic bible
- Border thickens by 0.5px (outline "puffs up")
- Duration: `--duration-fast` (200ms)
- Easing: `--ease-soft`
- NEVER use opacity change for hover. Scale + elevation always.

---

## 3. CARD SWIPE

### Specification

Cards follow the finger with physics-based rotation, momentum-based throw, and spring snapback.

**During drag:**
- Card position tracks finger 1:1, zero latency, no easing
- Card rotates proportionally to horizontal drag distance: `rotation = dragX * 0.08` degrees
- Rotation is also affected by the vertical touch origin: touching from the top of the card produces ~2x more rotation than touching from the center
- As drag exceeds 30% of screen width, a contextual stamp fades in on the card:
  - Drag right: acceptance indicator (heart, green tint). Opacity = `(dragX - threshold) / maxDrag`
  - Drag left: rejection indicator (X, pink tint). Same opacity formula
- Card elevation increases during drag: shadow deepens to elevated value from aesthetic bible

**On release — BELOW threshold (< 30% screen width):**
- Card springs back to center position
- Rotation returns to 0
- Stamp fades out
- Easing: `--ease-spring`
- Duration: `--duration-normal` (350ms)
- Slight overshoot past center (2-3px), then settle

**On release — ABOVE threshold:**
- Card flies off-screen in the direction of the drag
- Velocity from finger gesture is preserved and amplified 1.5x
- Card continues rotating in the drag direction as it exits
- Stamp reaches full opacity
- Duration: `--duration-normal` (350ms)
- Easing: `--ease-soft` (no bounce — it's leaving)

**Stack behavior:**
- Cards behind the active card scale from 0.95 → 1.0 and translate upward as the top card moves
- This "next card rising" animation uses `--ease-spring` over `--duration-normal`
- Visible stack depth: show 2 cards behind the active card with progressive scale-down (0.95, 0.90) and vertical offset (8px, 16px)

---

## 4. PULL TO REFRESH

### Specification

Pull-to-refresh uses resistance-based feedback with a threshold trigger moment.

**Pull phase (dragging down from top of list):**
- Content follows finger but with increasing resistance: `displayOffset = dragDistance * (1 - dragDistance / (screenHeight * 2))`
- A refresh indicator progressively draws itself: stroke-dashoffset tied to drag distance
- Indicator rotates slightly as you pull (0 → 180 degrees over full pull distance)

**Threshold moment (at 80px pull distance):**
- Haptic feedback: single medium impact
- Indicator completes its circle drawing
- Subtle scale pulse on indicator: 1.0 → 1.2 → 1.0 over 200ms
- This is the "commitment" moment — the user knows they've pulled far enough

**Release after threshold:**
- Content springs to a "refreshing" position (indicator visible, content offset 60px)
- Easing: `--ease-spring`
- Indicator enters continuous rotation: 1 revolution per 800ms, `linear` easing (the ONE exception to the no-linear rule — continuous rotation must be linear)

**Completion:**
- New content slides in from above with `--ease-bounce` over `--duration-slow`
- Indicator shrinks to 0 with `--ease-soft` over `--duration-fast`
- Content settles to final position with `--ease-spring`

**Release before threshold:**
- Everything springs back to rest: content position, indicator progress, rotation
- Easing: `--ease-spring` over `--duration-normal`

---

## 5. TOGGLE / SWITCH

### Specification

Toggles have weighted spring physics with a squash-and-stretch knob.

**Knob movement:**
- Slides from one side to the other using `--ease-spring` over 250ms
- During fast toggling, the knob subtly widens in the direction of travel: `scaleX(1.15) scaleY(0.9)` at the midpoint, returning to `scale(1.0)` at the endpoint
- This squash-and-stretch gives the knob a sense of mass and momentum

**Track color:**
- Wipes from one color to the other in sync with knob position
- Active: gradient from `--kw-pink-hot` to `--kw-red` (see aesthetic bible)
- Inactive: `#E8DFE3` (warm gray from aesthetic bible)
- Duration: 200ms, `--ease-soft`

**Endpoint arrival:**
- Scale pop on knob: 1.0 → 1.15 → 1.0 over 150ms, `--ease-bounce`
- Single sparkle (✦) at the new position, fading over 300ms
- Haptic: single light impact

**Drag support:**
- User can drag the knob directly (not just tap)
- During drag: knob tracks finger 1:1
- On release: snaps to nearest endpoint using `--ease-spring`

---

## 6. BOTTOM SHEET / DRAWER

### Specification

Bottom sheets slide on a track with multiple detent (snap) points and spring physics.

**Detent positions:**
- **Peek:** Shows header/search bar only (~15% screen height)
- **Half:** Shows primary content (~50% screen height)
- **Full:** Shows all content (~90% screen height)

**During drag:**
- Sheet position tracks finger 1:1, zero latency, no easing
- Background dimming interpolates with sheet position: 0% at peek, 40% at full (`rgba(45, 45, 45, 0.4)` — warm, not cool gray)

**On release:**
- Sheet animates to the nearest detent point
- Easing: `--ease-spring`
- Duration: `--duration-slow` (500ms)
- Velocity-aware: a fast upward flick from peek skips half and goes to full. A slow drag settles on the nearest detent

**Rubber-banding at limits:**
- Pulling past full-open: sheet stretches with exponentially increasing resistance, springs back on release
- Pulling below peek: same resistance, then springs back OR dismisses if pulled past a dismiss threshold (40% below peek)

**Dismiss:**
- When pulled below dismiss threshold and released: sheet accelerates downward and exits
- Background dimming fades to 0
- Duration: `--duration-normal` (350ms)
- Easing: `--ease-soft`

**Content scroll handoff:**
- When sheet is at full detent and content inside is scrollable: the gesture seamlessly transitions from "moving the sheet" to "scrolling the content"
- When content is scrolled to top and user continues pulling down: gesture transitions back from "scrolling" to "moving the sheet down"
- This transition must be seamless with zero visual jank

**Visual style:** See aesthetic bible Section 5 for elevated shadow, Section 3 for border radius (32px top corners).

---

## 7. TAB / SEGMENT SWITCH

### Specification

Tab switching uses a sliding pill indicator with spring physics and content transition.

**Pill indicator:**
- A filled background shape (using aesthetic bible primary gradient) slides between tab positions
- Easing: `--ease-spring`
- Duration: `--duration-normal` (350ms)
- Slight overshoot past target position (3-4px), then settles

**Active tab:**
- Icon scales to 1.1x with `--ease-bounce` over `--duration-fast`
- Color transitions to `--kw-red`
- Small indicator shape (heart or circle) appears below icon, scaling from 0 → 1.0 with `--ease-bounce`

**Inactive tab (deactivating):**
- Icon scales from 1.1 → 1.0 with `--ease-soft`
- Color fades to `#C9A0B0`
- Indicator scales from 1.0 → 0 with `--ease-soft`

**Content area:**
- Content cross-fades with a subtle horizontal parallax shift in the direction of navigation
- Moving to a tab on the right: old content shifts left 20px and fades out, new content enters from right 20px and fades in
- Duration: `--duration-normal`
- Easing: `--ease-soft`

---

## 8. LONG PRESS / CONTEXT MENU

### Specification

Long press uses a two-phase build-up (anticipation → trigger) followed by a spatial elevation effect.

**Phase 1 — Anticipation (0-400ms hold):**
- Element scales to 0.95 with `--ease-soft`
- Slight darkening: `filter: brightness(0.97)`
- Background begins to blur: `backdrop-filter: blur(0px → 4px)`
- This phase communicates "keep holding"

**Phase 2 — Trigger (at 400ms):**
- Haptic: medium impact
- Element springs to scale(1.05): it "lifts off" the page
- Shadow jumps to elevated value from aesthetic bible
- Background blur completes to 8px
- Context menu fades in below/above the element:
  - `opacity: 0 → 1`, `scale(0.9) → scale(1.0)`, `translateY(8px) → translateY(0)`
  - Easing: `--ease-bounce`
  - Duration: `--duration-fast` (200ms)

**Menu item hover/tap:**
- Background fill with `--kw-pink-whisper` (#FFF0F5)
- Duration: `--duration-instant`

**Dismissal (tap outside):**
- Element springs back to `scale(1.0)` and original shadow
- Menu fades out: `opacity: 0`, `scale(0.95)`, `translateY(4px)`
- Background blur dissolves
- All using `--ease-soft` over `--duration-fast`

---

## 9. PAGE / SCREEN TRANSITION

### Specification

Screen transitions use shared element animation where the triggering element IS the destination.

**Card → Detail page (primary transition):**
- The tapped card expands to fill the screen
- Image, title, and subtitle animate continuously from card positions to detail positions
- Easing: `--ease-spring`
- Duration: `--duration-slow` (500ms)
- Card border-radius morphs from 24px → 0px (or to screen corner radius)
- Background cards scale down to 0.95 and reduce opacity to 0.6 during transition

**Interactive dismissal (drag down from detail):**
- Dragging down from the detail page gradually reverses the expansion
- The page shrinks, border-radius increases, background cards scale back up
- All properties interpolate linearly with drag distance during active touch
- Release below 30% progress: springs back to full detail with `--ease-spring`
- Release above 30% progress: completes dismissal, card shrinks back to its list position with `--ease-spring`

**Simple push (fallback for non-shared-element transitions):**
- New screen enters: `opacity: 0 → 1`, `scale(0.95) → 1.0`, `translateY(12px) → 0`
- Old screen: `opacity: 1 → 0`, `scale(1.0) → 0.98`
- Easing: `--ease-spring`
- Duration: `--duration-slow`

---

## 10. LOADING / SKELETON STATES

### Specification

Loading states use shape-matched skeletons with a warm shimmer, followed by staggered content reveal.

**Skeleton screen:**
- Gray placeholder blocks match the exact layout of content that will load
- Circular for avatars, rectangular with matching border-radius for text/images
- Base color: `#F5E6EC` (pink-gray from aesthetic bible)
- Shimmer: diagonal gradient highlight sweeps left-to-right
  - Gradient: `linear-gradient(110deg, transparent 30%, rgba(255, 107, 152, 0.08) 50%, transparent 70%)`
  - Animation: `translateX(-100%) → translateX(100%)` over 1.8s, `--ease-soft`, infinite loop
- Skeleton dimensions MUST match loaded content exactly — zero layout shift on load

**Content reveal (when data arrives):**
- Each element fades in individually with staggered timing:
  - `opacity: 0 → 1`, `scale(0.97) → 1.0`, `translateY(4px) → 0`
  - Easing: `--ease-bounce`
  - Duration: `--duration-fast` (200ms) per element
  - Stagger: 60ms between elements
- Text loads first, then images (images use a brief scale(1.02 → 1.0) settle effect)

**Character loading (for longer waits):**
- Animated mascot character with `kawaiFloat` idle animation:
```css
@keyframes kawaiFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(1.5deg); }
  75% { transform: translateY(4px) rotate(-1deg); }
}
/* Duration: 3s, ease-in-out, infinite */
```

---

## 11. CELEBRATION / REWARD REVEAL

### Specification

Celebrations are the ONE place to go maximalist. Every other interaction is restrained — this is the payoff.

**Full sequence (1200ms total):**

**Phase 1 — Impact (0-200ms):**
- Main element (trophy, badge, score) scales from 0 → 1.2
- Easing: `--ease-squish`
- Screen background flashes: brief white (50ms) → pink tint (100ms) → normal
- Haptic: heavy impact

**Phase 2 — Settle (200-400ms):**
- Main element settles from 1.2 → 1.0
- Easing: `--ease-soft`

**Phase 3 — Particle burst (400-800ms):**
- 40-60 particles emit from center of main element
- Particle types: hearts (♡), stars (☆), sparkles (✦), circles — mix of shapes
- Colors: random from `--kw-pink-hot`, `--kw-yellow`, `--kw-lavender`, `--kw-mint`, `--kw-red`
- Each particle: random direction, `--ease-soft` deceleration, slight gravity (drifts downward), fades to 0 opacity over 600ms
- Particle sizes: 6-16px, random

**Phase 4 — Text cascade (600-1000ms):**
- Score/title text appears letter-by-letter (or digit-by-digit)
- Each character: `opacity: 0 → 1`, `scale(0) → 1.3 → 1.0`, `translateY(20px) → 0`
- Easing: `--ease-bounce`
- Stagger: 80ms between characters
- Text style: accent font from aesthetic bible, `--text-3xl`, `--font-extra-bold`
- Text shadow: `0 0 20px rgba(255, 214, 68, 0.5), 0 4px 0 darken(color, 20%)`

**Phase 5 — Ambient (800ms+, continuous):**
- 20-30 confetti pieces drift from top of screen
- Slow fall: 3-6 seconds to cross screen, slight horizontal wobble
- Colors from aesthetic bible palette
- Background: slow `kawaiFloat` pulse on a radial gradient glow behind main element
- Continue until user interacts (taps button, swipes, etc.)

**Dismiss/continue button:**
- Appears at 1000ms: `opacity: 0 → 1`, `scale(0) → 1.15 → 1.0`
- Easing: `--ease-bounce`
- Uses primary button style from aesthetic bible
- Pill-shaped, generous padding, positioned at bottom of screen

---

## 12. NOTIFICATION / TOAST

### Specification

Notifications enter from the top with spring physics, overshoot their resting position, and settle.

**Entry:**
- Slides down from above: `translateY(-100%) → translateY(0)`
- Overshoots resting position by 8px, then springs back
- Easing: `--ease-bounce`
- Duration: `--duration-normal` (350ms)
- Shadow: elevated value from aesthetic bible

**Resting:**
- Stays visible for 3-4 seconds (configurable)
- Subtle idle animation: very slow `translateY(0 → -2px → 0)` breathe, 3s loop

**Dismissal — swipe up:**
- Track finger 1:1 during drag
- On release with upward velocity: accelerates upward and exits
- On release without velocity: springs back to resting position
- Threshold: 30% of notification height

**Dismissal — timeout:**
- Slides up: `translateY(0) → translateY(-120%)`
- Easing: `--ease-soft`
- Duration: `--duration-normal`

**Visual style:** See aesthetic bible — card style with 24px radius, pink shadow, optional decorative element. Warm charcoal text, pink accent for action links.

---

## 13. DRAG AND DROP / REORDER

### Specification

Reorderable items lift off the list, float above siblings, and cause neighboring items to flow around them.

**Lift (on long press trigger at 400ms):**
- Item scales to 1.03 and gains elevated shadow from aesthetic bible
- Slight rotation: 1-2 degrees (adds personality)
- Easing: `--ease-bounce`
- Duration: `--duration-fast`
- Haptic: medium impact

**During drag:**
- Lifted item follows finger 1:1, stays elevated with shadow
- Other items smoothly slide apart to create a gap where the dragged item would drop
- Gap animation: `--ease-spring` over `--duration-fast`
- Gap items overshoot their new position by 2-3px, then settle

**Drop (on release):**
- Item springs into its new position
- Scale returns to 1.0, rotation returns to 0, shadow returns to resting
- Easing: `--ease-spring`
- Duration: `--duration-normal`
- Neighboring items settle with cascading spring animations: each delayed by 30ms, creating a wave-like settle effect
- Haptic: light impact on drop

---

## 14. FLOATING / IDLE ANIMATIONS

### Specification

Decorative elements and mascot characters should never be static. They use gentle ambient motion.

**Standard float (for decorative elements, mascots):**
```css
@keyframes kawaiFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(1.5deg); }
  75% { transform: translateY(4px) rotate(-1deg); }
}
/* Duration: 3-5s, ease-in-out, infinite */
```

**Sparkle twinkle (for star/sparkle decorations):**
```css
@keyframes kawaiTwinkle {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1.0; transform: scale(1.0); }
}
/* Duration: 2-3s, ease-in-out, infinite
   Stagger start times randomly so sparkles don't sync */
```

**Gentle pulse (for active/highlighted elements):**
```css
@keyframes kawaiPulse {
  0%, 100% { transform: scale(1.0); box-shadow: 0 0 0 0 rgba(255, 107, 152, 0.3); }
  50% { transform: scale(1.02); box-shadow: 0 0 0 8px rgba(255, 107, 152, 0); }
}
/* Duration: 2s, ease-in-out, infinite */
```

---

## THE 5 UNIVERSAL PRINCIPLES

Every interaction above follows the same physics DNA:

1. **Spring physics, not easing curves.** Real objects have momentum, overshoot, and gradual settling. Use `--ease-bounce` and `--ease-spring`, not `ease-in-out`.

2. **Rubber-banding at limits.** Never let an interaction hit a hard wall. Allow slight overshoot past boundaries with increasing resistance, then spring back.

3. **Velocity preservation.** When you release a gesture, finger velocity transfers to the element. Fast flick = fast response. Slow release = gentle settle.

4. **Direct manipulation (1:1 tracking).** During active touch, the element follows your finger with zero latency and no easing. Easing is for after release only.

5. **Haptic punctuation.** Visual animations tell you something moved. Haptics tell you something happened. Pair every state change with appropriate haptic weight: light for toggles, medium for confirmations, heavy for celebrations.
