import React, { useState } from 'react';
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
import SermonCard from '@/components/features/search/sermon-card';
import {
    useSeeMoreSermons,
    type SeeMoreRailKey,
} from '@/engine/hooks/useSeeMoreSermons';

type SeeMoreSermonListScreenProps = {
    rail: SeeMoreRailKey;
};

export default function SeeMoreSermonListScreen({
    rail,
}: SeeMoreSermonListScreenProps) {
    const { items, title, isLoading, isError, refetch } =
        useSeeMoreSermons(rail);
    const [activeFilter, setActiveFilter] = useState('All');
    const filters = ['All', 'Faith', 'Bible Study', 'Daily Devotion'];

    const screenStyle = {
        backgroundColor: theme.colors.black[50],
        paddingHorizontal: 0,
    };

    const header = (
        <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
                <ArrowLeft size={24} color={theme.colors.white[100]} />
            </Pressable>
            <Text
                size="lg"
                color={theme.colors.white[100]}
                weight="semiBold"
                numberOfLines={1}
                style={styles.headerTitle}
            >
                {title}
            </Text>
            <View style={{ width: 24 }} />
        </View>
    );

    if (isLoading && items.length === 0) {
        return (
            <ScreenView screenStyle={screenStyle}>
                {header}
                <View style={styles.centerMessage}>
                    <Text color={theme.colors.white[100]}>Loading sermons...</Text>
                </View>
            </ScreenView>
        );
    }

    if (isError && items.length === 0) {
        return (
            <ScreenView screenStyle={screenStyle}>
                {header}
                <View style={styles.centerMessage}>
                    <Text color={theme.colors.grey[300]}>
                        Could not load sermons.
                    </Text>
                    <Pressable onPress={() => void refetch()}>
                        <Text color={theme.colors.teal[400]}>Retry</Text>
                    </Pressable>
                </View>
            </ScreenView>
        );
    }

    if (items.length === 0) {
        return (
            <ScreenView screenStyle={screenStyle}>
                {header}
                <View style={styles.centerMessage}>
                    <Text color={theme.colors.grey[300]}>
                        No sermons available yet.
                    </Text>
                </View>
            </ScreenView>
        );
    }

    return (
        <ScreenView screenStyle={screenStyle}>
            {header}

            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterRow}>
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
                data={items}
                keyExtractor={(item, i) => (item.id ?? `row-${i}`).toString()}
                renderItem={({ item, index }) => (
                    <SermonCard
                        track={item}
                        index={index}
                        tracklist={items}
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
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.sizes.spacing.base,
        backgroundColor: theme.colors.black[50],
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        marginHorizontal: theme.sizes.spacing.sm,
    },
    backButton: {
        padding: theme.sizes.spacing.xs,
    },
    filtersContainer: {
        paddingHorizontal: theme.sizes.spacing.base,
        backgroundColor: theme.colors.black[50],
    },
    filterRow: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.sm,
    },
    filterTab: {
        paddingHorizontal: theme.sizes.spacing.md,
        paddingVertical: theme.sizes.spacing.sm,
        borderRadius: theme.sizes.radius.sm,
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
    centerMessage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.sizes.spacing.sm,
        backgroundColor: theme.colors.black[50],
    },
    sermonCard: {
        width: '100%',
    },
});
