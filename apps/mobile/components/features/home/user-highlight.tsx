import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

import { theme } from '@/constants/theme';
import Text from '@/components/ui/text';
import Loader from '@/components/ui/loader';
import { SolidIcons } from '@/assets/icons';
import SpotlightCoverGrid from './spotlight-cover-grid';
import { useHomeHighlights } from './use-home-spotlights';

const UserHighlights = () => {
    const { covers, isLoading, playHighlights, hasContent, count } =
        useHomeHighlights();

    const subtitle =
        count > 0
            ? `${count} new ${count === 1 ? 'release' : 'releases'}`
            : 'View recent updates';

    if (isLoading && !hasContent) {
        return (
            <View style={styles.wrap}>
                <View style={styles.loaderBox}>
                    <Loader tone="brand" />
                </View>
                <Text color={theme.colors.white[50]} weight="medium" size="base">
                    Troott Highlights
                </Text>
            </View>
        );
    }

    return (
        <Pressable
            style={styles.wrap}
            onPress={() => router.push('/see-more/sermons-for-you')}
            accessibilityRole="button"
            accessibilityLabel="Open Troott highlights"
        >
            <View style={styles.container}>
                <SpotlightCoverGrid covers={covers} />
                {hasContent ? (
                    <Pressable
                        style={styles.playBtn}
                        onPress={(e) => {
                            e.stopPropagation?.();
                            playHighlights();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Play highlights"
                    >
                        <SolidIcons.PlayIcon
                            color={theme.colors.black[50]}
                            size={28}
                            style={{ transform: [{ translateX: 1 }] }}
                        />
                    </Pressable>
                ) : null}
            </View>
            <View style={styles.meta}>
                <Text color={theme.colors.white[50]} weight="medium" size="base">
                    Troott Highlights
                </Text>
                <Text size="sm" color={theme.colors.grey[300]}>
                    {subtitle}
                </Text>
            </View>
        </Pressable>
    );
};

export default UserHighlights;

const tileSize = theme.sizes.screen.width * 0.44;

const styles = StyleSheet.create({
    wrap: {
        gap: 10,
        width: tileSize,
    },
    container: {
        width: tileSize,
        height: tileSize,
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.grey[800],
    },
    loaderBox: {
        width: tileSize,
        height: tileSize,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playBtn: {
        position: 'absolute',
        padding: theme.sizes.spacing.md,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: theme.colors.teal[500],
    },
    meta: {
        gap: 5,
    },
});
