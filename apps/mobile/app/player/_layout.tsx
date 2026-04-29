import { Stack } from 'expo-router';
import React from 'react';

/**
 * Route group for `/player`. A folder `_layout` registers the stack child as `player`
 * (so the root layout can use `name="player"`), not the flat `player/index` leaf.
 */
export default function PlayerLayout() {
    return <Stack screenOptions={{ headerShown: false }} />;
}
