import React from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import type { SermonItemDTO } from '@/api/dtos/sermon.dto';

type LatestReleaseProps = {
    sermon?: SermonItemDTO;
    imageSource: ImageSourcePropType;
};

function formatDuration(duration: number | null | undefined): string {
    if (duration == null || !Number.isFinite(duration) || duration < 0) {
        return '--:--';
    }
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60)
        .toString()
        .padStart(2, '0');
    return `${minutes}:${seconds}`;
}

export default function LatestRelease({
    sermon,
    imageSource,
}: LatestReleaseProps) {
    return (
        <View style={styles.card}>
            <View style={styles.text}>
                <Text
                    size="sm"
                    weight="semiBold"
                    color={theme.colors.grey[300]}
                >
                    LATEST RELEASE
                </Text>
                <Text size="lg" weight="medium" color={theme.colors.white[50]}>
                    {sermon?.title ?? 'Jesus Saves'}
                </Text>
                <Text size="sm" color={theme.colors.grey[200]}>
                    Sermon • {formatDuration(sermon?.duration)}
                </Text>
            </View>
            <Image source={imageSource} style={styles.image} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.grey[700],
        borderRadius: theme.sizes.radius.base,
        padding: theme.sizes.spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.base,
    },
    text: {
        flex: 1,
        gap: theme.sizes.spacing.xs,
    },
    image: {
        width: 74,
        height: 74,
        borderRadius: theme.sizes.radius.sm,
    },
});
