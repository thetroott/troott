import {
    Image,
    KeyboardAvoidingView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import { SearchNormal, TickCircle } from 'iconsax-react-nativejs';
import { theme } from '@/constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Text from '@/components/ui/text';
import { toast } from '@/components/ui/toast';
import { replaceWithPendingTargetOrHome } from '@/lib/deep-link/replace-with-pending-or-home';
import {
    useOnboardMinistersMutation,
    useOnboardingMinistersQuery,
    useSkipOnboardingMutation,
} from '@/api/hooks/app/useListenerOnboarding';
import { ministerDocToRow } from '@/engine/utils/library-map';

type MinisterRow = {
    id: string;
    name: string;
    image?: string;
};

function mapMinisters(data: unknown): MinisterRow[] {
    if (!Array.isArray(data)) {
        return [];
    }
    const out: MinisterRow[] = [];
    for (const doc of data) {
        const row = ministerDocToRow(doc);
        if (row?.id) {
            out.push({
                id: row.id,
                name: row.name,
                image: row.image,
            });
        }
    }
    return out;
}

const FavoriteMinisters = () => {
    const { data, isLoading } = useOnboardingMinistersQuery();
    const onboardMinisters = useOnboardMinistersMutation();
    const skipOnboarding = useSkipOnboardingMutation();
    const ministers = useMemo(() => mapMinisters(data), [data]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filter, setFilter] = useState('');

    const filtered = useMemo(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return ministers;
        return ministers.filter((m) => m.name.toLowerCase().includes(q));
    }, [ministers, filter]);

    const toggle = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const handleFinish = async () => {
        try {
            await onboardMinisters.mutateAsync({
                ministerIds: selectedIds,
            });
            await replaceWithPendingTargetOrHome();
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : 'Could not save ministers',
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
        <KeyboardAvoidingView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Input
                    leftIcon={
                        <SearchNormal
                            size={20}
                            color={theme.colors.grey[100]}
                        />
                    }
                    placeholder="Search ministers"
                    value={filter}
                    onChangeText={setFilter}
                />
                <FlashList
                    data={filtered}
                    extraData={selectedIds}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <Animated.View
                            entering={FadeInDown.delay(100 * index).duration(
                                200,
                            )}
                        >
                            <PastorCard
                                name={item.name}
                                imageUri={item.image}
                                selected={selectedIds.includes(item.id)}
                                onPress={() => toggle(item.id)}
                            />
                        </Animated.View>
                    )}
                    numColumns={3}
                    ListEmptyComponent={
                        isLoading ? (
                            <Text>Loading ministers...</Text>
                        ) : (
                            <Text>No ministers found</Text>
                        )
                    }
                    contentContainerStyle={{
                        paddingBottom: theme.sizes.screen.height * 0.2,
                    }}
                    style={{ flex: 1 }}
                />
            </View>
            <View style={styles.bottomContainer}>
                <Button
                    label="Finish"
                    isLoading={onboardMinisters.isPending}
                    onPress={() => void handleFinish()}
                />
                <Button
                    label="Skip"
                    variant="ghost"
                    isLoading={skipOnboarding.isPending}
                    onPress={() => void handleSkip()}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

function PastorCard({
    name,
    imageUri,
    selected,
    onPress,
}: {
    name: string;
    imageUri?: string;
    selected?: boolean;
    onPress?: () => void;
}) {
    const CARD_SIZE = theme.sizes.screen.width * 0.3 - 10;
    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            {imageUri ? (
                <Image style={styles.image} source={{ uri: imageUri }} />
            ) : (
                <View style={[styles.image, styles.imagePlaceholder]} />
            )}
            {selected ? (
                <View style={styles.tick}>
                    <TickCircle color={theme.colors.grey[100]} variant="Bold" />
                </View>
            ) : null}
            <Text
                style={{ textAlign: 'center', color: theme.colors.grey[100] }}
            >
                {name}
            </Text>
        </TouchableOpacity>
    );
}

export default FavoriteMinisters;

const styles = StyleSheet.create({
    container: {
        gap: 20,
        flex: 1,
    },
    cardContainer: {
        gap: 10,
        alignSelf: 'flex-start',
        width: theme.sizes.screen.width * 0.3 - 10,
        alignItems: 'center',
        marginTop: theme.sizes.spacing.lg,
    },
    image: {
        width: theme.sizes.screen.width * 0.3 - 10,
        height: theme.sizes.screen.width * 0.3 - 10,
        borderRadius: theme.sizes.radius.sm,
    },
    imagePlaceholder: {
        backgroundColor: theme.colors.grey[800],
    },
    tick: {
        position: 'absolute',
        right: 4,
        top: 4,
    },
    bottomContainer: {
        position: 'absolute',
        gap: 20,
        bottom: 0,
        padding: theme.sizes.spacing.lg,
        backgroundColor: theme.colors.black[50],
        left: 0,
        right: 0,
        opacity: 0.9,
        justifyContent: 'flex-end',
    },
});
