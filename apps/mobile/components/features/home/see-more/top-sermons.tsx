import React, { useMemo, useState } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    FlatList,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'iconsax-react-nativejs';
import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import { tracks } from '@/_data/_mock/tracks';
import { useSermonsCatalog } from '@/engine/hooks/useSermonsCatalog';
import SermonCard from '@/components/features/search/sermon-card';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import type { SermonItemDTO } from '@/types/sermon';

type CatalogRow = Parameters<typeof catalogRowToSermonItem>[0] & {
    artist?: string | null;
};

const TopSermons = () => {
    const { data: sermons, isLoading } = useSermonsCatalog();
    const [activeFilter, setActiveFilter] = useState('All');
    const filters = ['All', 'Faith', 'Bible Study', 'Daily Devotion'];

    const sermonsData =
        sermons && sermons.length > 0
            ? sermons
            : (tracks as CatalogRow[]);

    const tracklistDtos: SermonItemDTO[] = useMemo(
        () =>
            sermonsData.map((r, i) =>
                catalogRowToSermonItem({
                    ...r,
                    id: r.id != null ? String(r.id) : `s4u-${i}`,
                }),
            ),
        [sermonsData],
    );

    if (isLoading && (!sermonsData || sermonsData.length === 0)) {
        return (
            <ScreenView
                screenStyle={{ backgroundColor: theme.colors.black[50] }}
            >
                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color={theme.colors.white[100]} />
                    </Pressable>
                    <Text
                        size="lg"
                        color={theme.colors.white[100]}
                        weight="semiBold"
                    >
                        Sermons for you
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.loadingContainer}>
                    <Text color={theme.colors.white[100]}>
                        Loading sermons...
                    </Text>
                </View>
            </ScreenView>
        );
    }

    return (
        <ScreenView screenStyle={{ backgroundColor: theme.colors.black[50] }}>
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={theme.colors.white[100]} />
                </Pressable>
                <Text
                    size="lg"
                    color={theme.colors.white[100]}
                    weight="semiBold"
                >
                    Sermons for you
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: theme.sizes.spacing.sm,
                        }}
                    >
                        {filters.map((filter) => (
                            <Pressable
                                key={filter}
                                style={[
                                    styles.filterTab,
                                    activeFilter === filter &&
                                        styles.activeFilterTab,
                                ]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <Text
                                    size="sm"
                                    color={
                                        activeFilter === filter
                                            ? theme.colors.black[100]
                                            : theme.colors.white[100]
                                    }
                                    weight={
                                        activeFilter === filter
                                            ? 'semiBold'
                                            : 'medium'
                                    }
                                >
                                    {filter}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
            </View>

            <FlatList
                data={tracklistDtos}
                keyExtractor={(item, i) => (item.id ?? `row-${i}`).toString()}
                renderItem={({ item, index }) => (
                    <SermonCard
                        track={item}
                        index={index}
                        tracklist={tracklistDtos}
                        queue="Library"
                        variant="small"
                        cardStyle={styles.sermonCard}
                    />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                style={{ backgroundColor: theme.colors.black[50] }}
            />
        </ScreenView>
    );
};

export default TopSermons;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 0,
        paddingHorizontal: theme.sizes.spacing.base,
        backgroundColor: theme.colors.black[50],
    },
    backButton: {
        padding: theme.sizes.spacing.xs,
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.sizes.spacing.base,
        marginBottom: theme.sizes.spacing.md,
        gap: theme.sizes.spacing.sm,
        backgroundColor: theme.colors.black[50],
    },
    filterTab: {
        paddingHorizontal: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.sm,
        borderRadius: theme.sizes.radius.full,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.grey[600],
    },
    activeFilterTab: {
        backgroundColor: theme.colors.teal[500],
        borderColor: theme.colors.teal[500],
    },
    listContainer: {
        paddingHorizontal: theme.sizes.spacing.base,
        paddingBottom: theme.sizes.spacing.xl,
        backgroundColor: theme.colors.black[50],
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.black[50],
    },
    sermonCard: {
        width: '100%',
    },
});
