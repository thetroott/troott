import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import liked from '@/assets/images/liked.png';
import { Image } from 'react-native';
import { router } from 'expo-router';
import { Heart } from 'iconsax-react-nativejs';

import { theme } from '@/constants/theme';
import Text from '@/components/ui/text';
import Loader from '@/components/ui/loader';
import SpotlightCoverGrid from './spotlight-cover-grid';
import { useHomeLikedByYou } from './use-home-spotlights';

const LikedByUser = () => {
    const { covers, count, isLoading, hasContent } = useHomeLikedByYou();

    const subtitle =
        count > 0
            ? `${count} saved to your library`
            : 'Save sermons you love';

    if (isLoading && !hasContent) {
        return (
            <View style={styles.wrap}>
                <View style={styles.loaderBox}>
                    <Loader tone="brand" />
                </View>
                <Text color={theme.colors.white[50]} weight="medium" size="base">
                    Liked by you
                </Text>
            </View>
        );
    }

    return (
        <Pressable
            style={styles.wrap}
            onPress={() => router.push('/(tabs)/library')}
            accessibilityRole="button"
            accessibilityLabel="Open liked sermons in library"
        >
            <View style={styles.container}>
                {hasContent ? (
                    <SpotlightCoverGrid covers={covers} />
                ) : (
                    <Image source={liked} style={styles.fallbackImage} />
                )}
                {count > 0 ? (
                    <View style={styles.badge}>
                        <Heart
                            size={12}
                            color={theme.colors.white[50]}
                            variant="Bold"
                        />
                        <Text size="xs" color={theme.colors.white[50]}>
                            {count}
                        </Text>
                    </View>
                ) : null}
            </View>
            <View style={styles.meta}>
                <Text color={theme.colors.white[50]} weight="medium" size="base">
                    Liked by you
                </Text>
                <Text size="sm" color={theme.colors.grey[300]}>
                    {subtitle}
                </Text>
            </View>
        </Pressable>
    );
};

export default LikedByUser;

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
    },
    loaderBox: {
        width: tileSize,
        height: tileSize,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.grey[800],
        borderRadius: 10,
    },
    fallbackImage: {
        width: tileSize,
        height: tileSize,
        borderRadius: 10,
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    meta: {
        gap: 5,
    },
});
