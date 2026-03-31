import { View, Image, StyleSheet } from 'react-native';

const SLOT_Z_INDEX: Record<string, number> = {
  back: 1,
  body: 2,
  waist: 3,
  paw: 4,
  head: 5,
};

const RARITY_SCALE: Record<string, number> = {
  common: 1.0,
  rare: 1.05,
  epic: 1.1,
  legendary: 1.15,
};

type AccessorySlot = {
  slot: string;
  accessories: {
    image_url: string;
    attachment_x_percent?: number;
    attachment_y_percent?: number;
    scale_factor?: number;
    z_index?: number;
    rotation_degrees?: number;
  } | null;
};

type Props = {
  baseImageUrl: string;
  rarity?: string;
  accessorySlots?: AccessorySlot[];
  size?: number;
};

export default function CatWithAccessories({
  baseImageUrl,
  rarity = 'common',
  accessorySlots = [],
  size = 256,
}: Props) {
  const scale = RARITY_SCALE[rarity] ?? 1;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri: baseImageUrl }}
        style={[styles.base, { width: size, height: size }]}
        resizeMode="contain"
      />
      {accessorySlots
        .filter((s) => s.accessories)
        .sort((a, b) => (SLOT_Z_INDEX[a.slot] ?? 0) - (SLOT_Z_INDEX[b.slot] ?? 0))
        .map(({ slot, accessories }) => {
          if (!accessories) return null;
          const ax = (accessories.attachment_x_percent ?? 50) / 100;
          const ay = (accessories.attachment_y_percent ?? 10) / 100;
          const s = (accessories.scale_factor ?? 1) * scale;
          const rot = accessories.rotation_degrees ?? 0;
          const z = accessories.z_index ?? SLOT_Z_INDEX[slot] ?? 0;
          return (
            <Image
              key={slot}
              source={{ uri: accessories.image_url }}
              style={[
                styles.accessory,
                {
                  width: size,
                  height: size,
                  left: size * (ax - 0.5),
                  top: size * (ay - 0.1),
                  transform: [{ scale: s }, { rotate: `${rot}deg` }],
                  zIndex: z,
                },
              ]}
              resizeMode="contain"
            />
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  base: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
  },
  accessory: {
    position: 'absolute',
    pointerEvents: 'none',
  },
});
