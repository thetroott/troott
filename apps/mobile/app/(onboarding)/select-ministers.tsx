import { StyleSheet, View } from 'react-native';
import React from 'react';
import Text from '@/components/ui/text';
import ScreenView from '@/components/ui/screenview';
import { theme } from '@/constants/theme';
import { FavoriteMinisters } from '@/components/features/onboarding';

const SelectMinisters = () => {
    return (
        <ScreenView screenStyle={styles.screen}>
            <View style={styles.headerContainer}>
                <Text size="xl" color={theme.colors.white[100]} weight="medium">
                    Pick 5 ministers you like
                </Text>
                <Text size="sm">
                    Your experience will improve the more you listen
                </Text>
            </View>
            <FavoriteMinisters />
        </ScreenView>
    );
};

export default SelectMinisters;

const styles = StyleSheet.create({
    screen: {
        marginTop: theme.sizes.spacing['2xl'],
        flex: 1,
    },
    headerContainer: {
        gap: 10,
    },
});
