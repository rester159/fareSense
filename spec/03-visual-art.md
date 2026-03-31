# 4. Visual System & Art Direction

## 4.1 Art Style Bible (Non-Negotiable)

**Inspiration**: Hello Kitty (Sanrio), Tamagotchi, Pusheen, Gudetama, Studio Ghibli (Totoro-level simplicity).

**Medium**: Digital illustration, hand-drawn aesthetic. NOT photorealistic, NOT 3D render, NOT anime-detailed.

**Proportions**: Chibi — head = 50% of body height, tiny limbs, oversized eyes.

**Eyes (Critical)**: Oval-shaped, 30–40% of face width. Black iris, white circular highlight dot at top-right of each iris. Eyelashes optional, preferred on Rare+. Never realistic pupils.

**Face**: Minimal features. Small dot nose, simple curved smile or neutral line. No complex expressions.

**Color Palette (Pastel Only)**:
- Pinks: #FFB6D9 → #FF69B4 (baby pink to hot pink)
- Blues: #ADD8E6 → #87CEEB (light blue to sky blue)
- Yellows: #FFFFE0 → #FFD700 (light yellow to gold)
- Greens: #BDFCC9 → #98FF98 (mint to light green)
- Purples: #E6D7FF → #DA70D6 (lavender to orchid)
- Grays: #F0F0F0 → #D3D3D3 (off-white to light gray)
- NO pure black (#000000), NO dark navy, NO neon saturation

**Linework**: Thin, consistent 1–2px strokes. No thick outlines. No sketchy texture.

**Body Shape**: Rounded, soft. No sharp angles. All curves are gentle arcs.

**Tail**: Present on every cat. Curved and fluffy or sleek. No spiky tails.

**Background**: Always transparent (PNG alpha channel).

**Canvas**: 256×256px base export, scalable via CSS.

## 4.2 Stat-to-Visual Mapping

Every cat's silhouette should communicate its stat profile at a glance.

**Power** drives body build: Power 1–3 = small, delicate, wispy with thin limbs and pale pastels; Power 4–6 = medium proportional, neutral saturation; Power 7–10 = robust, wider shoulders, richer pastel saturation.

**Toughness** drives body shape: Toughness 1–3 = very round and soft, larger ears, bigger eyes, emphasizes vulnerability and cuddliness; Toughness 4–6 = normally proportioned; Toughness 7–10 = wider and rounder body, slightly smaller head-to-body ratio, suggests durability.

**Speed** drives pose: Speed 1–3 = relaxed sitting or reclining, tail curled, half-closed sleepy eyes; Speed 4–6 = upright neutral stance, alert eyes; Speed 7–10 = dynamic forward lean, one paw raised, tail in motion, wide alert eyes.

**Example Archetypes**:

Glass Cannon (Power 9, Toughness 2, Speed 9): Tall, thin, pale pink cat with a forward-leaning dynamic pose, huge wide eyes, small dainty paws. Suggests speed and fragility simultaneously.

Tank (Power 2, Toughness 10, Speed 1): Round, wide, peachy-colored cat in a sitting posture with a calm expression and larger body volume. Suggests immovability.

Balanced (Power 5, Toughness 5, Speed 5): Medium build, neutral pastel colors, neutral upright stance. Visually middle-ground.

## 4.3 Rarity-to-Visual Mapping

**Common**: Simple design. 1–2 colors (base + accent). Single ear style, single tail style. No patterns. Standard black iris with white highlight. No sparkles, no gradients, no glow. Example: Simple pink cat with white belly, basic round eyes, no marks.

**Rare**: More complex. 2–3 colors. Subtle symmetrical patterns allowed (spots, stripes, patches). Ears may have a distinctive shape (floppy, pointed elf ears). Optional heterochromia (one blue eye, one pink). Optional small sparkle on the eye highlight. Example: Gradient pastel blue-to-pink cat with white spots, slightly bigger ears, one eye sparkle.

**Epic**: Complex, distinctive. 3–4 coordinated colors (complementary scheme). Unique ear/tail combo (curly tail + pointed ears, feathered ears + extra fluffy tail). Ombre effects or symmetrical pattern motifs allowed. Eyes with longer lashes, secondary iris color, prominent highlight. Optional very subtle outer glow (soft 1px drop shadow in matching pastel). Example: Three-color lavender/pink/white cat with elf ears, curly tail, gradient eye, and a barely perceptible outer glow.

**Legendary**: Striking, memorable. 4–5 carefully coordinated colors. Complex symmetrical patterns (mandala-like, gradient blends). Unique silhouette (very large ears, extra fluffy, unusually shaped body). Eyes are distinctive — multiple iris colors or asymmetric detail. Subtle aura (soft radial gradient, 3px, matching color scheme). Tail uniquely colored or patterned (two-tone, feathered, striped). Example: Five-color mythical cat (pale pink body, lavender ears, gold accents, white belly, soft blue spine stripe) with asymmetrical eyes, feathered tail, and soft aura glow.

## 4.4 AI Prompt Engineering System

### The Three-Layer Architecture

Style consistency is enforced via a layered, constrained prompt system. Layer 1 anchors every generation to the same style. Layer 2 provides a controlled combinatorial vocabulary for variety. Layer 3 derives semantic modifiers from the cat's actual stats.

**Layer 1 — Style Lock (Immutable, Prepended to Every Generation)**:

```
"Chibi kawaii cat illustration. Style: Hello Kitty by Sanrio, 
Tamagotchi, Pusheen. Medium: flat 2D digital art, hand-drawn 
aesthetic. NOT photorealistic, NOT 3D render, NOT anime-detailed. 
Proportions: oversized round head (50% of body height), tiny limbs, 
large oval eyes (35% of face width). Eyes: solid black iris, 
single white circular highlight dot at top-right of each iris. 
Face: minimal features, small dot nose, simple curved smile or 
neutral expression. Linework: thin consistent lines (1-2px), 
no thick outlines, no sketchy texture. Color philosophy: 
pastel only, soft saturation, NO pure black (#000000), 
NO neon, NO dark navy. Background: fully transparent. 
Canvas: 256x256px, cat centered, full body visible, 
no cropping. Single cat only, isolated, no background elements."
```

This text never changes. Every generation begins with this exact block.

**Layer 2 — Variety Token Vocabulary**:

Each cat's prompt includes one token from each category, selected via the variety inheritance algorithm:

Fur Base Color (12 options): `"cotton candy pink" | "sky blue" | "lemon yellow" | "mint cream" | "soft lavender" | "peach cream" | "cloud white" | "warm beige" | "pale lilac" | "soft coral" | "powder blue" | "champagne"`

Fur Accent Color (10 options, must differ from base): `"white patches" | "cream belly" | "pink inner ears" | "gold tips" | "blue stripes" | "lavender spots" | "mint gradient" | "silver shimmer" | "rose cheeks" | "lilac tail tip"`

Ear Style (6 options): `"rounded cat ears" | "pointed elf ears" | "large floppy ears" | "small neat ears" | "wide spread ears" | "folded ears"`

Tail Style (6 options): `"long curled tail" | "short fluffy tail" | "ringed striped tail" | "poofy round tail" | "thin elegant tail" | "double-tip tail"`

Eye Color (8 options): `"deep blue eyes" | "warm amber eyes" | "forest green eyes" | "soft violet eyes" | "heterochromia: one blue one pink" | "rose pink eyes" | "gold eyes" | "teal eyes"`

Special Mark (8 options, rarity-gated): `"no special marks" (Common only) | "small star birthmark on cheek" | "crescent moon marking on forehead" | "tiny heart on paw" | "diamond pattern on chest" | "swirl marking on tail" | "dot constellation pattern on back" (Epic+) | "faint galaxy shimmer on fur" (Legendary only)`

**Variety Math**: 12 × 10 × 6 × 6 × 8 × 8 = 276,480 unique visual token combinations. Approximately 276,000 visually distinct cats before any repetition — far exceeding any realistic breeding volume.

**Layer 3 — Stat-Semantic Modifiers**:

```javascript
function getStatModifiers(power, toughness, speed) {
  const mods = []

  if (power <= 3)      mods.push("delicate small-framed build")
  else if (power <= 6) mods.push("medium proportional build")
  else                 mods.push("sturdy strong-shouldered build")

  if (toughness <= 3)      mods.push("slender wispy body shape")
  else if (toughness <= 6) mods.push("normal rounded body shape")
  else                     mods.push("wide round plump body shape")

  if (speed <= 3)      mods.push("relaxed sitting pose, half-closed sleepy eyes")
  else if (speed <= 6) mods.push("sitting upright alert pose, open eyes")
  else                 mods.push("dynamic standing pose, one paw raised, wide alert eyes")

  return mods.join(", ")
}
```

**Rarity Enhancement Block** (appended based on rarity):

```javascript
const rarityBlocks = {
  common:
    "Simple clean design. 1-2 colors only. No patterns. No special effects.",

  rare:
    "Slightly more detailed design. 2-3 colors. Optional subtle pattern " +
    "(spots or stripes, symmetrical). One eye may have a small sparkle highlight.",

  epic:
    "Detailed distinctive design. 3-4 coordinated pastel colors. Symmetrical " +
    "pattern or ombre effect allowed. Eyes have longer lashes. Very subtle soft " +
    "outer glow (1px, pastel color matching fur).",

  legendary:
    "Striking memorable design. 4-5 carefully coordinated pastel colors. " +
    "Complex symmetrical pattern. Unique silhouette. Eyes are distinctive " +
    "(multiple iris colors or asymmetric detail). Subtle aura glow " +
    "(soft radial gradient, 3px, matching color scheme). " +
    "Tail has unique coloring or pattern."
}
```

**Full Assembled Example Prompt** (Epic cat, Power 7, Toughness 4, Speed 8, first breeding of this pair):

```
"Chibi kawaii cat illustration. Style: Hello Kitty by Sanrio, 
Tamagotchi, Pusheen. Medium: flat 2D digital art, hand-drawn 
aesthetic. NOT photorealistic, NOT 3D render, NOT anime-detailed. 
Proportions: oversized round head (50% of body height), tiny limbs, 
large oval eyes (35% of face width). Eyes: solid black iris, 
single white circular highlight dot at top-right of each iris. 
Face: minimal features, small dot nose, simple curved smile. 
Linework: thin consistent lines, no thick outlines. 
Color philosophy: pastel only, soft saturation, NO pure black, NO neon. 
Background: fully transparent. Canvas: 256x256px, cat centered, full body visible.

Fur: soft lavender base, rose cheeks accent.
Ears: pointed elf ears.
Tail: double-tip tail.
Eyes: violet eyes.
Mark: crescent moon marking on forehead.

sturdy strong-shouldered build, normal rounded body shape,
dynamic standing pose with one paw raised, wide alert eyes.

Detailed distinctive design. 3-4 coordinated pastel colors. 
Symmetrical pattern or ombre effect allowed. Eyes have longer lashes. 
Very subtle soft outer glow (1px, pastel matching fur)."
```

### Variety Token Inheritance (Bred Cats)

```javascript
function selectVarietyTokens(parent1Tokens, parent2Tokens) {
  const traits = ['furBase', 'furAccent', 'earStyle', 'tailStyle', 'eyeColor', 'specialMark']

  return traits.reduce((offspring, trait) => {
    const roll = Math.random()
    if (roll < 0.40)      offspring[trait] = parent1Tokens[trait]          // 40% parent 1
    else if (roll < 0.80) offspring[trait] = parent2Tokens[trait]          // 40% parent 2
    else                  offspring[trait] = randomFromVocabulary(trait)   // 20% mutation
    return offspring
  }, {})
}
```

Most bred cats look visually related to their parents (recognizable lineage). ~20% of traits mutate each generation. Deep breeding chains create family lines players can trace. Mutations maintain surprise and prevent homogeneity.

### Style Consistency Validator

Run after every bulk generation batch and optionally after individual AI generations:

```javascript
async function validateArtStyle(newImageUrl, referenceImageUrls) {
  const response = await claude.messages.create({
    model: "claude-sonnet-4-6",
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: `You are a kawaii art style validator. Compare the new cat image 
                 to the reference images. Rate consistency 1-10 on:
                 1. Chibi proportions (head 50% of body)
                 2. Pastel color palette (no neon, no pure black)
                 3. Thin consistent linework
                 4. Transparent background
                 5. Hello Kitty aesthetic (simple face, oval eyes)
                 Return JSON: {
                   overallScore: number,
                   scores: { proportions, palette, linework, background, aesthetic },
                   issues: string[],
                   approved: boolean  // true if overallScore >= 7
                 }`
        },
        { type: "image", source: { type: "url", url: newImageUrl } },
        ...referenceImageUrls.slice(0, 3).map(url => ({
          type: "image", source: { type: "url", url }
        }))
      ]
    }]
  })
  return JSON.parse(response.content[0].text)
}
```

Images scoring below 7 are flagged for manual review and not served to players.
