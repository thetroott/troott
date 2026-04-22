import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import MinisterProfile from '@/components/features/minister/profile';

export default function MinisterScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return <MinisterProfile ministerId={id ?? null} />;
}
