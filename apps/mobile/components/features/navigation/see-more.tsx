import { StyleSheet } from 'react-native';
import React from 'react';
import Button from '@/components/ui/button';
import Text from '@/components/ui/text';
import { theme } from '@/constants/theme';

const SeeMore = ({ onPress }: { onPress?: () => void }) => {
    return (
        <Button
            variant="outline"
            containerStyle={styles.seeMore}
            onPress={onPress}
        >
            <Text size="xs" color={theme.colors.white[50]}>
                See more
            </Text>
        </Button>
    );
};

export default SeeMore;

const styles = StyleSheet.create({
    seeMore: {
        borderRadius: theme.sizes.radius.full,
        width: 'auto',
        paddingHorizontal: theme.sizes.spacing.base,
        height: 'auto',
        paddingVertical: theme.sizes.spacing.xs,
        borderColor: theme.colors.grey[400],
    },
});
