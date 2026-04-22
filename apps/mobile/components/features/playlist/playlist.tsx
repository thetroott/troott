import {
    Image,
    type ImageSourcePropType,
    StyleSheet,
    View,
} from 'react-native';
import React, { useCallback, useMemo } from 'react';

import Text from '@/components/ui/text';
import SermonCard from '@/components/features/search/sermon-card';
import { theme } from '@/constants/theme';
import Button from '@/components/ui/button';
import { SolidIcons } from '@/assets/icons';
import { usePlayFromCatalogList } from '@/hooks/player/use-play-from-catalog-list';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import type { IPlayListCard } from './types';
import type { ISermonTrack, SermonItemDTO } from '@/types/sermon';

const FALLBACK_COVER = require('@/assets/images/cover.jpg');

function resolveCover(
    coverImage: IPlayListCard['coverImage'],
): ImageSourcePropType {
    if (coverImage == null) {
        return FALLBACK_COVER;
    }
    if (typeof coverImage === 'number') {
        return coverImage;
    }
    if (typeof coverImage === 'string') {
        if (coverImage.length === 0) return FALLBACK_COVER;
        return { uri: coverImage };
    }
    return coverImage as ImageSourcePropType;
}

function toCatalogRows(
    tracks: IPlayListCard['tracks'],
): (Partial<ISermonTrack> & { id: string | null })[] {
    return tracks.map((t, i) => ({
        ...t,
        id:
            t.id != null && String(t.id).length > 0
                ? String(t.id)
                : `pl-row-${i}`,
    }));
}

const PlayList = ({
    title,
    description,
    coverImage,
    cardStyle,
    tracks,
    church,
}: IPlayListCard) => {
    const playFromCatalog = usePlayFromCatalogList('Library');

    const catalogRows = useMemo(
        () => toCatalogRows(tracks),
        [tracks],
    );

    const tracklistDtos: SermonItemDTO[] = useMemo(
        () => catalogRows.map((r) => catalogRowToSermonItem(r)),
        [catalogRows],
    );

    const onPlayAll = useCallback(() => {
        if (catalogRows.length === 0) return;
        void playFromCatalog(catalogRows, 0);
    }, [catalogRows, playFromCatalog]);

    const coverSource = resolveCover(coverImage);
    const count = tracks?.length ?? 0;

    return (
        <View style={[styles.container, cardStyle]}>
            <View style={styles.topContainer}>
                <Image
                    source={coverSource}
                    style={styles.image}
                    accessibilityIgnoresInvertColors
                />
                <View style={styles.textContainer}>
                    <Text
                        size="lg"
                        weight="semiBold"
                        color={theme.colors.white[50]}
                    >
                        {title}
                    </Text>
                    <Text size="sm" color={theme.colors.white[100]}>
                        {church}
                    </Text>
                    <Text size="sm" color={theme.colors.grey[200]}>
                        {count} Messages
                    </Text>
                    <Button
                        leftIcon={
                            <SolidIcons.PlayIcon
                                color={theme.colors.grey[50]}
                                size={18}
                            />
                        }
                        label="Play All"
                        onPress={onPlayAll}
                        disabled={count === 0}
                        containerStyle={styles.button}
                        variant="ghost"
                    />
                </View>
            </View>
            <Text
                size="sm"
                color={theme.colors.grey[200]}
            >
                {description}
            </Text>
            <View style={styles.trackContainer}>
                {tracklistDtos.map((item, index) => (
                    <SermonCard
                        key={item.id ?? `pl-t-${index}`}
                        track={item}
                        index={index}
                        tracklist={tracklistDtos}
                        queue="Library"
                        variant="small"
                        cardStyle={styles.sermonCard}
                    />
                ))}
            </View>
        </View>
    );
};

export default PlayList;

const styles = StyleSheet.create({
    topContainer: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.md,
    },
    textContainer: {
        flex: 1,
        gap: theme.sizes.spacing.sm,
        minWidth: 0,
    },
    container: {
        gap: theme.sizes.spacing.lg,
        padding: theme.sizes.spacing.md,
        borderRadius: theme.sizes.radius.md,
        backgroundColor: theme.colors.grey[600],
    },
    trackContainer: {
        gap: theme.sizes.spacing.xs,
    },
    image: {
        width: 96,
        height: 96,
        borderRadius: theme.sizes.radius.base,
    },
    button: {
        flexDirection: 'row',
        borderRadius: theme.sizes.radius.full,
        gap: theme.sizes.spacing.sm,
        alignItems: 'center',
        padding: theme.sizes.spacing.sm,
        backgroundColor: '#545454',
        justifyContent: 'center',
        width: '70%',
        maxWidth: 220,
        height: undefined,
        minHeight: 40,
    },
    sermonCard: {
        width: '100%',
        borderBottomWidth: 0,
    },
});
