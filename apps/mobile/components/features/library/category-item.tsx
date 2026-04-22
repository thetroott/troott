import { Pressable, StyleSheet, View } from 'react-native';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { theme } from '@/constants/theme';
import Text from '@/components/ui/text';

interface CategoryProp {
    selected?: boolean;
    onPress?: () => void;
    name?: string;
    id?: number;
}

const CategoryItem = ({ selected, onPress, name, id }: CategoryProp) => {
    return (
        <Pressable
            key={id}
            style={{
                backgroundColor: selected
                    ? theme.colors.grey[100]
                    : '#54545450',
                paddingVertical: theme.sizes.spacing.base,
                borderRadius: theme.sizes.radius.sm,
                marginRight: theme.sizes.spacing.sm,
                paddingHorizontal: theme.sizes.spacing.md,
                borderWidth: selected ? 0 : 1,
                borderColor: '#54545480',
            }}
            onPress={onPress}
        >
            <Text
                color={
                    selected ? theme.colors.black[50] : theme.colors.white[50]
                }
            >
                {name}
            </Text>
        </Pressable>
    );
};

export default CategoryItem;

const styles = StyleSheet.create({});
