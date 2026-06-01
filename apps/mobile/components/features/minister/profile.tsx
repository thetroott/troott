import React, { useMemo } from 'react';
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    type ImageSourcePropType,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, More, Send2 } from 'iconsax-react-nativejs';
import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import Button from '@/components/ui/button';
import { SolidIcons } from '@/assets/icons';
import TopSermons from './top-sermons';
import MinisterMadePlaylist from './minister-made-playlist';
import PlaylistsFeaturedOn from './playlists-featured-on';
import LatestRelease from './latest-release';
import AboutSection from './about-section';
import { SimilarMinisters } from '../home';
import { useMinisterByIdQuery } from '@/api/hooks/app/useMinister';
import {
    useMinisterMostLikedQuery,
    useMinisterMostPlayedQuery,
    useMinisterRecentlyPublishedQuery,
} from '@/api/hooks/app/useSermon';
import {
    formatMonthlyListeners,
    ministerDisplayName,
} from '@/lib/format-audience';

type MinisterProfileProps = {
    ministerId?: string | null;
};

const MinisterProfile = ({ ministerId }: MinisterProfileProps) => {
    const id = ministerId?.trim() ?? '';
    const {
        data: ministerRaw,
        isLoading: ministerLoading,
        isError: ministerError,
    } = useMinisterByIdQuery(id, !!id);
    const { data: topSermons = [], isLoading: topLoading } =
        useMinisterMostPlayedQuery(id, !!id);
    const { data: likedSermons = [] } = useMinisterMostLikedQuery(id, !!id);
    const { data: recentSermons = [] } = useMinisterRecentlyPublishedQuery(
        id,
        !!id,
    );

    const minister = ministerRaw as Record<string, unknown> | undefined;

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.replace('/(tabs)/home');
    };

    const displayName = useMemo(() => {
        if (!minister) {
            return 'Minister';
        }
        return ministerDisplayName({
            ministerialName:
                typeof minister.ministerialName === 'string'
                    ? minister.ministerialName
                    : null,
            firstName:
                typeof minister.firstName === 'string'
                    ? minister.firstName
                    : null,
            lastName:
                typeof minister.lastName === 'string'
                    ? minister.lastName
                    : null,
        });
    }, [minister]);

    const churchName =
        typeof minister?.ministryName === 'string'
            ? minister.ministryName
            : '';

    const audienceLabel = formatMonthlyListeners(
        typeof minister?.monthlyListeners === 'number'
            ? minister.monthlyListeners
            : null,
    );

    const latestRelease = recentSermons[0] ?? topSermons[0];

    const heroSource: ImageSourcePropType = useMemo(() => {
        const cover =
            typeof minister?.coverImage === 'string'
                ? minister.coverImage
                : typeof minister?.avatar === 'string'
                  ? minister.avatar
                  : null;
        if (cover) {
            return { uri: cover };
        }
        const raw = latestRelease?.image ?? latestRelease?.artwork;
        if (typeof raw === 'number') {
            return raw;
        }
        if (typeof raw === 'string' && raw.length > 0) {
            return { uri: raw };
        }
        return require('@/assets/images/4.jpg');
    }, [latestRelease, minister]);

    const bioText =
        typeof minister?.bio === 'string' && minister.bio.trim()
            ? minister.bio.trim()
            : undefined;

    const resolvedMinisterId =
        typeof minister?.id === 'string'
            ? minister.id
            : id;

    const isLoading =
        ministerLoading ||
        (topLoading && topSermons.length === 0 && !ministerError);

    if (!id) {
        return (
            <ScreenView screenStyle={styles.screen}>
                <View style={styles.header}>
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.white[100]} />
                    </Pressable>
                    <Text size="lg" color={theme.colors.white[100]} weight="semiBold">
                        Minister
                    </Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <Text color={theme.colors.grey[300]}>Minister not found.</Text>
                </View>
            </ScreenView>
        );
    }

    if (ministerError && !minister) {
        return (
            <ScreenView screenStyle={styles.screen}>
                <View style={styles.header}>
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.white[100]} />
                    </Pressable>
                    <Text size="lg" color={theme.colors.white[100]} weight="semiBold">
                        Minister
                    </Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <Text color={theme.colors.grey[300]}>
                        Could not load this minister profile.
                    </Text>
                </View>
            </ScreenView>
        );
    }

    if (isLoading) {
        return (
            <ScreenView screenStyle={styles.screen}>
                <View style={styles.header}>
                    <Pressable onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.white[100]} />
                    </Pressable>
                    <Text size="lg" color={theme.colors.white[100]} weight="semiBold">
                        Sermons from {displayName}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <Text color={theme.colors.white[100]}>Loading sermons...</Text>
                </View>
            </ScreenView>
        );
    }

    return (
        <ScreenView screenStyle={styles.screen}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.heroWrap}>
                    <Image source={heroSource} style={styles.heroImage} />
                    <View style={styles.heroTopBar}>
                        <Pressable onPress={handleBack} style={styles.iconButton}>
                            <ArrowLeft size={24} color={theme.colors.white[50]} />
                        </Pressable>
                        <Pressable style={styles.iconButton}>
                            <More size={22} color={theme.colors.white[50]} />
                        </Pressable>
                    </View>
                    <View pointerEvents="none" style={styles.heroOverlay} />
                    <View style={styles.identitySection}>
                        <Text
                            size="3xl"
                            weight="semiBold"
                            color={theme.colors.white[50]}
                        >
                            {displayName}
                        </Text>
                        {churchName ? (
                            <Text size="lg" color={theme.colors.white[100]}>
                                {churchName}
                            </Text>
                        ) : null}
                        {audienceLabel ? (
                            <Text size="sm" color={theme.colors.grey[200]}>
                                {audienceLabel}
                            </Text>
                        ) : null}
                        <View style={styles.actionsRow}>
                            <Button
                                variant="primary"
                                label="Follow"
                                containerStyle={styles.followButton}
                            />
                            <Pressable style={styles.secondaryAction}>
                                <Send2 size={30} color={theme.colors.white[100]} />
                            </Pressable>
                            <Pressable style={styles.playAction}>
                                <SolidIcons.PlayIcon
                                    size={24}
                                    color={theme.colors.black[100]}
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <LatestRelease
                        sermon={latestRelease}
                        imageSource={heroSource}
                    />

                    <TopSermons sermons={topSermons} title="Top Sermons" />

                    {likedSermons.length > 0 ? (
                        <TopSermons
                            sermons={likedSermons}
                            title="Most Liked"
                        />
                    ) : null}

                    <MinisterMadePlaylist />

                    <PlaylistsFeaturedOn />

                    {bioText ? (
                        <AboutSection
                            ministerName={displayName}
                            text={bioText}
                            onPressCta={() =>
                                router.push(`/minister/${resolvedMinisterId}/about`)
                            }
                        />
                    ) : null}

                    <SimilarMinisters />
                </View>
            </ScrollView>
        </ScreenView>
    );
};

