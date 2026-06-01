import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { theme } from '@/constants/theme';
import type { SpotlightCover } from './use-home-spotlights';

const FALLBACK = require('@/assets/images/cover.jpg');

type SpotlightCoverGridProps = {
    covers: SpotlightCover[];
    emptyLabel?: string;
};

export default function SpotlightCoverGrid({
    covers,
    emptyLabel = 'No covers yet',
}: SpotlightCoverGridProps) {
    if (covers.length === 0) {
        return (
            <View style={styles.emptyBox}>
                <Image source={FALLBACK} style={styles.singleCover} />
            </View>
        );
    }

    if (covers.length === 1) {
        const cover = covers[0];
        return (
            <Image
                source={cover.uri ? { uri: cover.uri } : FALLBACK}
                style={styles.singleCover}
            />
        );
    }

    return (
        <View style={styles.grid}>
            {covers.slice(0, 4).map((cover) => (
                <Image
                    key={cover.key}
                    source={cover.uri ? { uri: cover.uri } : FALLBACK}
                    style={styles.gridTile}
                />
            ))}
        </View>
    );
}

const tileSize = theme.sizes.screen.width * 0.44;

const styles = StyleSheet.create({
    emptyBox: {
        width: tileSize,
        height: tileSize,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: theme.colors.grey[800],
    },
    singleCover: {
        width: tileSize,
        height: tileSize,
        borderRadius: 10,
        backgroundColor: theme.colors.grey[700],
    },
    grid: {
        width: tileSize,
        height: tileSize,
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 10,
        overflow: 'hidden',
    },
    gridTile: {
        width: tileSize / 2,
        height: tileSize / 2,
        backgroundColor: theme.colors.grey[700],
    },
});
