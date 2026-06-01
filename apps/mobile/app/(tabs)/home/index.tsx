import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import React from 'react';
import ScreenView from '@/components/ui/screenview';
import { theme } from '@/constants/theme';
import UserHighlights from '@/components/features/home/user-highlight';
import LikedByUser from '@/components/features/home/liked-by-user';
import {
    MoreFromMinister,
    SimilarMinisters,
    TrendingPlaylist,
} from '@/components/features/home';
import UserWelcome from '@/components/features/home/UserWelcome';
import SermonsForYou from '@/components/features/home/sermons-for-you';
import ContinueListeningSection from '@/components/features/home/continue-listening-section';
import { useProfileIdentity } from '@/components/features/profile/use-profile-identity';
import { useHomeScreen } from '@/engine/hooks/useHomeScreen';

const Home = () => {
    const { firstName } = useProfileIdentity();
    const { isRefreshing, refresh } = useHomeScreen();

    return (
        <ScreenView>
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={refresh}
                        tintColor={theme.colors.teal[500]}
                        colors={[theme.colors.teal[500]]}
                    />
                }
            >
                <UserWelcome firstName={firstName} />
                <ContinueListeningSection />
                <View style={{ gap: theme.sizes.spacing.xl }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <UserHighlights />
                        <LikedByUser />
                    </View>
                </View>
                <View style={{ marginTop: theme.sizes.spacing.xl }}></View>
                <SermonsForYou />
                <View style={{ marginTop: theme.sizes.spacing.xl }}></View>
                <MoreFromMinister />
                <View style={{ marginTop: theme.sizes.spacing.xl }}></View>
                <TrendingPlaylist />
                <View style={{ marginTop: theme.sizes.spacing.xl }}></View>
                <SimilarMinisters />
            </ScrollView>
        </ScreenView>
    );
};

export default Home;

const styles = StyleSheet.create({
    headerIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scrollContainer: {
        flex: 1,
        paddingTop: theme.sizes.spacing.sm,
    },
    scrollContent: {
        paddingBottom: 100,
        gap: theme.sizes.spacing.xl,
    },
    seeMore: {
        borderRadius: theme.sizes.radius.full,
        width: 'auto',
        paddingHorizontal: theme.sizes.spacing.base,
        height: 'auto',
        paddingVertical: theme.sizes.spacing.sm,
        borderColor: theme.colors.grey[400],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
