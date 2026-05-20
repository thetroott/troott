import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import { Add, SearchNormal } from 'iconsax-react-nativejs';
import { theme } from '@/constants/theme';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { SolidIcons } from '@/assets/icons';
import { router } from 'expo-router';
import { replaceWithPendingTargetOrHome } from '@/lib/deep-link/replace-with-pending-or-home';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Text from '@/components/ui/text';
import { toast } from '@/components/ui/toast';
import {
    useOnboardTopicsMutation,
    useOnboardingTopicsQuery,
    useSkipOnboardingMutation,
} from '@/api/hooks/app/useListenerOnboarding';

const MIN_TOPICS = 5;

function flattenTopics(data: unknown): { id: string; name: string }[] {
    if (!Array.isArray(data)) {
        return [];
    }
    const out: { id: string; name: string }[] = [];
    for (const row of data) {
        if (!row || typeof row !== 'object') continue;
        const r = row as Record<string, unknown>;
        const id = String(r._id ?? r.id ?? '');
        const name = String(r.name ?? r.title ?? '');
        if (id) {
            out.push({ id, name });
        }
    }
    return out;
}

const Interests = () => {
    const { data, isLoading } = useOnboardingTopicsQuery();
    const onboardTopics = useOnboardTopicsMutation();
    const skipOnboarding = useSkipOnboardingMutation();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filter, setFilter] = useState('');

    const topics = useMemo(() => flattenTopics(data), [data]);
    const filtered = useMemo(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return topics;
        return topics.filter((t) => t.name.toLowerCase().includes(q));
    }, [topics, filter]);

    const toggle = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const handleContinue = async () => {
        if (selectedIds.length < MIN_TOPICS) {
            toast.error(`Select at least ${MIN_TOPICS} topics`);
            return;
        }
        try {
            await onboardTopics.mutateAsync({ topicIds: selectedIds });
            router.push('/(onboarding)/select-ministers');
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : 'Could not save topics',
            );
        }
    };

    const handleSkip = async () => {
        try {
            await skipOnboarding.mutateAsync();
            await replaceWithPendingTargetOrHome();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : 'Could not skip onboarding',
            );
        }
    };

    return (
        <View style={styles.container}>
            <Input
                leftIcon={
                    <SearchNormal size={20} color={theme.colors.grey[100]} />
                }
                placeholder="Search for more interests"
                value={filter}
                onChangeText={setFilter}
            />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContainer}
            >
                {isLoading ? (
                    <Text>Loading topics...</Text>
                ) : (
                    filtered.map((item) => (
                        <InterestItem
                            key={item.id}
                            name={item.name}
                            id={item.id}
                            selected={selectedIds.includes(item.id)}
                            onPress={() => toggle(item.id)}
                        />
                    ))
                )}
            </ScrollView>
            <View style={styles.bottomContainer}>
                <Button
                    containerStyle={styles.buttonStyle}
                    disabled={
                        selectedIds.length < MIN_TOPICS ||
                        onboardTopics.isPending
                    }
                    isLoading={onboardTopics.isPending}
                    onPress={() => void handleContinue()}
                >
                    <SolidIcons.PlayIcon />
                    <Text color={theme.colors.grey[900]}>Continue</Text>
                </Button>
                <Button
                    label="Skip"
                    variant="ghost"
                    isLoading={skipOnboarding.isPending}
                    onPress={() => void handleSkip()}
                />
            </View>
        </View>
    );
};

interface ItemProp {
    name: string;
    selected: boolean;
    id: string;
    onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedAddIcon = Animated.createAnimatedComponent(Add);

function InterestItem({ name, selected, onPress }: ItemProp) {
    const selectProgress = useSharedValue(0);
    const rotateProgress = useSharedValue('0deg');
    const animatedStyles = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            selectProgress.value,
            [0, 1],
            [theme.colors.grey[900], theme.colors.teal[500]],
        ),
    }));
    const animatedIconStyles = useAnimatedStyle(() => ({
        transform: [{ rotate: rotateProgress.value }],
    }));

    React.useEffect(() => {
        selectProgress.value = withTiming(selected ? 1 : 0);
        rotateProgress.value = withTiming(selected ? '45deg' : '0deg');
    }, [selected, selectProgress, rotateProgress]);

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[styles.interestItem, animatedStyles]}
        >
            <Text size="sm">{name}</Text>
            <AnimatedAddIcon
                size={16}
                color={theme.colors.white[100]}
                style={animatedIconStyles}
            />
        </AnimatedPressable>
    );
}

export default Interests;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: theme.sizes.spacing.md,
    },
    scrollContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        paddingVertical: theme.sizes.spacing.md,
    },
    bottomContainer: {
        gap: theme.sizes.spacing.sm,
        paddingBottom: theme.sizes.spacing.lg,
    },
    buttonStyle: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    interestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: theme.sizes.radius.full,
    },
});
