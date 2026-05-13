import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import AboutSection from '@/components/features/minister/about-section';
import {
    MoreFromMinister,
    NewSermon,
    SimilarMinisters,
} from '@/components/features/home';
import Text from '@/components/ui/text';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import {
    resolveMinisterAbout,
    resolveMinisterIdFromLabel,
} from '@/_data/ministers-about';
import type { ISermonTrack, SermonTrackDTO } from '@/api/dtos/sermon.dto';

type SermonDetailsProps = {
    track: SermonTrackDTO | null;
    catalog: ISermonTrack[] | undefined;
    getTrackImageSource: (
        track: SermonTrackDTO | { image?: unknown; artwork?: unknown } | null,
    ) => ImageSourcePropType;
};

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${mins}:${secs}`;
};

export function SermonDetails({
    track,
    catalog,
    getTrackImageSource,
}: SermonDetailsProps) {
    if (!track) return null;

    const title = track.title ?? track.item?.title ?? 'Unknown Title';
    const minister = track.artist ?? 'Unknown minister';
    const ministerId = resolveMinisterIdFromLabel(minister);
    const aboutText = resolveMinisterAbout(minister, catalog);

    return (
        <View style={styles.sermonDetails}>
            <Text size="md" color={colors.white[100]} weight="medium">
                Sermon Details
            </Text>

            <View style={styles.sermonContent}>
                <Image
                    source={getTrackImageSource(track)}
                    style={styles.sermonImage}
                    resizeMode="cover"
                />

                <View style={styles.sermonText}>
                    <Text weight="medium" color={colors.white[100]} size="base">
                        {title}
                    </Text>
                    <Text>{minister}</Text>
                    <Text size="xs">
                        {(track.item as { totalPlays?: number } | undefined)
                            ?.totalPlays ?? '2340'}{' '}
                        plays •{' '}
                        {formatTime(
                            typeof track.duration === 'number' ? track.duration : 0,
                        )}
                    </Text>
                </View>
            </View>
            <AboutSection
                ministerName={minister}
                text={aboutText}
                ctaLabel="See more"
                onPressCta={() => router.push(`/minister/${ministerId}/about`)}
            />

            <View style={styles.spacerMedium} />

            <NewSermon />

            <View style={styles.spacerSmall} />

            <MoreFromMinister />

            <SimilarMinisters title="Similar Ministers" ctaLabel="See more" />
        </View>
    );
}

const styles = StyleSheet.create({
    sermonDetails: { gap: theme.sizes.spacing.md, marginTop: 30 },
    sermonContent: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.md,
        alignItems: 'center',
    },
    sermonImage: { height: 80, width: 80, borderRadius: theme.sizes.radius.sm },
    sermonText: { gap: theme.sizes.spacing.xs },
    spacerMedium: { marginTop: theme.sizes.spacing.md },
    spacerSmall: { marginTop: theme.sizes.spacing.sm },
});
