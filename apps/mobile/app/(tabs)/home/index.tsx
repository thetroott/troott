import { ScrollView, StyleSheet, View } from 'react-native';
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

const Home = () => {
    return (
        <ScreenView>
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 100,
                }}
            >
                <UserWelcome firstName="Damola" />
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
