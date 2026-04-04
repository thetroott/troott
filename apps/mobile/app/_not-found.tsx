import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, Image } from 'react-native';

type NotFoundProps = {
    message?: string;
    onRetry?: () => void;
};

const NotFound = ({ message = 'Page not found', onRetry }: NotFoundProps) => {
    return (
        <SafeAreaView className="flex-1 bg-neutral-950">
            <View className="flex-1 justify-center items-center px-6">
                <Image
                    source={require('../assets/images/tt/troott-logo.png')}
                    className="w-[200px] h-[200px] mb-6"
                    resizeMode="contain"
                />
                <Text className="text-2xl font-bold text-neutral-100 mb-2">
                    Oops!
                </Text>
                <Text className="text-base text-neutral-400 text-center mb-6">
                    {message}
                </Text>

                {onRetry && (
                    <Pressable
                        onPress={onRetry}
                        className="bg-neutral-700 px-6 py-3 rounded-lg"
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Text className="text-neutral-100 text-base font-semibold">
                            Go Back
                        </Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
};

export default NotFound;
