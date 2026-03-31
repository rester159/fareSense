# 9. Accessory System

## 9.1 Design Principles

Accessories layer on top of base cat art without altering the cat's core design. All accessories must visually fit all cats. They are purely cosmetic — no effect on battle or breeding stats.

**All accessories must**: use the same kawaii chibi style as cats (not realistic, not photorealistic), use the same pastel color palette, have transparent backgrounds (PNG alpha), be sized to fit any cat's proportions (scaled dynamically), and NOT obscure the cat's face, tail, or core silhouette.

## 9.2 Five Accessory Slots

1. **Head Slot**: Hats, headbands, hair clips, crowns, bows. Sits on top of head without covering eyes.
2. **Body Slot**: Shirts, vests, dresses, jackets. Overlays on chest/torso.
3. **Waist Slot**: Belts, aprons, tail wraps. Hangs around neck area or tail base.
4. **Back Slot**: Wings, backpacks, capes. Positioned at shoulder blades, doesn't cover tail.
5. **Paw Slot**: Shoes, socks, bracelets, gloves. Scaled per cat size.

## 9.3 Rendering Architecture

**Z-Index Layering Order** (back to front):

1. Base cat image (z-index: 0)
2. Back slot accessory (z-index: 1) — wings, backpacks go behind cat torso
3. Body slot accessory (z-index: 2) — shirts overlay cat body
4. Waist slot accessory (z-index: 3) — belts wrap around hips
5. Paw slot accessory (z-index: 4) — shoes on feet
6. Head slot accessory (z-index: 5) — hats always on top

**Accessory Metadata Schema**:

```json
{
  "accessory_id": "strawberry_hat_001",
  "slot": "head",
  "attachment_point": {
    "x_offset_percent": 50,
    "y_offset_percent": 10,
    "scale_factor": 0.9
  },
  "z_index": 5,
  "rotation_degrees": -5
}
```

**CSS Implementation**:

```css
.cat-container {
  position: relative;
  width: 256px;
  height: 256px;
}

.cat-base {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.accessory {
  position: absolute;
  pointer-events: none;
  transform: translate(var(--offset-x), var(--offset-y))
             scale(var(--scale))
             rotate(var(--rotation));
}

.accessory.slot-head  { z-index: 5; }
.accessory.slot-back  { z-index: 1; }
.accessory.slot-body  { z-index: 2; }
.accessory.slot-waist { z-index: 3; }
.accessory.slot-paw   { z-index: 4; }
```

**Dynamic Scaling by Rarity**: Common = 100%, Rare = 105%, Epic = 110%, Legendary = 115%. Prevents accessories from looking disproportionate on larger, rarer cats.

## 9.4 Accessory AI Generation (Future Pipeline)

```
"A [color] pastel kawaii [accessory_type] suitable for a cute chibi cat.
Style: Hello Kitty aesthetic, hand-drawn, chibi.
Color: [color_name] pastel, avoid pure black and neon.
Symmetry: [symmetrical/asymmetrical].
Size: Should fit a cat [head/body/waist/back/paws] without obscuring the cat.
Background: Transparent PNG. No text, no complex details, simple and adorable.
256x256px, isolated item."
```
