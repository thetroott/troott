import { Image, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import React from "react";
import Text from "@/components/ui/text";
import { SolidIcons } from "@/assets/icons";
import { theme } from "@/constants/theme";
import { Icon } from "iconsax-react-nativejs";

interface PlayListCardItemProps {
  image?: string;
  title?: string;
  description?: string;
  onPress?: () => void;
  id: string;
  icon?: Icon;
  variant?: "large" | "small";
  cardStyle?: ViewStyle;
}

const PlayListCard = ({
  image,
  title,
  description,
  onPress,
  icon,
  variant = "small",
  cardStyle,
}: PlayListCardItemProps) => {
  const IconComponent = icon;
  if (variant === "large") {
    return (
      <View style={cardStyle} className="gap-4">
        {image && (
          <Image
            source={{ uri: image || "https://picsum.photos/200/300" }}
            style={styles.imageLarge}
          />
        )}
        {IconComponent && (
          <View
            style={[
              styles.imageLarge,
              {
                alignItems: "center",
                justifyContent: "center",
                padding: theme.sizes.spacing.xs,
                backgroundColor: "#02332C",
              },
            ]}
          >
            <IconComponent color="#08FFDB" size={48} />
          </View>
        )}
        <View className="gap-2">
          <Text size="base" className="text-neutral-100" weight="medium">
            {title}
          </Text>
          <Text size="xs" className="text-neutral-400">{description}</Text>
        </View>
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      style={cardStyle}
      className="mb-2 flex-row items-center justify-between border-b border-neutral-600 pb-4"
    >
      <View className="flex-row items-start gap-4">
        {image && (
          <Image
            source={{ uri: image || "https://picsum.photos/200/300" }}
            style={styles.image}
          />
        )}
        {icon && (
          <View className="rounded bg-teal-950 p-1">
            {IconComponent && (
              <IconComponent color="#08FFDB" size={18} />
            )}
          </View>
        )}
        <View className="gap-2">
          <Text size="base" className="text-neutral-100" weight="medium">
            {title}
          </Text>
          <Text size="xs" className="text-neutral-400">{description}</Text>
        </View>
      </View>
      <Pressable>
        <SolidIcons.ChevronRightIcon color="#BDBDBD" size={16} />
      </Pressable>
    </Pressable>
  );
};

export default PlayListCard;

// Allowed exception: runtime dimensions for image (screen width/height).
const styles = StyleSheet.create({
  image: {
    width: theme.sizes.screen.width * 0.1,
    height: theme.sizes.screen.width * 0.1,
    borderRadius: theme.sizes.radius.sm,
  },
  imageLarge: {
    width: "100%",
    height: theme.sizes.screen.height * 0.2,
    borderRadius: theme.sizes.radius.base,
  },
});
