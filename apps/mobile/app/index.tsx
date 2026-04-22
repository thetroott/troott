import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import Button from '@/components/ui/button';
import { theme } from '@/constants/theme';
import customStyles from '@/assets/styles/custom';
import { IMAGES } from '@/assets/images/images';
import CustomImage from '@/components/features/shared/Images/Images';

const IndexScreen = () => {
    // Navigation object is now a mock since it's not being used from a prop
    const navigation = {
        navigate: (param: string | object | undefined) => {},
    };

    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleCreateAccount = () => {
        setIsCreatingAccount(true);
        setTimeout(() => {
            router.push('/enter-email');
            setIsCreatingAccount(false);
        }, 2000);
    };

    const handleLogin = () => {
        setIsLoggingIn(true);
        setTimeout(() => {
            router.push('/home');
            setIsLoggingIn(false);
        }, 2000);
    };

    const SCREEN_WIDTH = Dimensions.get('window').width;

    return (
        <>
            <View style={[customStyles.welcomeScreenContainer, {}]}>
                <ScrollView>
                    <View style={customStyles.welcomeScreenView}>
                        <Image
                            source={IMAGES.ministersGroup}
                            style={{
                                width: theme.sizes.screen.width,
                                height: theme.sizes.screen.height * 0.6,
                            }}
                        />
                        <CustomImage
                            source={IMAGES.png}
                            style={customStyles.welcomeScreenLogo}
                        />
                        <Text style={customStyles.welcomeScreenText}>
                            Experience sermons the way they {'\n'} were meant to
                            be heard, ad-free.{' '}
                        </Text>
                    </View>

                    <View
                        style={[
                            customStyles.mt30,
                            { paddingHorizontal: 10, gap: 20 },
                        ]}
                    >
                        <Button
                            onPress={handleCreateAccount}
                            disabled={isCreatingAccount}
                            isLoading={isCreatingAccount}
                            label="Create Account"
                        />
                        <Button
                            label="Login"
                            isLoading={isLoggingIn}
                            onPress={handleLogin}
                            variant="outline"
                        />
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default IndexScreen;

const styles = StyleSheet.create({}); // This can be empty if no specific styles are needed for this component.
