import React from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { BrowseTopic } from '@/constants/browse-topics';

/**
 * Figma reference frames: 4995:41277 (Healing), 4995:41266 (Faith), corner 8,
 * label L 17 / T 83, 18/27 Matter SemiBold, #fff.
 */
const TILE_WIDTH = 163.5;
const TILE_RADIUS = 8;
const LABEL_LEFT = 17;
const LABEL_TOP = 83;

export type BrowseTopicTileProps = {
    topic: BrowseTopic;
    tileWidth: number;
    onPress: () => void;
};

export default function BrowseTopicTile({
    topic,
    tileWidth,
    onPress,
}: BrowseTopicTileProps) {
    const scale = tileWidth / TILE_WIDTH;
    const tileHeight = topic.figmaHeight * scale;

    if (topic.fullTile) {
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={topic.label}
                onPress={onPress}
                style={({ pressed }) => [
                    styles.tile,
                    {
                        width: tileWidth,
                        height: tileHeight,
                        opacity: pressed ? 0.88 : 1,
                    },
                ]}
            >
                <Image
                    source={topic.fullTile.source}
                    style={{
                        width: tileWidth,
                        height: tileHeight,
                    }}
                    resizeMode="cover"
                />
            </Pressable>
        );
    }

    const iconBox = topic.iconBox;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={topic.label}
            onPress={onPress}
            style={({ pressed }) => [
                styles.tile,
                {
                    width: tileWidth,
                    height: tileHeight,
                    backgroundColor: topic.backgroundColor,
                    opacity: pressed ? 0.88 : 1,
                },
            ]}
        >
            <View
                style={{
                    position: 'absolute',
                    top: iconBox.top * scale,
                    right: iconBox.right * scale,
                }}
                pointerEvents="none"
            >
                <Image
                    source={topic.watermark}
                    style={{
                        width: iconBox.width * scale,
                        height: iconBox.height * scale,
                    }}
                    resizeMode="contain"
                />
            </View>
            <Text
                weight="semiBold"
                size="md"
                color={theme.colors.white[50]}
                textStyle={{
                    lineHeight: 27,
                    ...(Platform.OS === 'android'
                        ? { includeFontPadding: false as const }
                        : {}),
                }}
                style={[
                    styles.label,
                    { left: LABEL_LEFT * scale, top: LABEL_TOP * scale },
                ]}
                numberOfLines={2}
            >
                {topic.label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tile: {
        borderRadius: TILE_RADIUS,
        overflow: 'hidden',
    },
    label: {
        position: 'absolute',
        maxWidth: '60%',
    },
});
