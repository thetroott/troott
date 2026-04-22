import { StyleSheet, View } from 'react-native';
import React from 'react';
import ScreenView from '@/components/ui/screenview';
import {
    Notification,
    ProfileCircle,
    SearchNormal,
} from 'iconsax-react-nativejs';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';
import Input from '@/components/ui/input';
import { RecentlyAdded } from '@/components/features/search';

const Search = () => {
    return (
        <ScreenView>
            {/* header section */}
            <Header />
            <Input
                leftIcon={
                    <SearchNormal size={20} color={theme.colors.white[100]} />
                }
                placeholder="Seach sermons, pastors, topics..."
            />
            <RecentlyAdded />
        </ScreenView>
    );
};

function Header() {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.textContainer}>
                <View
                    style={{
                        backgroundColor: '#7676803D',
                        padding: theme.sizes.spacing.sm,
                        borderRadius: theme.sizes.radius.full,
                    }}
                >
                    <ProfileCircle color={theme.colors.white[100]} />
                </View>
                <Text
                    size="lg"
                    color={theme.colors.white[100]}
                    weight="semiBold"
                >
                    Search
                </Text>
            </View>
            <Notification variant="Bold" />
        </View>
    );
}

export default Search;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flexDirection: 'row',
        gap: theme.sizes.spacing.sm,
        alignItems: 'center',
    },
});
