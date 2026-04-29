import {
    FlatList,
    Image,
    ImageSourcePropType,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useEffect, useState } from 'react';

import { SearchNormal, TickCircle } from 'iconsax-react-nativejs';
import { theme } from '@/constants/theme';
import image1 from '@/assets/images/1.jpg';
import image2 from '@/assets/images/2.jpg';
import image3 from '@/assets/images/3.jpg';
import image4 from '@/assets/images/4.jpg';
import image5 from '@/assets/images/5.jpg';
import image6 from '@/assets/images/6.jpg';
import image7 from '@/assets/images/7.jpg';
import image8 from '@/assets/images/8.jpg';
import image9 from '@/assets/images/9.jpg';

import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { string } from 'zod';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Text from '@/components/ui/text';

// Simple UUID generator function
const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        },
    );
};

const FavoriteMinisters = () => {
    const pastors = [
        { id: generateUUID(), name: 'Apostle Joshua Selman', image: image1 },
        { id: generateUUID(), name: 'Pastor Sam Adeyemi', image: image2 },
        { id: generateUUID(), name: 'Pastor Bolaji Idowu', image: image3 },
        { id: generateUUID(), name: 'Pastor Chris Oyakhilome', image: image4 },
        { id: generateUUID(), name: 'Pastor Paul Adefarasin', image: image5 },
        { id: generateUUID(), name: 'Pastor David Ibiyeomie', image: image6 },
        { id: generateUUID(), name: 'Pastor Jerry Eze', image: image7 },
        { id: generateUUID(), name: 'Pastor Nathaniel Bassey', image: image8 },
        { id: generateUUID(), name: 'Pastor Folorunso Kumuyi', image: image9 },
        { id: generateUUID(), name: 'Pastor David Ibiyeomie', image: image6 },
        { id: generateUUID(), name: 'Pastor Jerry Eze', image: image7 },
        { id: generateUUID(), name: 'Pastor Nathaniel Bassey', image: image8 },
        { id: generateUUID(), name: 'Pastor Folorunso Kumuyi', image: image9 },
    ];

    const [selectedPastors, setSelectedPastors] = useState<string[]>([]);
    const [data, setData] = useState(pastors);
    function handleCardPress(id: string) {
        if (selectedPastors.find((i) => i === id)) {
            setSelectedPastors((prev) => prev.filter((i) => i !== id));
            return;
        }
        setSelectedPastors((prev) => [...prev, id]);
    }
    function handleSkip() {
        router.push('/select-interests');
    }
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
                    onChangeText={(e) => {
                        setData(pastors.filter((i) => i.name.includes(e)));
                    }}
                />

                <FlashList
                    data={data}
                    extraData={{ selectedPastors, data }}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <Animated.View
                            key={index}
                            entering={FadeInDown.delay(100 * index).duration(
                                200,
                            )}
                        >
                            <PastorCard
                                {...item}
                                selected={
                                    selectedPastors.find((i) => i == item.id) !=
                                    undefined
                                }
                                onPress={() => {
                                    handleCardPress(item.id);
                                }}
                            />
                        </Animated.View>
                    )}
                    numColumns={3}
                    contentContainerStyle={{
                        paddingBottom: theme.sizes.screen.height * 0.2,
                    }}
                    style={{ flex: 1 }}
                />
            </View>
            <View style={styles.bottomContainer}>
                <Button
                    label="Choose Interests"
                    disabled={selectedPastors.length < 5}
                    onPress={() => {
                        router.push('/select-interests');
                    }}
                />
                <Button label="Skip" variant="ghost" onPress={handleSkip} />
            </View>
        </KeyboardAvoidingView>
    );
};

interface PastorCardProps {
    name: string;
    image: ImageSourcePropType;
    selected?: boolean;
    onPress?: () => void;
}
const CARD_SIZE = theme.sizes.screen.width * 0.3 - 10;

function PastorCard({ name, image, selected, onPress }: PastorCardProps) {
    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            <Image style={styles.image} source={image} />
            {selected && (
                <View style={styles.tick}>
                    <TickCircle color={theme.colors.grey[100]} variant="Bold" />
                </View>
            )}
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
        width: CARD_SIZE,
        alignItems: 'center',
        marginTop: theme.sizes.spacing.lg,
    },
    image: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        objectFit: 'cover',
        borderRadius: theme.sizes.radius.sm,
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
