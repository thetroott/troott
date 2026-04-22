import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { theme } from '@/constants/theme';

const SearchLibrary = () => {
    return <View style={styles.container}>{/* search container */}</View>;
};

export default SearchLibrary;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.black[50],
    },
});