export default MinisterProfile;

const styles = StyleSheet.create({
    screen: {
        backgroundColor: theme.colors.black[50],
        paddingHorizontal: 0,
    },
    scrollContent: {
        paddingBottom: theme.sizes.spacing['2xl'],
    },
    heroWrap: {
        position: 'relative',
        height: theme.sizes.screen.height * 0.55,
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    heroTopBar: {
        position: 'absolute',
        top: theme.sizes.spacing.sm,
        left: theme.sizes.spacing.base,
        right: theme.sizes.spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.40)',
    },
    identitySection: {
        position: 'absolute',
        left: theme.sizes.spacing.base,
        right: theme.sizes.spacing.base,
        bottom: theme.sizes.spacing.lg,
        gap: theme.sizes.spacing.sm,
    },
    iconButton: {
        padding: theme.sizes.spacing.xs,
    },
    actionsRow: {
        marginTop: theme.sizes.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.sizes.spacing.md,
    },
    followButton: {
        width: 95,
        minHeight: 40,
        height: 40,
        borderRadius: theme.sizes.radius.sm,
        paddingVertical: 0,
    },
    secondaryAction: {
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playAction: {
        marginLeft: 'auto',
        height: 58,
        width: 58,
        borderRadius: theme.sizes.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.teal[500],
    },
    content: {
        paddingHorizontal: theme.sizes.spacing.base,
        paddingTop: theme.sizes.spacing.md,
        gap: theme.sizes.spacing.lg,
    },
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.black[50],
    },
});
