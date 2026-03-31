# UI Screens — Complete Visual Specifications

## Display Rules (apply to ALL screens)

- **Portrait-locked.** No landscape, no rotation.
- **No scrolling.** Every screen fits in a single viewport. Exception: Roster may use paginated swipe (not scroll).
- **No pinch-to-zoom.** All content is fixed-scale.
- **Full-screen, edge-to-edge.** SafeAreaView for notch avoidance, fill everything else.
- **Responsive scaling.** Design for iPhone SE (375×667pt) minimum through iPhone 15 Pro Max (430×932pt). Use percentage-based positioning and proportional sizing — never hardcoded pixel positions. All element sizes in this spec (e.g. "192×192px") are reference sizes for a 390pt-wide screen and should scale proportionally.
- **No tab bar / bottom nav.** Navigation is via the 2×2 action grid on the Home screen and contextual back buttons. This keeps every screen maximally immersive with zero chrome.

---

## 5. Battle Screen

### 5.1 Screen Layout

**Background**: Soft pastel gradient (top: #E8D5FF lavender → bottom: #FFD6E8 baby pink). Permanent ambient particle system: tiny stars, hearts, and sparkles at 20% opacity, drifting upward slowly. Two arena zones separated by a thin dashed centerline (playful chalk-line aesthetic, not aggressive).

**Player Cat (Bottom Half)**:
- Position: 50% horizontal center, 65% down screen.
- Size: 192×192px (75% of full 256px).
- Always faces RIGHT toward opponent.
- Idle animation: gentle breathing — scale 100% → 103% → 100% on a 2-second ease-in-out loop.
- Drop shadow beneath feet: soft elliptical #00000022, 8px blur.
- Name label: rounded pill below cat, pastel pink background, white Nunito Bold 14px.
- Health bar: directly above cat, 120px wide × 10px tall, rounded ends. Animates green (#98FF98) → yellow (#FFD700) → red (#FF6B6B) as HP depletes. CSS width transition, 400ms ease-out.
- Rarity badge: small gem icon top-left of cat card. Common = gray, Rare = blue, Epic = purple, Legendary = gold.

**Opponent Cat (Top Half)**:
- Position: 50% horizontal center, 30% down screen.
- Size: 160×160px (slightly smaller — deliberate perspective trick making player feel slightly more powerful).
- Always faces LEFT toward player.
- Same idle animation, health bar, name label, rarity badge as player cat.

**Stat Readout**: Thin vertical strip on right edge. Three small icons stacked: ⚡ Power (#FF6B6B red-pink), 🛡️ Toughness (#87CEEB sky blue), 💨 Speed (#98FF98 mint green). Each shows stat number in white overlay. Both cats' values visible.

**Round Counter**: Center top, above opponent. Small rounded badge: "ROUND 1" in Quicksand Bold 12px, white text on #9B59B6 purple pill. Updates each round with scale-pop (100% → 120% → 100%, 200ms).

### 5.2 Attack Animation Sequence

**Wind-up** (0.2 sec): Attacking cat shifts back 8px (recoil), rotates -5 degrees, small dust puff particles at feet.

**Lunge** (0.15 sec): Cat slams 40px toward opponent with ease-out (very fast). Scale increases to 108%. Rotation snaps to +5 degrees (leaning forward). Motion blur trail: 3 ghost copies at 60%, 30%, 10% opacity, offset 12/24/36px behind.

**Impact** (0.1 sec): Defending cat shakes ±4px horizontal, 3 times in 150ms. Screen flash: white overlay 30% opacity, fades in 100ms. Impact particle burst at opponent position: 8 stars and hearts, pastel colors, explode outward in 360 degrees, travel 20–40px, fade over 400ms. Haptic: single sharp pulse 80ms intensity 0.7.

**Damage Number Float** (0.5 sec): Large number at impact point (e.g., "−7"). Nunito ExtraBold 28px, white text with #FF6B6B shadow. Floats up 30px, fades over 500ms. If evaded: "MISS!" in #FFD700 yellow. If critical hit (damage > 8): "CRITICAL!" text above number in #FF69B4 pink with extra star burst.

**Return** (0.2 sec): Attacker returns to original position, scale back to 100%, rotation to 0 degrees. Idle animation resumes. Defender health bar animates down (CSS transition, 400ms ease-out). Color zone transitions (green→yellow, yellow→red) trigger small crack particle and floating heart icon off the health bar.

**Opponent Attacks**: Mirror image of above. Haptic slightly softer (intensity 0.5) — subconsciously signals the opponent's hit matters less.

### 5.3 Victory Animation

1. Opponent faint (0.5 sec): Rotates 90 degrees clockwise, scale shrinks to 60%, slides slightly down, opacity fades to 0%. Three "zzz" bubbles float up (pastel purple "z" letters). Health bar collapses to gray.

2. Victory burst (1.0 sec): 40 confetti pieces fire from both sides — rounded rectangles (8×4px), assorted pastels (#FFB6D9, #ADD8E6, #BDFCC9, #FFD700), rotate while falling, gravity-simulated at varied rates (1.5–3 sec). Player cat performs happy dance: bounces up 20px, ears wiggle ±10 degrees, tail wags via skewX ±5 degrees. Subtle radial gradient burst (white, expands outward 0%→20%→0% opacity, 500ms). Haptic: double burst (100ms, 50ms gap, 150ms, intensity 0.9). Sound: ascending chime sequence C4→E4→G4→C5 over 400ms.

3. Result card slides up (0.5 sec): Bottom sheet from below screen, ease-out cubic bezier. Card shows "YOU WIN!" in Nunito ExtraBold 32px #FF69B4 pink. Player cat image (96×96px) + arrow icon + captured opponent cat image (96×96px). "+10 XP" and "+5 🐾" in small green text. "TAP ANYWHERE TO CONTINUE" pulsing in 12px gray.

### 5.4 Defeat Animation

1. Player cat faint (0.5 sec): Same faint animation as opponent defeat above.

2. Defeat fade (0.5 sec): Screen dims — dark overlay at 40% opacity, 300ms. No confetti. Deliberate contrast with victory. Haptic: single long low pulse (200ms, intensity 0.4). Sound: descending minor tone G4→E4→C4, 600ms, harmonic minor.

3. Result card slides up: "YOU LOST..." in Nunito ExtraBold 32px #9B59B6 muted purple. Player cat with small tear emoji overlay. "Your cat was taken!" in 14px gray. "BREED A NEW CAT →" button in pastel blue. "TAP ANYWHERE TO CONTINUE" in 12px gray.

---

## 6. Breeding Screen

### 6.1 Screen Layout

**Background**: Warm gradient (top: #FFF0F5 lavender blush → bottom: #FFE4E1 misty rose). Ambient particle system: slow-drifting hearts (♥) and tiny flowers (✿) at 15% opacity, very slow upward drift. Always running as mood-setter.

**Cat Selection Area**: Two large "Cat Slots" centered horizontally, side by side. Each slot: 140×140px rounded rectangle with dashed pastel border (#FFB6D9, 2px dashes). Empty state: faint "+" icon (40px, #FFB6D9), label "Choose Cat" in 12px gray. Filled state: selected cat image fills the slot, name label below, rarity gem in top-right corner. Between the slots: a small heart icon (♥) in #FF69B4, 24px, static until breed initiated.

**Breed Button**: 160px wide × 48px tall, rounded, gradient #FF69B4 → #FF8FAB. White text "BREED ✨" in Nunito Bold 16px. Currency cost "Cost: 50 🐾" shown below in 12px gray. If either cat is in cooldown: slot shows a ⏰ clock icon overlay with "Ready in Xm" text. Breed button disabled (gray, unclickable).

### 6.2 Breeding Animation Sequence (4 seconds total)

**Phase 1 — Cats Approach** (0.8 sec): Both cat images slide toward center from their slots (ease-in-out cubic bezier). Hearts generate between the cats as they close, increasing in frequency. Haptic: gentle rhythmic pulse (50ms every 300ms × 3, intensity 0.3).

**Phase 2 — Heart Burst** (0.6 sec): When cats "meet" at center — both scale to 110% with cartoon squish (scaleX 90%, scaleY 110%, return). Large heart burst: 12 hearts (#FF69B4, #FFB6D9, #FF8FAB) explode outward, travel 40–80px, fade. Screen briefly tints pink (20% opacity overlay, in 100ms, out 200ms). Haptic: double pulse (100ms, 50ms gap, 100ms, intensity 0.6). Sound: soft C major piano chord.

**Phase 3 — Magic Swirl** (1.5 sec): Both parent cats shrink and orbit the center point clockwise (circular CSS animation, 40px radius). Each leaves a color trail (blur + opacity fade). At center: a glowing orb appears and pulses (radial gradient white core → #FF69B4 edge, 60px diameter, scale 80%→120%→80% on 600ms loop). Sparkle particles spawn continuously from the orb (8-pointed stars, pastel rainbow cycling). Haptic: continuous light vibration (30ms every 150ms, intensity 0.4). Sound: ascending harmonic sparkle (layered high-pitched notes building in density, music box feel).

**Phase 4 — Reveal** (1.1 sec): Parent cats fade out (300ms). Orb expands dramatically (scale 1 → 3, 400ms ease-out). Screen flash: white at 80% opacity, in 150ms. Flash clears to reveal the new cat at 200×200px, centered. Cat scales in 0% → 110% → 100% (overshoot spring animation, cubic-bezier(0.34, 1.56, 0.64, 1)). Confetti burst. If FIRST TIME this pair has bred: gold shimmer ripple outward (#FFD700, expands to full screen, fades) + "✨ NEW CAT DISCOVERED!" banner slides in from top (pastel gold background, Nunito ExtraBold 18px white text). Haptic: strong celebratory burst (150ms, intensity 0.95). Sound: full ascending scale C4→D→E→F→G→A→B→C5 then C major chord, 1.5 sec total.

**Result Card**: New cat at top (200×200px). Cat name in Nunito ExtraBold 24px #FF69B4. Rarity badge in rarity-appropriate color. Three stat pills in a row: ⚡ Power (red-pink pill), 🛡️ Toughness (sky blue pill), 💨 Speed (mint green pill). Parent lineage: "Child of [Parent1 Name] × [Parent2 Name]" in 10px gray italic. Two buttons: "ADD TO ROSTER" (primary, pastel pink, full width) and "SHARE" (ghost button, "Share your new cat!").

---

## 7. Home Screen

**Top Bar**: Left: player avatar (32×32px circle, default kawaii face icon). Center: "DOKI" wordmark (custom rounded font, gradient #FF69B4 → #FF8FAB, 24px). Right: currency display (coin icon + number, Nunito Bold 14px, #FFD700).

**Active Cat Display**: Current active cat at 180×180px, centered horizontally at 40% down screen. Idle bob animation (translateY 0 → -6px → 0, 2 sec ease-in-out loop). Accessories render on top (see Accessory System). Cat name in Nunito Bold 16px below. Tap the cat: small bounce reaction (scale 100%→90%→110%→100%, 300ms spring) + one heart particle floats up.

**Four Action Buttons** (2×2 grid, bottom 40% of screen): Each 156×80px with rounded corners (16px radius) and soft drop shadow. All buttons scale to 94% on tap (spring back to 100%, 200ms) with light haptic (40ms pulse).
- BATTLE (top-left): Gradient #FF6B6B → #FF8FAB. ⚔️ icon + "BATTLE" label.
- BREED (top-right): Gradient #FF69B4 → #FFB6D9. 💕 icon + "BREED" label.
- LOOT BOX (bottom-left): Gradient #FFD700 → #FFA500. 🎁 icon + "LOOT BOX" label.
- ROSTER (bottom-right): Gradient #87CEEB → #ADD8E6. 📋 icon + "ROSTER" label.

---

## 8. Loot Box System

### 8.1 Pull Algorithm

```javascript
async function executePull(userId, pullType) {
  const cost = pullType === 'single' ? 100 : 900
  const pullCount = pullType === 'single' ? 1 : 10
  const results = []

  return await db.transaction(async trx => {
    await deductCurrency(userId, cost, trx)

    for (let i = 0; i < pullCount; i++) {
      const user = await User.findById(userId, trx)
      let rarity = checkPity(user)
      if (!rarity) rarity = weightedRarityRoll()
      updatePityCounters(user, rarity, trx)
      const cat = await generateLootBoxCat(userId, rarity, trx)
      results.push(cat)
    }

    return results
  })
}

function weightedRarityRoll() {
  const roll = Math.random() * 100
  if (roll < 3)  return 'legendary'   // 3%
  if (roll < 15) return 'epic'        // 12%
  if (roll < 40) return 'rare'        // 25%
  return 'common'                      // 60%
}

function checkPity(user) {
  if (user.pity_counter_legendary >= 99) return 'legendary'
  if (user.pity_counter_epic >= 49)      return 'epic'
  return null
}
```

### 8.2 Catalog-Based Generation

Loot box cats draw from a pre-generated master catalog rather than generating at pull time. This eliminates pull latency (AI generation takes 3–8 seconds; loot box should feel instant).

```javascript
async function generateLootBoxCat(userId, rarity, trx) {
  const variety    = VARIETIES[randomInt(0, VARIETIES.length - 1)]
  const catalogCat = await CatalogCat.findRandom({ rarity, variety }, trx)
  const stats      = generateStatsForRarity(rarity)

  return await Cat.create({
    owner_id: userId,
    name: catalogCat.name,
    base_image_url: catalogCat.image_url,
    variety_tokens: catalogCat.variety_tokens,
    rarity, variety,
    ...stats,
    generation: 0,
    acquired_via: 'loot_box'
  }, trx)
}
```

Catalog targets: 200 Common, 150 Rare, 100 Epic, 50 Legendary (500 total). Generated offline in bulk via the content pipeline before launch.

### 8.3 Loot Box Screen Layout

**Background**: Deep soft purple gradient (top: #2D1B69 → bottom: #4A1942). 100 twinkling stars (tiny white dots, opacity pulses 20%→80%→20% at random intervals 1–4 seconds, staggered). Two large radial gradient nebula blobs (#FF69B4 and #87CEEB, 30% opacity, 400px diameter) drifting very slowly (60 seconds to traverse screen).

**Loot Box Object**: 180×180px kawaii gift box — pastel pink body with white polka dots, gold ribbon and bow. Gentle bob (translateY 0→-8px→0, 2.5 sec loop). Bow rotates ±3 degrees in sync. Six sparkle particles orbit slowly (full rotation every 4 seconds, 40px radius). "OPEN BOX" button: 200×56px, gradient #FFD700→#FFA500, Nunito ExtraBold 18px white, 28px border radius. Subtle pulsing glow on button (box-shadow expands/contracts every 1.5 sec). "10× PULL — 900 🐾 (SAVE 10%)" secondary button below.

### 8.4 Pull Animations by Rarity

**Common Pull** (1.5 sec): Box shakes ±5px 3 times (300ms) → lid pops open (rotateX 0→-80 degrees, 200ms) → cat pops out (scale 0→1, translateY up 60px, 400ms spring) → soft pastel sparkle burst (8 particles, 30px outward, 500ms fade) → result card fades in. Haptic: single pulse 60ms intensity 0.5. Sound: soft pop + piano C4 (200ms).

**Rare Pull** (2.0 sec): Box shakes ±8px 5 times → blue glow (box-shadow #87CEEBaa, 300ms) → lid flips dramatically (rotateX 0→-100 degrees) → cat emerges with upward float (scale 0→1.1→1, 80px up, 500ms overshoot spring) → blue sparkle burst (12 particles, 50px, 600ms) → musical note floats up (♪ #87CEEB). Haptic: double pulse (80ms, 40ms gap, 80ms, intensity 0.65). Sound: ascending two-note chime C4→G4.

**Epic Pull** (2.8 sec): Box shakes violently ±12px horizontal + ±6px vertical, irregular (700ms) → screen dims to 85% → purple lightning crackles around box (CSS pseudo-elements, #9B59B6, 4 bolts flashing for 500ms) → box shatters (4 pieces fly to screen corners, each rotates and fades, 300ms) → cat materializes dramatically (scale 0→1.2→1.0, 600ms spring, with motion blur) → purple/gold particle explosion (24 particles, stars and diamonds, #9B59B6 and #FFD700, 80px outward, 800ms) → screen flash purple 40% opacity → "EPIC!" text bursts from center (Nunito ExtraBold 48px #9B59B6, scale 0→2→0, 600ms). Haptic: triple burst (120ms, 40ms, 120ms, 40ms, 80ms, intensity 0.85). Sound: full C major scale in 400ms + chord.

**Legendary Pull** (4.0 sec): Box builds to intense gold aura (800ms) → screen dims to 60% → box levitates 30px, rotating ±5 degrees → gold lightning strikes from all four corners (400ms) → screen whiteout flash (100% opacity, 300ms) → cat revealed LARGE (240px), centered, surrounded by gold aura (radial gradient 200px radius, #FFD70044) → rainbow particle cascade (40 particles, full spectrum pastel rainbow, 100px travel, 1 sec) → two expanding star burst rings (CSS circles, scale 0→300%, #FFD700, staggered 200ms) → "LEGENDARY!!!" text thunders in from top (Nunito ExtraBold 40px gold gradient, scale 1.5→1.0, then pulses glow) → cat continues gentle bounce loop until dismissed. Haptic: full rumble sequence (200ms heavy, 50ms, 150ms heavy, 50ms, 200ms heavy, intensity 1.0). Sound: 4-second orchestral fanfare, C major key, cinematic trumpet/strings blend.
