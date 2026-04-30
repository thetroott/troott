import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { BrowseTopic } from '@/constants/browse-topics';

/**
 * Figma `HEALING` reference card (4995:41277): 163.5 x 119.5, r 8,
 * label inset L 17 / bottom ~10, illustration Group 12 at top 12.5, size 80 x 87.5 (right).
 */
const TILE_HEIGHT = 119.5;
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
    const tileHeight = TILE_HEIGHT * scale;
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
                textStyle={styles.labelText}
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
    labelText: {
        lineHeight: 27,
    },
});
