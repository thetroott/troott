import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ScreenView from '@/components/ui/screenview';
import Text from '@/components/ui/text';
import { View } from 'react-native';

export default function SeriesScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <ScreenView>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text>Series {id ?? '—'}</Text>
            </View>
        </ScreenView>
    );
}
