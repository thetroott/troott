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
import { tracks } from '@/_data/_mock/tracks';
import { useSermonsCatalog } from '@/engine/hooks/useSermonsCatalog';
import { catalogRowToSermonItem } from '@/engine/utils/catalog-map';
import type { ISermonTrack, SermonItemDTO } from '@/types/sermon';
import Button from '@/components/ui/button';
import { SolidIcons } from '@/assets/icons';
import TopSermons from './top-sermons';
import MinisterMadePlaylist from './minister-made-playlist';
import PlaylistsFeaturedOn from './playlists-featured-on';
import LatestRelease from './latest-release';
import AboutSection from './about-section';
import { SimilarMinisters } from '../home';

type MinisterProfileProps = {
    ministerId?: string | null;
};

type MinisterMeta = {
    id: string;
    name: string;
    church: string;
    audienceLabel: string;
    image: ImageSourcePropType;
    aliases: string[];
};

const MINISTERS: Record<string, MinisterMeta> = {
    'sam-adeyemi': {
        id: 'sam-adeyemi',
        name: 'Pastor Sam Adeyemi',
        church: 'Daystar Christian Centre',
        audienceLabel: '600K monthly audience • 10.5k Followers',
        image: require('@/assets/images/4.jpg'),
        aliases: ['sam adeyemi', 'pastor sam adeyemi'],
    },
    'bolaji-idowu': {
        id: 'bolaji-idowu',
        name: 'Pastor Bolaji Idowu',
        church: 'Harvesters International',
        audienceLabel: '220K monthly audience • 6.2k Followers',
        image: require('@/assets/images/2.jpg'),
        aliases: ['bolaji idowu', 'pastor bolaji idowu'],
    },
    'chris-oyakhilome': {
        id: 'chris-oyakhilome',
        name: 'Pastor Chris Oyakhilome',
        church: 'LoveWorld Incorporated',
        audienceLabel: '1.2M monthly audience • 35k Followers',
        image: require('@/assets/images/5.jpg'),
        aliases: ['chris oyakhilome', 'pastor chris oyakhilome'],
    },
};

const DEFAULT_MINISTER = MINISTERS['sam-adeyemi'];

const MinisterProfile = ({ ministerId }: MinisterProfileProps) => {
    const { data: sermons, isLoading } = useSermonsCatalog();
    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.replace('/(tabs)/home');
    };

    const minister = ministerId ? MINISTERS[ministerId] ?? DEFAULT_MINISTER : DEFAULT_MINISTER;

    const catalogRows =
        sermons && sermons.length > 0
            ? sermons
            : (tracks as Partial<ISermonTrack>[]);

    const sermonsData = useMemo(() => {
        const filtered = catalogRows.filter((row) => {
            const label = String(row.minister ?? row.artist ?? '').toLowerCase();
            return minister.aliases.some((a) => label.includes(a));
        });
        return filtered.length > 0 ? filtered : catalogRows;
    }, [catalogRows, minister.aliases]);

    const tracklistDtos: SermonItemDTO[] = useMemo(
        () =>
            sermonsData.map((r, i) =>
                catalogRowToSermonItem({
                    ...r,
                    id: r.id != null ? String(r.id) : `s4u-${i}`,
                } as Partial<ISermonTrack> & { id: string | null }),
            ),
        [sermonsData],
    );

    const heroTrack = tracklistDtos[0];
    const latestRelease = tracklistDtos[1] ?? tracklistDtos[0];
    const topSermons = tracklistDtos.slice(0, 6);

    const heroSource: ImageSourcePropType = useMemo(() => {
        const raw = heroTrack?.image ?? heroTrack?.artwork;
        if (typeof raw === 'number') return raw;
        if (typeof raw === 'string' && raw.length > 0) return { uri: raw };
        return minister.image;
    }, [heroTrack, minister.image]);

    if (isLoading && (!sermonsData || sermonsData.length === 0)) {
        return (
            <ScreenView
                screenStyle={{
                    backgroundColor: theme.colors.black[50],
                    paddingHorizontal: 0,
                }}
            >
                <View style={styles.header}>
                    <Pressable
                        onPress={handleBack}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color={theme.colors.white[100]} />
                    </Pressable>
                    <Text
                        size="lg"
                        color={theme.colors.white[100]}
                        weight="semiBold"
                    >
                        Sermons from {minister.name}
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
        <ScreenView
            screenStyle={{
                backgroundColor: theme.colors.black[50],
                paddingHorizontal: 0,
            }}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.heroWrap}>
                    <Image source={heroSource} style={styles.heroImage} />
                    <View style={styles.heroTopBar}>
                        <Pressable
                            onPress={handleBack}
                            style={styles.iconButton}
                        >
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
                            {minister.name}
                        </Text>
                        <Text size="lg" color={theme.colors.white[100]}>
                            {minister.church}
                        </Text>
                        <Text size="sm" color={theme.colors.grey[200]}>
                            {minister.audienceLabel}
                        </Text>
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

                    <TopSermons
                        sermons={topSermons}
                    />



                    <MinisterMadePlaylist/>

                   <PlaylistsFeaturedOn/>

                    <AboutSection
                        text="Apostle Joshua Selman is a Nigerian preacher, teacher, and founder of Eternity Network International (ENI), known for the Koinonia ministry. Born on June 25, 1980, he gained prominence for his deep teachings on intimacy with God.."
                        ctaLabel="See more"
                        onPressCta={() =>
                            router.push(`/minister/${minister.id}/about`)
                        }
                    />

                   <SimilarMinisters/>

                </View>
            </ScrollView>
        </ScreenView>
    );
};

export default MinisterProfile;

const styles = StyleSheet.create({
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
        color: theme.colors.white[50],
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
